import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  uploadFrameworkDocument,
  createFrameworkFromUrl,
  createFrameworkFromText,
  getFrameworkDraft,
  updateFrameworkStructure,
  publishFramework,
} from "@/services/frameworkService";
import type { ApiFrameworkDraft, ApiFramework } from "@/types/framework";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ArrowLeft,
  Upload,
  Link2,
  FileText,
  Sparkles,
  Check,
  ChevronRight,
  X,
  File,
  AlertCircle,
  Loader2,
  Search,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  Globe,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Types & Enums ---

type Stage = "UPLOAD" | "PROCESSING" | "EDIT" | "REVIEW";
type UploadMode = "file" | "url" | "text";
interface EvidenceRequirement {
  id: string;
  description: string;
  acceptedFormats: string[];
  isMandatory: boolean;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  evidence: EvidenceRequirement;
}

interface Task {
  id: string;
  title: string;
  description: string;
  actionItems: ActionItem[];
  isExpanded?: boolean;
}

interface Theme {
  id: string;
  name: string;
  tasks: Task[];
  isExpanded?: boolean;
}

interface FrameworkDraft {
  name: string;
  description: string;
  themes: Theme[];
}

// ── API ↔ UI data mappers ────────────────────────────────────────────────────

const mapApiDraftToUiFramework = (draft: ApiFrameworkDraft): FrameworkDraft => {
  const sc = draft.structured_content;
  // If structured_content exists (after a PATCH/save), use it directly.
  if (sc) {
    return {
      name: sc.title,
      description: sc.description ?? "",
      themes: sc.themes.map((t) => ({
        id: t.id,
        name: t.title,
        isExpanded: true,
        tasks: t.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description ?? "",
          isExpanded: false,
          actionItems: task.action_items.map((ai) => ({
            id: ai.id,
            title: ai.title,
            description: ai.description ?? "",
            evidence: {
              id: ai.evidence_specs[0]?.id ?? `ev-${ai.id}`,
              description:
                ai.evidence_specs[0]?.description ??
                ai.evidence_specs[0]?.title ??
                "",
              acceptedFormats: ["PDF"],
              isMandatory: ai.evidence_specs[0]?.required ?? true,
            },
          })),
        })),
      })),
    };
  }

  // Fall back: map the AI raw_ai_output (action_title / evidence_requirements schema)
  // into a single theme so the editor is pre-populated after AI completes.
  const rawTasks = (() => {
    try {
      const aiOutput = draft.raw_ai_output?.ai_output;
      if (!Array.isArray(aiOutput)) return [];
      return aiOutput as Record<string, unknown>[];
    } catch {
      return [];
    }
  })();

  if (rawTasks.length > 0) {
    return {
      name: "Extracted Framework",
      description: "",
      themes: [
        {
          id: `theme-ai-${draft.id}`,
          name: "AI-Extracted Requirements",
          isExpanded: true,
          tasks: rawTasks.map((t, i) => {
            const evidenceList = Array.isArray(t.evidence_requirements)
              ? (t.evidence_requirements as Record<string, unknown>[])
              : [];
            const firstEvidence = evidenceList[0] ?? {};
            const actionItemId = `ai-${draft.id}-${i}`;
            return {
              id: `task-ai-${i}`,
              title: String(t.action_title ?? `Task ${i + 1}`),
              description: String(t.action_description ?? ""),
              isExpanded: false,
              actionItems: [
                {
                  id: actionItemId,
                  title: String(firstEvidence.label ?? "Evidence"),
                  description: String(firstEvidence.description ?? ""),
                  evidence: {
                    id: actionItemId,
                    description: String(firstEvidence.description ?? ""),
                    acceptedFormats: Array.isArray(
                      firstEvidence.accepted_formats,
                    )
                      ? (firstEvidence.accepted_formats as string[])
                      : ["PDF"],
                    isMandatory: Boolean(firstEvidence.required ?? true),
                  },
                },
              ],
            };
          }),
        },
      ],
    };
  }

  return { name: "", description: "", themes: [] };
};

const mapUiFrameworkToApi = (
  ui: FrameworkDraft,
  base?: ApiFrameworkDraft,
): ApiFramework => ({
  id: base?.structured_content?.id ?? crypto.randomUUID(),
  title: ui.name,
  slug:
    base?.structured_content?.slug ??
    ui.name.toLowerCase().replace(/\s+/g, "-"),
  description: ui.description || undefined,
  version: base?.structured_content?.version ?? "1.0.0",
  is_published: false,
  themes: ui.themes.map((t) => ({
    id: t.id,
    title: t.name,
    tasks: t.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      action_items: task.actionItems.map((ai) => ({
        id: ai.id,
        title: ai.title,
        description: ai.description || undefined,
        evidence_specs: ai.evidence
          ? [
              {
                id: ai.evidence.id,
                title: ai.evidence.description,
                description: ai.evidence.description,
                required: ai.evidence.isMandatory,
              },
            ]
          : [],
      })),
    })),
  })),
  created_at: base?.structured_content?.created_at ?? new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// --- Components ---

const Stepper = ({ currentStage }: { currentStage: Stage }) => {
  const stages: { id: Stage; label: string }[] = [
    { id: "UPLOAD", label: "Upload" },
    { id: "PROCESSING", label: "Processing" },
    { id: "EDIT", label: "Verify & Edit" },
    { id: "REVIEW", label: "Review & Publish" },
  ];

  const getStageIndex = (s: Stage) => stages.findIndex((st) => st.id === s);
  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="flex items-center w-full max-w-4xl mx-auto mb-10">
      {stages.map((s, i) => (
        <div key={s.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                i < currentIndex
                  ? "bg-primary border-primary text-primary-foreground"
                  : i === currentIndex
                    ? "bg-background border-primary text-primary shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    : "bg-background border-border text-muted-foreground"
              }`}
            >
              {i < currentIndex ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`absolute top-10 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${
                i <= currentIndex ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < stages.length - 1 && (
            <div
              className={`h-[2px] flex-1 mx-4 transition-all duration-500 ${
                i < currentIndex ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const AdminNewFramework = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id?: string }>();
  const isEditMode = !!editId;
  const { user } = useCurrentUser();
  const canPublish =
    user?.role === "platform_admin" || user?.role === "super_admin";

  const [stage, setStage] = useState<Stage>("UPLOAD");
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [apiDraft, setApiDraft] = useState<ApiFrameworkDraft | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Framework Data State
  const [framework, setFramework] = useState<FrameworkDraft>({
    name: "",
    description: "",
    themes: [],
  });

  // Edit mode: load existing draft and jump straight to EDIT stage
  useEffect(() => {
    if (!isEditMode || !editId) return;
    getFrameworkDraft(editId)
      .then((draft) => {
        setDraftId(draft.id);
        setApiDraft(draft);
        setFramework(mapApiDraftToUiFramework(draft));
        setStage("EDIT");
      })
      .catch(() => {
        toast.error("Failed to load draft. Returning to frameworks list.");
        navigate("/admin/frameworks");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedFile({ name: file.name, size: `${sizeMB} MB` });
  };

  // Stage 1: Upload → real API
  const handleStartExtraction = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    setSubmitError(null);
    try {
      let draft: ApiFrameworkDraft;
      if (uploadMode === "file" && selectedFile) {
        draft = await uploadFrameworkDocument(selectedFile, setUploadProgress);
      } else if (uploadMode === "url") {
        draft = await createFrameworkFromUrl(url);
      } else {
        draft = await createFrameworkFromText(rawText);
      }
      setDraftId(draft.id);
      setApiDraft(draft);
      setStage("PROCESSING");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFrameworkReady = (draft: ApiFrameworkDraft) => {
    setApiDraft(draft);
    setFramework(mapApiDraftToUiFramework(draft));
    setStage("EDIT");
  };

  const handleSaveDraft = async () => {
    if (!draftId || !apiDraft) return;
    try {
      const updated = await updateFrameworkStructure(
        draftId,
        mapUiFrameworkToApi(framework, apiDraft),
      );
      setApiDraft(updated);
      toast.success("Draft saved");
    } catch {
      toast.error("Failed to save draft");
    }
  };

  const handlePublishOrSubmit = async () => {
    if (!draftId) return;
    setIsPublishing(true);
    try {
      if (canPublish) {
        await publishFramework(draftId);
      } else if (apiDraft) {
        // Content contributors save their edits; platform admins publish later.
        await updateFrameworkStructure(
          draftId,
          mapUiFrameworkToApi(framework, apiDraft),
        );
      }
      toast.success(
        canPublish
          ? "Framework published successfully!"
          : "Framework submitted for review!",
      );
      navigate("/admin/frameworks");
    } catch {
      toast.error(
        canPublish
          ? "Failed to publish framework"
          : "Failed to submit for review",
      );
      setIsPublishing(false);
    }
  };

  const isReadyToExtract =
    (uploadMode === "file" && !!selectedFile) ||
    (uploadMode === "url" && url.trim().length > 0) ||
    (uploadMode === "text" && rawText.length > 50);

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300 flex flex-col py-4 pr-4">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/frameworks")}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold font-serif">
              Create New Framework
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                Portal
              </span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                Compliance Intelligence
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Temporary Dev Button */}
          {stage !== "EDIT" && (
            <button
              onClick={() => setStage("EDIT")}
              className="px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-bold hover:bg-indigo-500/20 transition-colors"
            >
              Dev: Skip to Edit UI
            </button>
          )}

          {stage === "EDIT" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-medium text-emerald-500 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Auto-saving...
            </div>
          )}
        </div>
      </div>

      {/* Stepper */}
      <Stepper currentStage={stage} />

      {/* Stage Content */}
      <div className="flex-1 flex flex-col">
        {stage === "UPLOAD" && (
          <div className="max-w-3xl mx-auto w-full mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
              <div className="p-8 border-b border-border bg-muted/30">
                <h2 className="text-xl font-semibold mb-2">
                  Upload source document
                </h2>
                <p className="text-sm text-muted-foreground">
                  Provide the underlying compliance document. Our AI will
                  extract requirements and structure them automatically.
                </p>
              </div>

              <div className="p-8">
                {/* Tabs */}
                <div className="flex p-1 bg-muted rounded-lg mb-8 max-w-sm">
                  {(["file", "url", "text"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setUploadMode(m)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
                        uploadMode === m
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "file" && <Upload className="w-3.5 h-3.5" />}
                      {m === "url" && <Link2 className="w-3.5 h-3.5" />}
                      {m === "text" && <FileText className="w-3.5 h-3.5" />}
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Mode Content */}
                <div className="min-h-[220px]">
                  {uploadMode === "file" && (
                    <>
                      {!uploadedFile ? (
                        <div
                          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-12 px-6 transition-all duration-300 ${
                            isDragging
                              ? "border-primary bg-primary/5"
                              : "border-border bg-muted/20 hover:bg-muted/40"
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleFileSelect(file);
                          }}
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-sm font-medium mb-1">
                            Drag and drop your file here
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            PDF, DOCX, DOC, TXT up to 50MB
                          </p>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-lg bg-background border border-border text-sm font-medium hover:bg-accent transition-colors"
                          >
                            Select File
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(file);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="bg-muted/30 border border-border rounded-xl p-5 flex items-center justify-between animate-in zoom-in-95 duration-200">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-12 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20">
                              <File className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {uploadedFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {uploadedFile.size}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setUploadedFile(null)}
                            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {uploadMode === "url" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          Public Document URL
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="url"
                            placeholder="https://gov.uk/publications/compliance-standard"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        Ensure the URL is publicly accessible.
                        Password-protected pages cannot be fetched.
                      </p>
                    </div>
                  )}

                  {uploadMode === "text" && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Paste Content
                      </label>
                      <textarea
                        rows={8}
                        placeholder="Paste the raw text of the regulation or policy here..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full p-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-mono scrollbar-thin"
                      />
                      <div className="flex justify-between mt-2">
                        <p className="text-[10px] text-muted-foreground">
                          Min. 50 characters required
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {rawText.length} characters
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status & CTA */}
                <div className="mt-10">
                  {submitError && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-red-500 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {submitError}
                    </div>
                  )}
                  {isUploading ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-1">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          <span className="text-sm font-medium">
                            Uploading and normalising...
                          </span>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                          {Math.round(uploadProgress)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      disabled={!isReadyToExtract}
                      onClick={handleStartExtraction}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold transition-all bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-[0.98]"
                    >
                      <Sparkles className="w-5 h-5" />
                      Start AI Extraction
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "PROCESSING" && draftId && (
          <StageProcessing
            draftId={draftId}
            onFrameworkReady={handleFrameworkReady}
          />
        )}

        {stage === "EDIT" && (
          <StageEdit
            framework={framework}
            setFramework={setFramework}
            onNext={() => setStage("REVIEW")}
            onSaveDraft={handleSaveDraft}
            canPublish={canPublish}
            sourceText={apiDraft?.normalized_text ?? null}
          />
        )}

        {stage === "REVIEW" && (
          <StageReview
            framework={framework}
            onPublish={handlePublishOrSubmit}
            isPublishing={isPublishing}
          />
        )}
      </div>
    </div>
  );
};

// --- Sub-components for Stages ---

const StageEdit = ({
  framework,
  setFramework,
  onNext,
  onSaveDraft,
  canPublish,
  sourceText,
}: {
  framework: FrameworkDraft;
  setFramework: (f: FrameworkDraft) => void;
  onNext: () => void;
  onSaveDraft: () => Promise<void>;
  canPublish: boolean;
  sourceText: string | null;
}) => {
  const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(true);
  const [activeQueueTab, setActiveQueueTab] = useState<"low" | "med" | "high">(
    "low",
  );
  const [selectedSubTaskIndex, setSelectedSubTaskIndex] = useState(0);

  const subTasksData = [
    {
      title: "Complete DSL Prevent e-learning or equivalent",
      req: true,
      evidence: [
        {
          title: "Training completion record",
          desc: "Certificate or log — DSL + staff. Date and provider name.",
          req: true,
          validity: "365 days",
          autoStart: true,
        },
        {
          title: "Training needs assessment",
          desc: "Staff list with rationale for inclusion.",
          req: false,
          validity: "365 days",
          autoStart: false,
        },
      ],
    },
    {
      title: "Identify staff requiring Prevent training",
      req: false,
      evidence: [
        {
          title: "Staff identification matrix",
          desc: "Document outlining roles and required training levels.",
          req: false,
          validity: "365 days",
          autoStart: false,
        },
      ],
    },
    {
      title: "Record training completion for all staff",
      req: true,
      evidence: [
        {
          title: "Single Central Record (SCR) extract",
          desc: "Anonymized extract showing training dates.",
          req: true,
          validity: "365 days",
          autoStart: true,
        },
      ],
    },
    {
      title: "Update Prevent risk assessment post-training",
      req: false,
      evidence: [],
    },
  ];

  return (
    <div className="flex-1 flex w-full bg-background overflow-hidden animate-in fade-in duration-500 border-y mt-2">
      {/* Left Sidebar - Review Queue */}
      <div className="w-[250px] shrink-0 border-r border-border bg-card/50 flex flex-col min-h-[calc(100vh-11rem)] overflow-hidden">
        <div className="border-b border-border bg-card sticky top-0 z-10 flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold">Review queue</h2>
              <span className="text-xs text-muted-foreground">27 / 63</span>
            </div>
          </div>
          <div className="flex px-4 gap-6 mt-1">
            <button
              onClick={() => setActiveQueueTab("low")}
              className={`pb-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${activeQueueTab === "low" ? "border-red-500 text-red-500" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Low (2)
            </button>
            <button
              onClick={() => setActiveQueueTab("med")}
              className={`pb-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${activeQueueTab === "med" ? "border-amber-500 text-amber-600 dark:text-amber-500" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Medium (2)
            </button>
            <button
              onClick={() => setActiveQueueTab("high")}
              className={`pb-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${activeQueueTab === "high" ? "border-emerald-500 text-emerald-600 dark:text-emerald-500" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              High (2)
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeQueueTab === "low" && (
            <div className="divide-y divide-border">
              {/* Active Item */}
              <div className="p-4 bg-background border-l-2 border-l-primary cursor-pointer">
                <p className="text-sm font-semibold mb-2 text-foreground">
                  Frequency of Prevent training
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                    38% conf.
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                    pending review
                  </span>
                </div>
              </div>
              {/* Other Items */}
              <div className="p-4 bg-card/50 hover:bg-background cursor-pointer transition-colors">
                <p className="text-sm font-medium mb-2 text-muted-foreground">
                  Online safety policy scope
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    52% conf.
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                    pending review
                  </span>
                </div>
              </div>
            </div>
          )}
          {activeQueueTab === "med" && (
            <div className="divide-y divide-border">
              <div className="p-4 bg-card/50 hover:bg-background cursor-pointer transition-colors">
                <p className="text-sm font-medium mb-2 text-muted-foreground">
                  Safer recruitment checks
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    74% conf.
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                    pending review
                  </span>
                </div>
              </div>
              <div className="p-4 bg-card/50 hover:bg-background cursor-pointer transition-colors">
                <p className="text-sm font-medium mb-2 text-muted-foreground">
                  Staff behavior policy updates
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    78% conf.
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                    pending review
                  </span>
                </div>
              </div>
            </div>
          )}
          {activeQueueTab === "high" && (
            <div className="divide-y divide-border">
              <div className="p-4 bg-card/50 hover:bg-background cursor-pointer transition-colors">
                <p className="text-sm font-medium mb-2 text-muted-foreground">
                  DSL training refresh cadence
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    92% conf.
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                    approved
                  </span>
                </div>
              </div>
              <div className="p-4 bg-card/50 hover:bg-background cursor-pointer transition-colors">
                <p className="text-sm font-medium mb-2 text-muted-foreground">
                  Peer-on-peer harm policy
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    88% conf.
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                    approved
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-background">
        {/* Content Body */}
        <div className="flex items-center gap-3 mt-2 pb-4 px-4">
          <div className="flex-1" />
          <button
            onClick={onNext}
            className="px-3 py-2.5 text-xs bg-[#143425] text-white  font-semibold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
          <button className="px-3 py-2.5  bg-indigo-500/10 text-indigo-600 text-xs font-semibold hover:bg-indigo-500/20 transition-colors">
            Flag for expert
          </button>
          <button className="px-3 py-2.5  bg-red-500/10 text-red-600 text-xs font-semibold hover:bg-red-500/20 transition-colors">
            Reject
          </button>
        </div>
        <div className="p-4 space-y-8 max-w- mx-auo w-full">
          {/* Warning Banner */}
          <div className="p-2 bg-amber-500/5 text-xs border border-amber-500/20 flex items-start gap-3">
            <div className="w-1 h-full bg-amber-500 rounded-full" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <span className="font-bold">Low confidence (38%)</span> — AI
              inferred frequency as "annual" from "will vary depending on
              context." This phrase does not specify a clear frequency. Confirm
              or override before approving.
            </p>
          </div>

          {/* Clause Reference */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Clause Reference
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-red-500/5 text-red-500 text-xs font-semibold border border-red-500/20">
                  KCSIE 2024
                </span>
                {/* <span className="px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-xs font-medium border border-border">
                  Part 1 — All staff
                </span> */}
                <span className="px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-xs font-medium border border-border">
                Section Name/subsection Name
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-xs font-medium border border-border">
                  Principal
                </span>
              </div>
              <button
                onClick={() => setIsSourceOpen(!isSourceOpen)}
                className="px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-colors flex items-center gap-2 border border-primary/10"
              >
                <FileText className="w-3.5 h-3.5" />{" "}
                {isSourceOpen ? "Close source" : "View source"}
              </button>
            </div>
          </div>

          {/* Action Title & Description */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Task
              </h4>
              <p className="text-base font-semibold text-primary">
                Train designated safeguarding lead and relevant staff in Prevent
                awareness
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Description
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
                Ensure the DSL and staff who work with children receive Prevent
                awareness training that is regularly updated to reflect changes
                in local and national risk context.
              </p>
            </div>
          </div>

          {/* Regulatory Frequency */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Regulatory Frequency
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/5 text-red-500 border border-red-500/20 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> CONFIRM REQUIRED
              </span>
            </div>

            <div className="flex gap-6 items-center">
              <div className="flex-1 p-2 bg-red-500/5 border border-red-500/20">
                <p className="text-xs text-red-500 font-semibold mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI inferred: Annual
                </p>
                <p className="text-xs text-red-500/80 italic">
                  "will vary depending on context" — Para 34
                </p>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1.5">
                  Override
                </label>
                <Select defaultValue="annual">
                  <SelectTrigger className="w-full bg-background font-medium">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">
                      Annual (confirm AI inference)
                    </SelectItem>
                    <SelectItem value="biannual">Biannual</SelectItem>
                    <SelectItem value="context">Depends on context</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sub-tasks and Evidence Requirements */}
          <div className="grid grid-cols-2 gap-12 pt-6 border-t border-border/50">
            {/* Sub-Tasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Sub-Tasks
                </h4>
                <button
                  onClick={() => setIsSubTaskModalOpen(true)}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> ADD
                </button>
              </div>
              <ul className="space-y-4">
                {subTasksData.map((st, i) => (
                  <li
                    key={i}
                    onClick={() => setSelectedSubTaskIndex(i)}
                    className={`flex items-start gap-3 p-3 -mx-3 rounded-xl cursor-pointer transition-colors ${selectedSubTaskIndex === i ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/50 border border-transparent"}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-colors ${selectedSubTaskIndex === i ? "bg-primary" : "bg-muted-foreground/30"}`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium mb-1.5 transition-colors ${selectedSubTaskIndex === i ? "text-primary" : "text-foreground"}`}
                      >
                        {st.title}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${st.req ? "bg-red-500/5 border border-red-500/20 text-red-500" : "bg-muted border border-border text-muted-foreground"}`}
                      >
                        {st.req ? "evidence req." : "optional ev."}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence Requirements */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Evidence Requirements
                </h4>
                <button
                  onClick={() => setIsEvidenceModalOpen(true)}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> ADD
                </button>
              </div>
              <div className="space-y-4">
                {subTasksData[selectedSubTaskIndex].evidence.length > 0 ? (
                  subTasksData[selectedSubTaskIndex].evidence.map((ev, i) => (
                    <div
                      key={i}
                      className="space-y-2 p-4 border border-border rounded-xl bg-card/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {ev.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {ev.desc}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 ml-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${ev.req ? "bg-red-500/5 text-red-500 border border-red-500/20" : "bg-amber-500/5 text-amber-600 border border-amber-500/20"}`}
                        >
                          {ev.req ? "required" : "optional"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                          {ev.validity}
                        </span>
                        {ev.autoStart && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            AUTO-START option
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/20 animate-in fade-in duration-300">
                    <p className="text-sm text-muted-foreground font-medium">
                      No evidence requirements linked to this sub-task.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scope & Metadata */}
          <div className="grid grid-cols-4 gap-6 pt-8 border-t border-border/50 pb-8">
            <div className="col-span-2 space-y-3">
              <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Institution Scope
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "All institutions",
                  "FE Colleges",
                  "HE Colleges",
                  "Training providers",
                  "Independent only",
                ].map((scope, i) => (
                  <span
                    key={i}
                    className={`text-[11px] px-3 py-1.5 rounded-lg border ${i < 3 ? "bg-blue-500/5 text-blue-600 border-blue-500/20 font-semibold" : "bg-transparent text-foreground font-medium border-border"}`}
                  >
                    {scope}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Priority
              </h4>
              <Select defaultValue="high">
                <SelectTrigger className="w-full bg-transparent border-none shadow-none px-0 font-semibold hover:bg-muted/50 transition-colors text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Source Text */}
      {isSourceOpen && (
        <div className="w-[250px] shrink-0 border-l border-border bg-card/30 flex flex-col h-full min-h-[calc(100vh-11rem)] overflow-hidden animate-in slide-in-from-right-8 duration-300">
          <div className="p-4 border-b border-border bg-card sticky top-0 z-10 flex items-center justify-between">
            <h2 className="text-sm font-bold">Source — KCSIE 2024</h2>
            <button
              onClick={() => setIsSourceOpen(false)}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Part 1 - All staff - Paragraphs 30-36
                </h3>
                <div className="space-y-4 text-sm text-foreground/80 leading-relaxed font-serif">
                  <p>
                    <strong className="font-bold text-foreground">
                      30. Governing bodies and proprietors
                    </strong>{" "}
                    should ensure that all staff undergo safeguarding and child
                    protection training (including online safety) at induction.
                  </p>
                  <p>...</p>
                  <p>
                    <strong className="font-bold text-foreground">33.</strong>{" "}
                    The designated safeguarding lead should undergo training to
                    provide them with the knowledge and skills required to carry
                    out the role.
                  </p>
                  <p className="p-3 bg-amber-500/10 border-l-4 border-amber-500 text-foreground rounded-r-lg font-medium">
                    <strong className="font-bold">34.</strong> The designated
                    safeguarding lead should undertake Prevent awareness
                    training. This should be regularly updated to reflect
                    changes in local and national risk context.
                  </p>
                  <p>
                    <strong className="font-bold text-foreground">35.</strong>{" "}
                    In addition to the formal training set out above, their
                    knowledge and skills should be refreshed (this might be via
                    e-bulletins, meeting or other communication) at regular
                    intervals, as required, and at least annually, to allow them
                    to understand and keep up with any developments relevant to
                    their role so they are able to continually support and
                    advise staff.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border bg-card flex items-center justify-between">
            <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              &larr; Para 33
            </button>
            <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Para 35 &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Sub-Task Modal */}
      {isSubTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold">Add Sub-Task</h3>
              <button
                onClick={() => setIsSubTaskModalOpen(false)}
                className="p-1 rounded-md hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Enter sub-task title"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-semibold">Evidence Required?</p>
                  <p className="text-[10px] text-muted-foreground">
                    Is documentation mandatory for this?
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  defaultChecked
                />
              </div>
            </div>
            <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-2">
              <button
                onClick={() => setIsSubTaskModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsSubTaskModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg shadow-md hover:opacity-90 transition-opacity"
              >
                Add Sub-Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold">Add Evidence Requirement</h3>
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="p-1 rounded-md hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. Training completion record"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <textarea
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-20"
                  placeholder="Describe the required evidence..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Type
                  </label>
                  <Select defaultValue="required">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="required">Required</SelectItem>
                      <SelectItem value="optional">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    defaultValue={365}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-2">
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg shadow-md hover:opacity-90 transition-opacity"
              >
                Add Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components for Stages ---

const StageReview = ({
  framework,
  onPublish,
  isPublishing,
}: {
  framework: FrameworkDraft;
  onPublish: () => void;
  isPublishing: boolean;
}) => {
  return (
    <div className="max-w-6xl mx-auto w-full mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-8 mb-12">
        <div className="text-center">
          <p className="text-4xl font-serif text-[#1e3a8a] mb-2">63</p>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            task templates
          </p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-serif text-[#059669] mb-2">189</p>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            sub-tasks
          </p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-serif text-[#d97706] mb-2">134</p>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            evidence specs
          </p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-serif text-[#4f46e5] mb-2">12</p>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            themes
          </p>
        </div>
      </div>

      {/* Institution Scope Coverage */}
      <div className="mb-12">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-6 border-b border-border pb-2">
          Institution Scope Coverage
        </h3>
        <div className="grid grid-cols-2 gap-y-8 gap-x-12">
          <div>
            <p className="text-sm font-semibold text-blue-600 mb-1">
              All institutions
            </p>
            <p className="text-sm font-bold mb-0.5">47 tasks</p>
            <p className="text-xs text-muted-foreground">
              Safeguarding, H&S, Prevent core obligations
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-600 mb-1">
              FE colleges + training providers
            </p>
            <p className="text-sm font-bold mb-0.5">8 tasks</p>
            <p className="text-xs text-muted-foreground">
              ESFA-specific, post-16 obligations
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-700 mb-1">
              Boarding schools only
            </p>
            <p className="text-sm font-bold mb-0.5">5 tasks</p>
            <p className="text-xs text-muted-foreground">
              Out-of-hours safeguarding obligations
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-600 mb-1">
              EYFS providers only
            </p>
            <p className="text-sm font-bold mb-0.5">3 tasks</p>
            <p className="text-xs text-muted-foreground">
              Early years-specific welfare duties
            </p>
          </div>
        </div>
      </div>

      {/* Update Diff vs KCSIE 2023 */}
      <div className="mb-12">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-6 border-b border-border pb-2">
          Update Diff VS KCSIE 2023
        </h3>
        <div className="grid grid-cols-3 gap-1">
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-2xl font-serif text-emerald-700 mb-1">+8</p>
            <p className="text-xs text-emerald-700/80 font-medium">
              New tasks added
            </p>
          </div>
          <div className="p-5 bg-amber-500/10 border border-amber-500/20">
            <p className="text-2xl font-serif text-amber-700 mb-1">~14</p>
            <p className="text-xs text-amber-700/80 font-medium">
              Tasks updated
            </p>
          </div>
          <div className="p-5 bg-red-500/10 border border-red-500/20">
            <p className="text-2xl font-serif text-red-700 mb-1">3</p>
            <p className="text-xs text-red-700/80 font-medium">
              Tasks deprecated
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          Existing school task records are not affected — schools will be
          notified and can opt in to the update
        </p>
      </div>

      {/* Publish Conditions */}
      <div className="mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-6 border-b border-border pb-2">
          Publish Conditions
        </h3>
        <div className="space-y-6">
          {[
            "All 63 task templates have human_reviewed = true",
            "All regulatory frequencies confirmed (including low-confidence overrides)",
            "All task titles begin with an approved verb (schema validation passed)",
            "Every task has at least one required evidence specification",
            "Institution scope set on all task templates",
          ].map((condition, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold">{condition}</p>
              </div>
              <span className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 text-[10px] font-bold tracking-widest uppercase">
                passed
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Banner */}
      <div className=" p-6 bg-background border-t border-border z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 bg-emerald-500/5 border border-emerald-500/20 p-4 pl-6 rounded-xl">
          <p className="text-sm text-foreground/80 leading-relaxed font-medium">
            Publishing <strong className="text-foreground">KCSIE 2024</strong>{" "}
            will make 63 task templates available to the classification engine
            within 60 seconds. Schools currently using KCSIE 2023 will be
            notified of the update. This action is irreversible — regulatory
            frequency fields will become immutable on all published tasks.
          </p>
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="shrink-0 px-8 py-3.5 rounded-lg bg-[#143425] text-white font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isPublishing ? "Publishing..." : "Publish framework"}
          </button>
        </div>
      </div>
    </div>
  );
};

const StageProcessing = ({
  draftId,
  onFrameworkReady,
}: {
  draftId: string;
  onFrameworkReady: (draft: ApiFrameworkDraft) => void;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Normalising document",
    "Identifying themes",
    "Extracting tasks",
    "Generating evidence requirements",
  ];

  // Animate steps to reflect perceived progress while polling
  useEffect(() => {
    let stepTimer: ReturnType<typeof setTimeout>;
    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + 0.4));
    }, 100);

    const advanceStep = (index: number) => {
      if (index >= steps.length) return;
      setCurrentStep(index);
      stepTimer = setTimeout(
        () => advanceStep(index + 1),
        4000 + Math.random() * 2000,
      );
    };
    advanceStep(0);

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll backend for completion
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const draft = await getFrameworkDraft(draftId);
        if (
          draft.status === "ready_for_review" ||
          draft.status === "published"
        ) {
          clearInterval(pollInterval);
          setProgress(100);
          setCurrentStep(steps.length);
          setTimeout(() => onFrameworkReady(draft), 800);
        } else if (draft.status === "error") {
          clearInterval(pollInterval);
          setHasError(true);
        }
      } catch {
        // network blip — keep polling
      }
    }, 4000);

    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6">
          <Sparkles className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-3">
          AI is reading your document...
        </h2>
        <p className="text-muted-foreground">
          This usually takes 20–60 seconds. We are structuring the requirements
          into themes and tasks.
        </p>
      </div>

      <div className="w-full space-y-8 bg-card border border-border p-10 rounded-2xl shadow-sm">
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div
                className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-500 ${
                  i < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : i === currentStep && !hasError
                      ? "border-primary animate-pulse"
                      : hasError && i === currentStep
                        ? "border-red-500 bg-red-500/10"
                        : "border-border"
                }`}
              >
                {i < currentStep ? (
                  <Check className="w-3.5 h-3.5" />
                ) : i === currentStep && !hasError ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                ) : hasError && i === currentStep ? (
                  <X className="w-3.5 h-3.5 text-red-500" />
                ) : null}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-500 ${
                  i <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
              {i === currentStep && !hasError && (
                <Loader2 className="w-3 h-3 text-primary animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
            <span>Overall Progress</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${hasError ? "bg-red-500" : "bg-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {hasError && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm font-medium text-red-500">
                Extraction failed. Please try again.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Retry extraction
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-3 h-3 animate-spin" />
        Normalising data structures and identifying compliance nodes...
      </p>
    </div>
  );
};

export default AdminNewFramework;
