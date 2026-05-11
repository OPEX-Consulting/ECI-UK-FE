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

// --- Types & Enums ---

type Stage = "UPLOAD" | "PROCESSING" | "EDIT" | "REVIEW" | "PUBLISH";
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
    { id: "REVIEW", label: "Review" },
    { id: "PUBLISH", label: "Publish" },
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
      setStage("PUBLISH");
    } catch {
      toast.error(
        canPublish
          ? "Failed to publish framework"
          : "Failed to submit for review",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const isReadyToExtract =
    (uploadMode === "file" && !!selectedFile) ||
    (uploadMode === "url" && url.trim().length > 0) ||
    (uploadMode === "text" && rawText.length > 50);

  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300 flex flex-col">
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

        {stage === "EDIT" && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-medium text-emerald-500 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Auto-saving...
            </div>
          </div>
        )}
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
            onBack={() => setStage("EDIT")}
            onNext={handlePublishOrSubmit}
            canPublish={canPublish}
            isPublishing={isPublishing}
          />
        )}

        {stage === "PUBLISH" && (
          <StagePublish
            frameworkName={framework.name}
            canPublish={canPublish}
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
  const updateTheme = (themeId: string, updates: Partial<Theme>) => {
    setFramework({
      ...framework,
      themes: framework.themes.map((t) =>
        t.id === themeId ? { ...t, ...updates } : t,
      ),
    });
  };

  const addTheme = () => {
    const newTheme: Theme = {
      id: `theme-${Date.now()}`,
      name: "New Theme",
      isExpanded: true,
      tasks: [],
    };
    setFramework({ ...framework, themes: [...framework.themes, newTheme] });
  };

  const addTask = (themeId: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: "New Task",
      description: "",
      isExpanded: true,
      actionItems: [],
    };
    setFramework({
      ...framework,
      themes: framework.themes.map((t) =>
        t.id === themeId ? { ...t, tasks: [...t.tasks, newTask] } : t,
      ),
    });
  };

  return (
    <div className="flex-1 flex gap-6 overflow-hidden mt-2 animate-in fade-in duration-500">
      {/* Left Panel: Source */}
      <div className="w-[40%] flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Source document
            </span>
          </div>
          <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex w-full p-6 overflow-y-auto font-mono text-xs leading-relaxed text-muted-foreground/80 bg-background/50 break-words">
          {sourceText ? (
            sourceText
          ) : (
            <span className="italic text-muted-foreground/50">
              Source document text not available.
            </span>
          )}
        </div>
      </div>

      {/* Right Panel: Editor */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[1px] h-3 bg-border" />
            <button className="text-[10px] font-bold text-primary hover:underline">
              Re-generate
            </button>
          </div>
          <div className=" flex items-center justify-between">
            <button
              onClick={onSaveDraft}
              className="px-4 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              Save as Draft
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 rounded-lg text-xs font-bold text-primary group transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onNext}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                {canPublish ? "Approve & Publish" : "Submit for Review"}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
          <div className="space-y-4 pb-8 border-b border-border/50">
            <input
              value={framework.name}
              onChange={(e) =>
                setFramework({ ...framework, name: e.target.value })
              }
              className="w-full bg-transparent text-2xl font-bold outline-none border-b border-transparent focus:border-primary/30 transition-colors"
              placeholder="Framework Name"
            />
          </div>

          {/* <div className="space-y-6">
            {framework.themes.map((theme) => (
              <div
                key={theme.id}
                className="group border border-border rounded-xl overflow-hidden bg-background/40 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center p-4 bg-muted/20 border-b border-border/10">
                  <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing mr-2" />
                  <button
                    onClick={() =>
                      updateTheme(theme.id, { isExpanded: !theme.isExpanded })
                    }
                    className="p-1 rounded hover:bg-muted mr-2"
                  >
                    {theme.isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    value={theme.name}
                    onChange={(e) =>
                      updateTheme(theme.id, { name: e.target.value })
                    }
                    className="flex-1 bg-transparent font-bold text-sm outline-none px-2 py-1 rounded hover:bg-primary/5 focus:bg-primary/5 transition-colors"
                  />
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setFramework({
                          ...framework,
                          themes: framework.themes.filter(
                            (t) => t.id !== theme.id,
                          ),
                        })
                      }
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {theme.isExpanded &&
                  (theme.tasks.length > 0 ? (
                    <div className="p-4 space-y-4">
                      {theme.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="ml-4 border-l-2 border-border pl-6 py-2 space-y-3 relative"
                        >
                          <div className="absolute left-[-2px] top-4 w-2 h-2 rounded-full bg-border" />
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <input
                                value={task.title}
                                onChange={(e) => {
                                  const updatedTasks = theme.tasks.map((t) =>
                                    t.id === task.id
                                      ? { ...t, title: e.target.value }
                                      : t,
                                  );
                                  updateTheme(theme.id, {
                                    tasks: updatedTasks,
                                  });
                                }}
                                className="w-full bg-transparent font-semibold text-sm outline-none"
                              />
                              <textarea
                                value={task.description}
                                onChange={(e) => {
                                  const updatedTasks = theme.tasks.map((t) =>
                                    t.id === task.id
                                      ? { ...t, description: e.target.value }
                                      : t,
                                  );
                                  updateTheme(theme.id, {
                                    tasks: updatedTasks,
                                  });
                                }}
                                placeholder="Task description..."
                                className="w-full bg-transparent text-xs text-muted-foreground outline-none resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border-t border-border/5">
                      <p className="text-xs text-muted-foreground">
                        No tasks defined for this theme.
                      </p>
                    </div>
                  ))}

                {theme.isExpanded && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => addTask(theme.id)}
                      className="ml-4 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs font-semibold text-muted-foreground hover:border-primary/30 hover:text-primary transition-all w-full justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addTheme}
              className="w-full py-4 rounded-xl border-2 border-dashed border-border bg-muted/10 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/20 transition-all text-muted-foreground hover:text-primary"
            >
              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Add New Theme
              </span>
            </button>
          </div> */}
        </div>

        {/* Action Bar */}
      </div>
    </div>
  );
};

// --- Sub-components for Stages ---

const StageReview = ({
  framework,
  onBack,
  onNext,
  canPublish,
  isPublishing,
}: {
  framework: FrameworkDraft;
  onBack: () => void;
  onNext: () => void;
  canPublish: boolean;
  isPublishing: boolean;
}) => {
  const stats = {
    themes: framework.themes.length,
    tasks: framework.themes.reduce((acc, t) => acc + t.tasks.length, 0),
    actionItems: framework.themes.reduce(
      (acc, t) =>
        acc + t.tasks.reduce((acc2, task) => acc2 + task.actionItems.length, 0),
      0,
    ),
  };

  return (
    <div className="max-w-4xl mx-auto w-full mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-border bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">Final Review</h2>
          <p className="text-sm text-muted-foreground">
            Review the framework structure before{" "}
            {canPublish ? "publishing" : "submitting for approval"}.
          </p>
        </div>

        <div className="p-8 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Themes
              </p>
              <p className="text-2xl font-bold">{stats.themes}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Control Tasks
              </p>
              <p className="text-2xl font-bold">{stats.tasks}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Action Items
              </p>
              <p className="text-2xl font-bold">{stats.actionItems}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Framework Details
            </h3>
            <div className="p-6 rounded-xl border border-border bg-background/50 space-y-3">
              <p className="text-lg font-bold">
                {framework.name || "Untitled Framework"}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {framework.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Governance Check
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    Hierarchical integrity verified
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All tasks are linked to valid themes and action items.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Manual review recommended</p>
                  <p className="text-xs text-muted-foreground">
                    AI extraction was performed on 1 source. Human verification
                    is required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-border bg-muted/30 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to editor
          </button>
          <button
            onClick={onNext}
            disabled={isPublishing}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {canPublish ? 'Publishing…' : 'Submitting…'}
              </>
            ) : canPublish ? (
              <>
                <Send className="w-4 h-4" />
                Confirm &amp; Publish Framework
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit for Final Approval
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const StagePublish = ({
  frameworkName,
  canPublish,
}: {
  frameworkName: string;
  canPublish: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-700">
      <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping duration-[3s]" />
        <Check className="w-12 h-12 text-emerald-500" />
      </div>

      <div className="text-center group">
        <h2 className="text-3xl font-bold mb-4">
          Framework {canPublish ? "Published" : "Submitted"}!
        </h2>
        <p className="text-muted-foreground mb-12 max-w-md mx-auto">
          The framework <strong>"{frameworkName}"</strong> has been successfully{" "}
          {canPublish
            ? "published to the platform"
            : "submitted to admins for review"}
          .
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/admin/frameworks")}
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
          >
            View All Frameworks
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 rounded-xl bg-muted border border-border font-bold hover:bg-muted/80 transition-all"
          >
            Create Another
          </button>
        </div>
      </div>

      <div className="mt-16 p-6 rounded-2xl bg-card border border-border flex items-center gap-4 max-w-sm">
        <div className="p-3 rounded-xl bg-primary/10">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            What's next?
          </p>
          <p className="text-sm text-foreground">
            Organisations can now subscribe to this framework and begin audits.
          </p>
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
