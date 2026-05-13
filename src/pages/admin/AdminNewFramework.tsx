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
  synthesizeTasks,
  refineFrameworkObligations,
} from "@/services/frameworkService";
import type {
  ApiClauseTags,
  ApiFrameworkDraft,
  ApiFramework,
  ApiFrequencyMetadata,
  ApiTaskMetadata,
} from "@/types/framework";
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

type Stage = "UPLOAD" | "PROCESSING" | "OBLIGATION_SELECT" | "SYNTHESIZING" | "EDIT" | "REVIEW";
type UploadMode = "file" | "url" | "text";
interface EvidenceRequirement {
  id: string;
  title: string;
  description: string;
  acceptedFormats: string[];
  isMandatory: boolean;
  expiryDays?: number | null;
  autoStart?: boolean;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  evidence: EvidenceRequirement;
}

interface SubTask {
  id: string;
  title: string;
  description: string;
  evidenceRequired: boolean;
  displayOrder: number;
  evidenceRequirements: EvidenceRequirement[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  actionItems: ActionItem[];
  evidenceRequirements: EvidenceRequirement[];
  subTasks: SubTask[];
  clauseTags?: ApiClauseTags | null;
  institutionScope: string[];
  frequency?: ApiFrequencyMetadata | null;
  meta?: ApiTaskMetadata | null;
  reviewStatus: string;
  confidenceScore?: number | null;
  sourceText?: string | null;
  aiReviewNotes?: string | null;
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

const mapApiEvidenceToUi = (ev: {
  id: string;
  title?: string;
  description?: string | null;
  required?: boolean;
  accepted_formats?: string[];
  expiry_days?: number | null;
  auto_start?: boolean;
}): EvidenceRequirement => ({
  id: ev.id,
  title: ev.title ?? "Evidence",
  description: ev.description ?? ev.title ?? "",
  acceptedFormats: ev.accepted_formats ?? [],
  isMandatory: ev.required ?? true,
  expiryDays: ev.expiry_days ?? null,
  autoStart: ev.auto_start ?? false,
});

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
          evidenceRequirements: (task.evidence_requirements ?? []).map(
            mapApiEvidenceToUi,
          ),
          subTasks: (task.sub_tasks ?? []).map((st) => ({
            id: st.id,
            title: st.title,
            description: st.description ?? "",
            evidenceRequired: st.evidence_required || (st.evidence_requirements ?? []).length > 0,
            displayOrder: st.display_order,
            evidenceRequirements: (st.evidence_requirements ?? []).map(
              mapApiEvidenceToUi,
            ),
          })),
          clauseTags: task.clause_tags,
          institutionScope: task.institution_scope ?? [],
          frequency: task.frequency,
          meta: task.meta,
          reviewStatus: task.review_status ?? "pending_review",
          confidenceScore: task.confidence_score,
          sourceText: task.source_text,
          aiReviewNotes: task.ai_review_notes,
          actionItems: task.action_items.map((ai) => ({
            id: ai.id,
            title: ai.title,
            description: ai.description ?? "",
            evidence: {
              id: ai.evidence_specs[0]?.id ?? `ev-${ai.id}`,
              title: ai.evidence_specs[0]?.title ?? "Evidence",
              description:
                ai.evidence_specs[0]?.description ??
                ai.evidence_specs[0]?.title ??
                "",
              acceptedFormats: ai.evidence_specs[0]?.accepted_formats ?? [],
              isMandatory: ai.evidence_specs[0]?.required ?? true,
              expiryDays: ai.evidence_specs[0]?.expiry_days ?? null,
              autoStart: ai.evidence_specs[0]?.auto_start ?? false,
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
            const rawSubTasks = Array.isArray(t.sub_tasks)
              ? (t.sub_tasks as Record<string, unknown>[])
              : [];
            return {
              id: `task-ai-${i}`,
              title: String(t.action_title ?? `Task ${i + 1}`),
              description: String(t.action_description ?? ""),
              isExpanded: false,
              subTasks: rawSubTasks.map((st, stIndex) => ({
                id: `sub-${draft.id}-${i}-${stIndex}`,
                title: String(st.action_title ?? st.title ?? `Step ${stIndex + 1}`),
                description: String(st.description ?? ""),
                evidenceRequired: Boolean(
                  st.evidence_required ||
                  (Array.isArray(st.evidence_requirements) && st.evidence_requirements.length > 0),
                ),
                displayOrder:
                  typeof st.display_order === "number"
                    ? st.display_order
                    : stIndex + 1,
                evidenceRequirements: Array.isArray(st.evidence_requirements)
                  ? (st.evidence_requirements as Record<string, unknown>[]).map((ev, evIndex) => ({
                      id: `ev-${draft.id}-${i}-${stIndex}-${evIndex}`,
                      title: String(ev.label ?? ev.title ?? "Evidence"),
                      description: String(ev.description ?? ""),
                      acceptedFormats: Array.isArray(ev.accepted_formats)
                        ? (ev.accepted_formats as string[])
                        : [],
                      isMandatory: Boolean(ev.required ?? true),
                      expiryDays:
                        typeof ev.expiry_days === "number"
                          ? ev.expiry_days
                          : null,
                      autoStart: Boolean(ev.auto_start ?? false),
                    }))
                  : [],
              })),
              evidenceRequirements: [],
              clauseTags: (t.clause_tags as ApiClauseTags) ?? null,
              institutionScope: Array.isArray(t.institution_scope)
                ? (t.institution_scope as string[])
                : [],
              frequency: (t.frequency as ApiFrequencyMetadata) ?? null,
              meta: (t.meta as ApiTaskMetadata) ?? null,
              reviewStatus: "pending_review",
              confidenceScore:
                typeof t.confidence_score === "number"
                  ? t.confidence_score
                  : null,
              sourceText: String(t.original_text ?? t.source_text ?? ""),
              aiReviewNotes: "",
              actionItems: [],
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
      evidence_requirements: [],
      sub_tasks: task.subTasks.map((st) => ({
        id: st.id,
        title: st.title,
        description: st.description || undefined,
        evidence_required: st.evidenceRequired,
        display_order: st.displayOrder,
        evidence_requirements: st.evidenceRequirements.map((ev) => ({
          id: ev.id,
          title: ev.title,
          description: ev.description || undefined,
          required: ev.isMandatory,
          expiry_days: ev.expiryDays ?? null,
          accepted_formats: ev.acceptedFormats,
          auto_start: ev.autoStart ?? false,
        })),
      })),
      clause_tags: task.clauseTags ?? null,
      institution_scope: task.institutionScope,
      frequency: task.frequency ?? null,
      meta: task.meta ?? null,
      review_status: task.reviewStatus,
      confidence_score: task.confidenceScore ?? null,
      source_text: task.sourceText ?? null,
      ai_review_notes: task.aiReviewNotes ?? null,
      action_items: task.actionItems.map((ai) => ({
        id: ai.id,
        title: ai.title,
        description: ai.description || undefined,
        evidence_specs: ai.evidence
          ? [
              {
                id: ai.evidence.id,
                title: ai.evidence.title,
                description: ai.evidence.description,
                required: ai.evidence.isMandatory,
                expiry_days: ai.evidence.expiryDays ?? null,
                accepted_formats: ai.evidence.acceptedFormats,
                auto_start: ai.evidence.autoStart ?? false,
              },
            ]
          : [],
      })),
    })),
  })),
  created_at: base?.structured_content?.created_at ?? new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const hasExtractedObligations = (draft: ApiFrameworkDraft): boolean =>
  Array.isArray(draft.raw_ai_output?.obligations) &&
  draft.raw_ai_output.obligations.length > 0;

const getResumeStage = (draft: ApiFrameworkDraft): Stage => {
  if (draft.status === "pending_obligation_selection") return "OBLIGATION_SELECT";
  if (draft.status === "synthesizing_tasks") return "SYNTHESIZING";
  if (draft.status === "ready_for_review" || draft.status === "published") return "EDIT";
  if (draft.structured_content) return "EDIT";
  if (draft.status === "error" && hasExtractedObligations(draft)) return "OBLIGATION_SELECT";
  return "PROCESSING";
};

// --- Components ---

const Stepper = ({ currentStage }: { currentStage: Stage }) => {
  const stages: { id: Stage; label: string }[] = [
    { id: "UPLOAD", label: "Upload" },
    { id: "PROCESSING", label: "Extract Obligations" },
    { id: "SYNTHESIZING", label: "Generate Tasks" },
    { id: "EDIT", label: "Verify & Edit" },
    { id: "REVIEW", label: "Review & Publish" },
  ];

  const getStageIndex = (s: Stage) => {
    if (s === "UPLOAD") return 0;
    if (s === "PROCESSING" || s === "OBLIGATION_SELECT") return 1;
    if (s === "SYNTHESIZING") return 2;
    if (s === "EDIT") return 3;
    if (s === "REVIEW") return 4;
    return 0;
  };
  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="flex items-center w-full max-w-5xl mx-auto mb-10">
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
  const [isLoadingExistingDraft, setIsLoadingExistingDraft] = useState(isEditMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Framework Data State
  const [framework, setFramework] = useState<FrameworkDraft>({
    name: "",
    description: "",
    themes: [],
  });

  // Edit mode: load existing draft and resume at the correct stage.
  useEffect(() => {
    if (!isEditMode || !editId) return;
    setIsLoadingExistingDraft(true);
    getFrameworkDraft(editId)
      .then((draft) => {
        setDraftId(draft.id);
        setApiDraft(draft);
        setFramework(mapApiDraftToUiFramework(draft));
        setStage(getResumeStage(draft));
      })
      .catch(() => {
        toast.error("Failed to load draft. Returning to frameworks list.");
        navigate("/admin/frameworks");
      })
      .finally(() => {
        setIsLoadingExistingDraft(false);
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

  if (isLoadingExistingDraft) {
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center py-4 pr-4">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading framework draft...
        </div>
      </div>
    );
  }

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
            onPhase1Complete={(d) => {
              setApiDraft(d);
              setStage("OBLIGATION_SELECT");
            }}
          />
        )}

        {stage === "OBLIGATION_SELECT" && apiDraft && (
          <StageObligationSelect
            draft={apiDraft}
            onSynthesize={(draft) => {
              setDraftId(draft.id);
              setApiDraft(draft);
              setStage("SYNTHESIZING");
            }}
            onRefine={(draft) => {
              setDraftId(draft.id);
              setApiDraft(draft);
              setStage("PROCESSING");
            }}
          />
        )}

        {stage === "SYNTHESIZING" && draftId && (
          <StageProcessing
            draftId={draftId}
            isPhase2={true}
            onPhase2Complete={handleFrameworkReady}
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

const getConfidenceBand = (task: Task): "low" | "med" | "high" => {
  const frequencyConfidence = task.frequency?.reg_confidence;
  const score = task.confidenceScore;
  if (typeof score !== "number") {
    if (frequencyConfidence === "low") return "low";
    if (frequencyConfidence === "high") return "high";
    return "med";
  }
  if (frequencyConfidence === "low" && score >= 0.6) return "med";
  if (score < 0.6) return "low";
  if (score < 0.85) return "med";
  return "high";
};

const formatConfidence = (task: Task): string => {
  if (typeof task.confidenceScore !== "number") {
    if (task.frequency?.reg_confidence === "low") return "low conf.";
    if (task.frequency?.reg_confidence === "high") return "high conf.";
    return "med conf.";
  }
  return `${Math.round(task.confidenceScore * 100)}% conf.`;
};

const formatScope = (scope: string): string =>
  scope
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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
  const [isSourceOpen, setIsSourceOpen] = useState(false); // Closed by default for cleaner UI
  const [activeQueueTab, setActiveQueueTab] = useState<"all" | "low" | "med" | "high">("all");
  const [selectedSubTaskIndex, setSelectedSubTaskIndex] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const reviewTasks = framework.themes.flatMap((theme) => theme.tasks);
  const queueGroups = {
    all: reviewTasks,
    low: reviewTasks.filter((task) => getConfidenceBand(task) === "low"),
    med: reviewTasks.filter((task) => getConfidenceBand(task) === "med"),
    high: reviewTasks.filter((task) => getConfidenceBand(task) === "high"),
  };
  const visibleQueue = queueGroups[activeQueueTab];
  
  const selectedTask = reviewTasks.find((task) => task.id === selectedTaskId) ?? visibleQueue[0] ?? reviewTasks[0];
  
  const selectedSubTasks = selectedTask?.subTasks ?? [];
  const selectedSubTask = selectedSubTasks[selectedSubTaskIndex];
  const selectedEvidence = selectedSubTask?.evidenceRequirements ?? [];
  
  const confidenceBand = selectedTask ? getConfidenceBand(selectedTask) : "low";
  const confidenceValue = selectedTask?.confidenceScore 
    ? Math.round(selectedTask.confidenceScore * 100) 
    : (confidenceBand === 'high' ? 90 : confidenceBand === 'med' ? 70 : 40);

  useEffect(() => {
    if (!selectedTask && reviewTasks.length > 0) {
      setSelectedTaskId(reviewTasks[0].id);
    }
  }, [reviewTasks, selectedTask]);

  useEffect(() => {
    setSelectedSubTaskIndex(0);
  }, [selectedTask?.id]);

  const updateSelectedTask = (updates: Partial<Task>) => {
    if (!selectedTask) return;
    setFramework({
      ...framework,
      themes: framework.themes.map((theme) => ({
        ...theme,
        tasks: theme.tasks.map((task) =>
          task.id === selectedTask.id ? { ...task, ...updates } : task,
        ),
      })),
    });
  };

  const hasTasks = reviewTasks.length > 0;

  return (
    <div className="flex-1 flex w-full bg-background overflow-hidden animate-in fade-in duration-500 border-y mt-2">
      {/* Left Sidebar - Review Queue */}
      <div className="w-[280px] shrink-0 border-r border-border bg-muted/10 flex flex-col min-h-[calc(100vh-11rem)] overflow-hidden">
        <div className="border-b border-border bg-card sticky top-0 z-10 flex flex-col">
          <div className="p-4 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Generated Tasks
              </h2>
            </div>
            {hasTasks && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {reviewTasks.filter((task) => task.reviewStatus === "approved").length} / {reviewTasks.length} Done
              </span>
            )}
          </div>
          <div className="flex px-4 gap-4 mt-2">
            {(["all", "low", "med", "high"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveQueueTab(tab)}
                className={`pb-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeQueueTab === tab
                    ? tab === "low" ? "border-rose-500 text-rose-500"
                    : tab === "med" ? "border-amber-500 text-amber-600 dark:text-amber-500"
                    : tab === "high" ? "border-emerald-500 text-emerald-600 dark:text-emerald-500"
                    : "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab} ({queueGroups[tab].length})
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-muted/5">
          <div className="divide-y divide-border/50">
            {visibleQueue.length > 0 ? (
              visibleQueue.map((task) => {
                const isActive = task.id === selectedTask?.id;
                const band = getConfidenceBand(task);
                const score = task.confidenceScore ? Math.round(task.confidenceScore * 100) : (band === 'high' ? 90 : band === 'med' ? 70 : 40);
                
                return (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`w-full text-left p-4 cursor-pointer transition-all ${
                      isActive
                        ? "bg-background border-l-4 border-l-primary shadow-sm"
                        : "bg-transparent hover:bg-muted/50 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className={`text-xs line-clamp-2 pr-2 ${isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                        {task.title || "Untitled Task"}
                      </p>
                      {task.reviewStatus === "approved" && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />}
                      {task.reviewStatus === "rejected" && <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${band === 'low' ? 'bg-rose-500' : band === 'med' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className={`text-[9px] font-bold ${band === 'low' ? 'text-rose-500' : band === 'med' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {score}%
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center">
                <p className="text-xs text-muted-foreground font-medium">No tasks found in this view.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-card shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
        {!hasTasks || !selectedTask ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6 border border-border shadow-inner">
              <Sparkles className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No tasks to review</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Extract requirements from a source document first. 
              The AI will automatically populate this queue with identified compliance obligations.
            </p>
          </div>
        ) : (
          <>
            {/* Header / Action Bar */}
            <div className="flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                  confidenceBand === "low" ? "bg-rose-500/10 border-rose-500/20 text-rose-600" :
                  confidenceBand === "med" ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400" :
                  "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                }`}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {confidenceBand === "low" ? "Low Confidence" : confidenceBand === "med" ? "Medium Confidence" : "High Confidence"}
                  </span>
                  <span className="text-xs font-bold pl-2 border-l border-current/20 opacity-80">{confidenceValue}%</span>
                </div>
                
                {selectedTask.reviewStatus !== "pending_review" && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    selectedTask.reviewStatus === "approved" ? "bg-emerald-500 text-white" :
                    selectedTask.reviewStatus === "rejected" ? "bg-rose-500 text-white" :
                    "bg-indigo-500 text-white"
                  }`}>
                    {selectedTask.reviewStatus.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSourceOpen(!isSourceOpen)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 border ${
                    isSourceOpen 
                      ? "bg-primary/10 text-primary border-primary/20" 
                      : "bg-background text-foreground border-border hover:bg-muted"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> 
                  {isSourceOpen ? "Hide Source Text" : "View Source Text"}
                </button>
                <div className="w-px h-6 bg-border mx-2" />
                <button
                  onClick={() => updateSelectedTask({ reviewStatus: "rejected" })}
                  className="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/10 text-xs font-bold hover:bg-rose-500/20 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateSelectedTask({ reviewStatus: "flagged" })}
                  className="px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-600 border border-indigo-500/10 text-xs font-bold hover:bg-indigo-500/20 transition-colors"
                >
                  Flag
                </button>
                <button
                  onClick={() => updateSelectedTask({ 
                    reviewStatus: "approved",
                    meta: selectedTask?.meta ? { ...selectedTask.meta, human_reviewed: true } : undefined
                  })}
                  className="px-4 py-2 rounded-lg bg-[#143425] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
              </div>
            </div>

            <ScrollArea className="flex-1 px-6 py-6">
              <div className="max-w-4xl space-y-8 pb-20">
                
                {/* Editable Task Title & Description */}
                <div className="space-y-6 bg-background rounded-2xl p-6 border border-border shadow-sm">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center justify-between">
                      Task Title
                      <span className="text-primary/50 normal-case tracking-normal font-medium text-xs">Editable</span>
                    </label>
                    <input
                      value={selectedTask.title}
                      onChange={(e) => updateSelectedTask({ title: e.target.value })}
                      className="w-full text-lg font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:ring-0 px-0 py-1 transition-colors outline-none"
                      placeholder="Enter task title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center justify-between">
                      Action Description
                      <span className="text-primary/50 normal-case tracking-normal font-medium text-xs">Editable</span>
                    </label>
                    <textarea
                      value={selectedTask.description}
                      onChange={(e) => updateSelectedTask({ description: e.target.value })}
                      className="w-full text-sm text-foreground/80 leading-relaxed bg-transparent border border-transparent hover:border-border focus:border-primary rounded-lg p-2 -ml-2 transition-colors outline-none resize-none h-24 custom-scrollbar"
                      placeholder="Describe what needs to be done..."
                    />
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Regulatory Frequency */}
                  <div className="bg-background rounded-2xl p-5 border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        Frequency
                      </h4>
                      {selectedTask.frequency?.reg_confidence === "low" && (
                        <span className="text-[9px] font-bold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full border border-rose-500/20">
                          Verify Required
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Inferred
                        </p>
                        <p className="text-sm font-semibold capitalize">
                          {selectedTask.frequency?.reg_type ? formatScope(selectedTask.frequency.reg_type) : "Unknown"}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1.5 block">
                          Final Selection
                        </label>
                        <Select 
                          value={selectedTask.frequency?.reg_type ?? "unknown"}
                          onValueChange={(val) => updateSelectedTask({ 
                            frequency: { ...(selectedTask.frequency || {}), reg_type: val, reg_confidence: "high" } 
                          })}
                        >
                          <SelectTrigger className="w-full bg-background border-border text-sm">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="termly">Termly</SelectItem>
                            <SelectItem value="half_termly">Half termly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="event_based">Event based</SelectItem>
                            <SelectItem value="per_academic_year">Per academic year</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Scope & Priority */}
                  <div className="bg-background rounded-2xl p-5 border border-border shadow-sm space-y-5 flex flex-col">
                    <div className="space-y-2 flex-1">
                      <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        Institution Scope
                      </h4>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(selectedTask?.institutionScope?.length ? selectedTask.institutionScope : ["general"]).map((scope, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-semibold capitalize"
                          >
                            {formatScope(scope)}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        Task Priority
                      </h4>
                      <Select 
                        value={selectedTask?.meta?.priority ?? "medium"}
                        onValueChange={(val) => updateSelectedTask({ 
                          meta: { ...(selectedTask.meta || {}), priority: val } 
                        })}
                      >
                        <SelectTrigger className="w-full bg-background border-border text-sm">
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

                {/* Sub-tasks and Evidence Requirements */}
                <div className="grid grid-cols-2 gap-8 pt-4">
                  {/* Sub-Tasks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                        Sub-Tasks <span className="px-1.5 py-0.5 rounded-full bg-muted text-[9px]">{selectedSubTasks.length}</span>
                      </h4>
                      <button
                        onClick={() => setIsSubTaskModalOpen(true)}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> ADD
                      </button>
                    </div>
                    
                    <ul className="space-y-3">
                      {selectedSubTasks.length > 0 ? selectedSubTasks.map((st, i) => (
                        <li
                          key={i}
                          onClick={() => setSelectedSubTaskIndex(i)}
                          className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                            selectedSubTaskIndex === i 
                              ? "bg-primary/5 border-primary/20 shadow-sm" 
                              : "bg-background border-border hover:border-primary/30"
                          }`}
                        >
                          <div className={`w-5 h-5 shrink-0 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                            selectedSubTaskIndex === i ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold mb-1 leading-snug ${
                              selectedSubTaskIndex === i ? "text-primary" : "text-foreground"
                            }`}>
                              {st.title}
                            </p>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              st.evidenceRequired ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" : "bg-muted text-muted-foreground"
                            }`}>
                              {st.evidenceRequired ? "Evidence Required" : "No Evidence"}
                            </span>
                          </div>
                        </li>
                      )) : (
                        <li className="p-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl bg-muted/10">
                          No sub-tasks defined.
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Evidence Requirements */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                        Evidence Req. <span className="px-1.5 py-0.5 rounded-full bg-muted text-[9px]">{selectedEvidence.length}</span>
                      </h4>
                      <button
                        onClick={() => setIsEvidenceModalOpen(true)}
                        disabled={!selectedSubTask}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
                      >
                        <Plus className="w-3 h-3" /> ADD
                      </button>
                    </div>
                    {selectedSubTask && (
                      <p className="text-xs text-muted-foreground">
                        Evidence for: <span className="font-semibold text-foreground">{selectedSubTask.title}</span>
                      </p>
                    )}
                    
                    <div className="space-y-3">
                      {selectedEvidence.length > 0 ? (
                        selectedEvidence.map((ev, i) => (
                          <div
                            key={i}
                            className="p-4 border border-border rounded-xl bg-background shadow-sm space-y-2 transition-all hover:border-primary/30"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-sm font-bold text-foreground leading-snug">
                                {ev.title}
                              </p>
                              <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                ev.isMandatory ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              }`}>
                                {ev.isMandatory ? "Mandatory" : "Optional"}
                              </span>
                            </div>
                            {ev.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {ev.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 mt-2">
                              {ev.expiryDays && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                  Valid: {ev.expiryDays} days
                                </span>
                              )}
                              {ev.autoStart && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  Auto-start enabled
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/10">
                          <p className="text-sm text-muted-foreground font-medium">
                            No evidence linked to this task.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </ScrollArea>
          </>
        )}
        
        {/* Bottom Bar: Save & Next */}
        <div className="p-4 bg-card border-t border-border flex items-center justify-between sticky bottom-0 z-10">
          <button
            onClick={onSaveDraft}
            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          
          <button
            onClick={onNext}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
          >
            Review & Publish <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Sidebar - Source Text */}
      {isSourceOpen && hasTasks && (
        <div className="w-[320px] shrink-0 border-l border-border bg-card/30 flex flex-col h-full overflow-hidden animate-in slide-in-from-right-8 duration-300 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.05)] z-30 relative">
          <div className="p-4 border-b border-border bg-card flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Document Source
            </h2>
            <button
              onClick={() => setIsSourceOpen(false)}
              className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ScrollArea className="flex-1 bg-muted/5">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 border-b border-border/50 pb-2">
                  AI Context Reference
                </h3>
                <div className="text-sm text-foreground/80 leading-relaxed font-serif relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-full" />
                  <p className="pl-4 py-1 italic opacity-90">
                    {selectedTask?.sourceText ||
                     selectedTask?.frequency?.reg_source ||
                     sourceText?.slice(0, 1500) ||
                     "No direct source text was captured for this specific task generation."}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
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
  onPhase1Complete,
  onPhase2Complete,
  isPhase2 = false,
}: {
  draftId: string;
  onPhase1Complete?: (draft: ApiFrameworkDraft) => void;
  onPhase2Complete?: (draft: ApiFrameworkDraft) => void;
  isPhase2?: boolean;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [synthProgress, setSynthProgress] = useState<{
    tasksGenerated: number;
    totalObligations: number;
    batchesDone: number;
    totalBatches: number;
  } | null>(null);

  const steps = isPhase2
    ? [
        "Processing selected obligations",
        "Synthesizing tasks and sub-tasks",
        "Generating evidence requirements",
      ]
    : ["Normalising document", "Scanning for relevant obligations"];

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
    let isMounted = true;
    let hasFinished = false;
    let pollInterval: ReturnType<typeof setInterval> | undefined;

    const stopPolling = () => {
      hasFinished = true;
      if (pollInterval) clearInterval(pollInterval);
    };

    const pollDraft = async () => {
      if (hasFinished) return;
      try {
        const draft = await getFrameworkDraft(draftId);
        if (!isMounted || hasFinished) return;

        if (!isPhase2 && draft.status === "pending_obligation_selection") {
          stopPolling();
          setProgress(100);
          setCurrentStep(steps.length);
          if (onPhase1Complete) setTimeout(() => onPhase1Complete(draft), 800);
        } else if (
          isPhase2 &&
          (draft.status === "ready_for_review" || draft.status === "published")
        ) {
          stopPolling();
          setProgress(100);
          setCurrentStep(steps.length);
          if (onPhase2Complete) setTimeout(() => onPhase2Complete(draft), 800);
        } else if (isPhase2 && draft.synthesis_progress) {
          // Update live task counter from backend
          const sp = draft.synthesis_progress;
          setSynthProgress({
            tasksGenerated: sp.tasks_generated ?? 0,
            totalObligations: sp.total_obligations ?? 0,
            batchesDone: sp.current_batch ?? sp.batches_done ?? 0,
            totalBatches: sp.total_batches ?? 1,
          });
          // Drive real progress bar from batch fraction
          const realPct = sp.total_batches > 0
            ? Math.round(((sp.current_batch ?? sp.batches_done) / sp.total_batches) * 95)
            : 0;
          setProgress((prev) => Math.max(prev, realPct));
        } else if (draft.status === "error") {
          stopPolling();
          setHasError(true);
          const rawOutput = draft.raw_ai_output as { error?: string } | undefined;
          setErrorMsg(rawOutput?.error || "Extraction failed. Please try again.");
        }
      } catch {
        // network blip — keep polling
      }
    };

    void pollDraft();
    pollInterval = setInterval(pollDraft, 4000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6">
          <Sparkles className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-3">
          {isPhase2 ? "AI is generating tasks..." : "AI is extracting obligations..."}
        </h2>
        <p className="text-muted-foreground">
          {isPhase2
            ? "This can take a few minutes for larger documents. We are converting selected obligations into reviewable tasks."
            : "This usually takes 20–60 seconds. We are finding the document title and discrete compliance obligations."}
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
          {isPhase2 && (
            <div className="pt-3 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tasks
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {synthProgress
                      ? `${synthProgress.tasksGenerated} / ${synthProgress.totalObligations}`
                      : "Starting..."}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Batch
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {synthProgress
                      ? `${synthProgress.batchesDone} / ${synthProgress.totalBatches}`
                      : "Waiting"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {synthProgress ? "Generating" : "Queued"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-primary/10 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                <p>
                  You can leave this page and come back later. Generation continues on the server; this screen only polls for updates.
                </p>
              </div>
            </div>
          )}
        </div>

        {hasError && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm font-medium text-red-500 max-w-[400px]">
                {errorMsg || "Extraction failed. Please try again."}
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
        {!hasError && <Loader2 className="w-3 h-3 animate-spin" />}
        {isPhase2
          ? synthProgress
            ? (
              <span className="font-semibold text-foreground">
                {synthProgress.tasksGenerated} task{synthProgress.tasksGenerated !== 1 ? "s" : ""} generated
                {" "}<span className="text-muted-foreground font-normal">of</span>{" "}
                {synthProgress.totalObligations} obligations &mdash; batch {synthProgress.batchesDone} / {synthProgress.totalBatches}
              </span>
            )
            : "Synthesizing full task data using document context..."
          : "Normalising data structures and extracting high-level obligations..."}
      </p>
    </div>
  );
};

const StageObligationSelect = ({
  draft,
  onSynthesize,
  onRefine,
}: {
  draft: ApiFrameworkDraft;
  onSynthesize: (draft: ApiFrameworkDraft) => void;
  onRefine: (draft: ApiFrameworkDraft) => void;
}) => {
  // Try to safely parse obligations
  const allObligations = (() => {
    try {
      const aiOut = draft.raw_ai_output;
      if (aiOut && Array.isArray(aiOut.obligations)) {
        return aiOut.obligations as string[];
      }
      return [];
    } catch {
      return [];
    }
  })();

  const [selected, setSelected] = useState<string[]>(allObligations);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const [isGenerateConfirmOpen, setIsGenerateConfirmOpen] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const toggleSelection = (ob: string) => {
    if (selected.includes(ob)) {
      setSelected(selected.filter((i) => i !== ob));
    } else {
      setSelected([...selected, ob]);
    }
  };

  const handleSynthesize = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one obligation.");
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await synthesizeTasks(draft.id, selected);
      onSynthesize(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to trigger synthesis.");
      setIsSubmitting(false);
    }
  };

  const handleRefineObligations = async () => {
    if (!additionalInstructions.trim()) {
      toast.error("Add instructions before regenerating obligations.");
      return;
    }
    setIsRefining(true);
    try {
      const updated = await refineFrameworkObligations(draft.id, additionalInstructions);
      setIsInstructionModalOpen(false);
      onRefine(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to regenerate obligations.");
      setIsRefining(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Select Obligations
        </h2>
        <p className="text-lg text-muted-foreground">
          The AI has scanned the document and found {allObligations.length} potential obligations.
          Select the ones you want to convert into full compliance tasks.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-3">
            {allObligations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No obligations found.</p>
            ) : (
              allObligations.map((ob, i) => (
                <label
                  key={i}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                    selected.includes(ob)
                      ? "bg-primary/5 border-primary/20"
                      : "bg-background border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-input text-primary focus:ring-primary"
                    checked={selected.includes(ob)}
                    onChange={() => toggleSelection(ob)}
                  />
                  <span className="text-sm leading-relaxed text-foreground select-none">
                    {ob}
                  </span>
                </label>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            {selected.length} of {allObligations.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInstructionModalOpen(true)}
              disabled={isSubmitting || isRefining}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold transition-all disabled:opacity-50 ${
                additionalInstructions.trim()
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              <FileText className="w-4 h-4" />
              {additionalInstructions.trim() ? "Refine Instructions" : "Refine Obligations"}
            </button>
            <button
              onClick={() => setIsGenerateConfirmOpen(true)}
              disabled={isSubmitting || selected.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Tasks
            </button>
          </div>
        </div>
      </div>
      {isGenerateConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h3 className="text-base font-bold">Generate tasks?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This will start Step 2 for the selected obligations.
                </p>
              </div>
              <button
                onClick={() => setIsGenerateConfirmOpen(false)}
                disabled={isSubmitting}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">
                  {selected.length} obligation{selected.length !== 1 ? "s" : ""} selected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  The backend will generate full task templates, evidence requirements, scope, frequency, confidence, and source text.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                You can leave the page after confirming. Generation continues on the server and can be resumed from this draft.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 p-4">
              <button
                onClick={() => setIsGenerateConfirmOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-semibold hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSynthesize}
                disabled={isSubmitting || selected.length === 0}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Confirm Generate
              </button>
            </div>
          </div>
        </div>
      )}
      {isInstructionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="text-base font-bold">Refine extracted obligations</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  These instructions re-run Step 1 and replace the current obligation list.
                </p>
              </div>
              <button
                onClick={() => setIsInstructionModalOpen(false)}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={7}
                placeholder="Example: Include obligations from sections 4 and 5, merge duplicate policy-review duties, and add any missed training or evidence-retention obligations."
                className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                The model will use this guidance to regenerate the Step 1 obligation list before you generate tasks.
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-border bg-muted/20 p-4">
              <button
                onClick={() => setAdditionalInstructions("")}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
              <button
                onClick={handleRefineObligations}
                disabled={isRefining || !additionalInstructions.trim()}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Regenerate Obligations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewFramework;
