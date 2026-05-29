import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTasks,
  Task,
  TaskPriority,
  TaskRisk,
  TaskStatus,
  TaskAttachment,
} from "@/contexts/TaskContext";
import { schoolOrganisationService } from "@/services/school/organisationService";
import { schoolTaskService } from "@/services/school/taskService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  Upload,
  FileText,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight,
  Shield,
  History,
  Download,
  Eye,
  RefreshCw,
  Lock,
  Info,
  CheckCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFrameworks } from "@/contexts/FrameworkContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultFrameworkId?: string;
}

// ─── Sub-task types ───────────────────────────────────────────────────────────
interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  evidenceTag?: string; // e.g. "No evidence required" | "Evidence under review"
  requiresEvidence?: boolean;
}

// ─── Evidence types ───────────────────────────────────────────────────────────
type EvidenceStatus = "approved" | "revision_required" | "pending" | "missing";

interface EvidenceVersion {
  version: number;
  filename: string;
  uploadedBy: string;
  expiry?: string;
  comments?: string;
}

interface EvidenceItem {
  id: string;
  title: string;
  status: EvidenceStatus;
  versions: EvidenceVersion[];
  archivedVersions?: number;
}

// ─── Cycle History types ──────────────────────────────────────────────────────
type CycleStatus = "in-progress" | "late" | "complete" | "upcoming";

interface Cycle {
  id: string;
  name: string;
  status: CycleStatus;
  targetDate?: string;
  completedDate?: string;
  assignedTo?: string;
  confirmedBy?: { initials: string; name: string };
  daysLate?: number;
}

// ─── Mock data helpers ────────────────────────────────────────────────────────
const buildMockSubTasks = (): SubTask[] => [
  {
    id: "st-1",
    title: "Define scope and objectives of the access control policy",
    completed: true,
    evidenceTag: "No evidence required",
    requiresEvidence: false,
  },
  {
    id: "st-2",
    title: "Map access roles to business functions and data classification levels",
    completed: true,
    evidenceTag: "No evidence required",
    requiresEvidence: false,
  },
  {
    id: "st-3",
    title: "Submit policy draft to information security function for approval",
    completed: true,
    evidenceTag: "Evidence under review",
    requiresEvidence: true,
  },
  {
    id: "st-4",
    title: "Legal Counsel Review",
    completed: false,
    evidenceTag: "Requires external certification upload",
    requiresEvidence: true,
  },
];

const buildMockEvidence = (): EvidenceItem[] => [
  {
    id: "ev-1",
    title: "Signed Safeguarding Policy",
    status: "approved",
    archivedVersions: 2,
    versions: [
      {
        version: 3,
        filename: "Safeguarding_Policy_Final_2024.pdf",
        uploadedBy: "Jane Cooper",
        expiry: "ACAD.START",
      },
    ],
  },
  {
    id: "ev-2",
    title: "Governor Meeting Minutes",
    status: "revision_required",
    versions: [
      {
        version: 1,
        filename: "Minutes_Nov_2023_Safeguarding_Review.docx",
        uploadedBy: "Robert Fox",
        comments: "Missing Signatures",
      },
    ],
  },
  {
    id: "ev-3",
    title: "Staff Training Logs",
    status: "missing",
    versions: [],
  },
];

const buildMockCycles = (): Cycle[] => [
  {
    id: "cy-3",
    name: "Cycle 3: 2024 Annual Review",
    status: "in-progress",
    targetDate: "Oct 12, 2024",
    assignedTo: "Sarah Jenkins",
  },
  {
    id: "cy-2",
    name: "Cycle 2: Re-attestation",
    status: "late",
    completedDate: "Nov 24, 2023",
    confirmedBy: { initials: "MC", name: "Marcus Chen" },
    daysLate: 12,
  },
  {
    id: "cy-1",
    name: "Cycle 1: Implementation",
    status: "complete",
    completedDate: "Oct 10, 2022",
    confirmedBy: { initials: "JD", name: "Jane Doe" },
  },
];

// ─── Small helper components ──────────────────────────────────────────────────
const EvidenceStatusBadge = ({ status }: { status: EvidenceStatus }) => {
  const map: Record<EvidenceStatus, { label: string; className: string }> = {
    approved: {
      label: "APPROVED",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    revision_required: {
      label: "REVISION REQUIRED",
      className: "bg-orange-50 text-orange-600 border border-orange-200",
    },
    pending: {
      label: "PENDING",
      className: "bg-blue-50 text-blue-600 border border-blue-200",
    },
    missing: { label: "MISSING", className: "hidden" },
  };
  const cfg = map[status];
  if (!cfg || cfg.className === "hidden") return null;
  return (
    <span
      className={cn(
        "text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded",
        cfg.className
      )}
    >
      {cfg.label}
    </span>
  );
};

const CycleStatusBadge = ({ cycle }: { cycle: Cycle }) => {
  if (cycle.status === "in-progress") {
    return (
      <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
        IN PROGRESS
      </span>
    );
  }
  if (cycle.status === "late") {
    return (
      <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
        LATE ({cycle.daysLate}D)
      </span>
    );
  }
  if (cycle.status === "complete") {
    return (
      <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
        COMPLETE
      </span>
    );
  }
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TaskModal = ({
  isOpen,
  onClose,
  task,
  defaultFrameworkId,
}: TaskModalProps) => {
  const { addTask, updateTask } = useTasks();
  const { user } = useAuth();
  const { frameworks } = useFrameworks();
  const queryClient = useQueryClient();

  // Fetch users for assignment
  const { data: orgUsers = [] } = useQuery({
    queryKey: ["organisation-users"],
    queryFn: schoolOrganisationService.getUsers,
    enabled: isOpen && !!user && user.role !== "admin",
  });

  // ── Core task form state ──────────────────────────────────────────────────
  const [frameworkId, setFrameworkId] = useState<string>("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [risk, setRisk] = useState<TaskRisk>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"subtasks" | "evidence" | "cycle-history">("subtasks");

  // ── Sub-tasks state ───────────────────────────────────────────────────────
  const [subTasks, setSubTasks] = useState<SubTask[]>(buildMockSubTasks());
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [reviewFrequency, setReviewFrequency] = useState("Biannual Quality Check");
  const [internalDueDate, setInternalDueDate] = useState<Date | undefined>(new Date("2024-10-24"));

  // ── Evidence state ────────────────────────────────────────────────────────
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>(buildMockEvidence());

  // ── Cycle history state ───────────────────────────────────────────────────
  const [cycles] = useState<Cycle[]>(buildMockCycles());

  const isReadOnly = false;
  const isStaff = user?.role === "staff";

  // ── Initialize ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setStatus(task.status);
        setPriority(task.priority);
        setRisk(task.risk);
        setAssigneeId(task.assigneeId || "");
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setAttachments(task.attachments || []);
        setFrameworkId(task.frameworkId || "");
      } else {
        setStatus("todo");
        setPriority("medium");
        setRisk("medium");
        setAssigneeId("");
        setDueDate(undefined);
        setAttachments([]);
        setFrameworkId(defaultFrameworkId || "");
      }
      setActiveTab("subtasks");
      setSubTasks(buildMockSubTasks());
      setEvidenceItems(buildMockEvidence());
    }
  }, [isOpen, task, defaultFrameworkId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!task) return;
    const assignee = orgUsers.find((u) => u.id === assigneeId);
    updateTask(task.id, {
      status,
      priority,
      risk,
      assigneeId,
      assigneeName: assignee?.name || "Unassigned",
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
      attachments,
      frameworkId,
    });
    try {
      await schoolTaskService.updateTask(task.id, {
        priority,
        risk,
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
      });
      if (task.status !== status) {
        await schoolTaskService.updateTaskStatus(task.id, status);
      }
      if (assigneeId && assigneeId !== task.assigneeId) {
        await schoolTaskService.assignTask(task.id, assigneeId);
      }
      queryClient.invalidateQueries({ queryKey: ["school-tasks"] });
    } catch (err) {
      console.error("Failed to update task via API", err);
    }
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments: TaskAttachment[] = Array.from(files).map((file) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.name || "Unknown",
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== fileId));
  };

  const toggleSubTask = (id: string) => {
    setSubTasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const addSubTask = () => {
    if (!newSubTaskTitle.trim()) return;
    setSubTasks((prev) => [
      ...prev,
      {
        id: `st-${Date.now()}`,
        title: newSubTaskTitle.trim(),
        completed: false,
        requiresEvidence: false,
      },
    ]);
    setNewSubTaskTitle("");
  };

  const removeSubTask = (id: string) => {
    setSubTasks((prev) => prev.filter((st) => st.id !== id));
  };

  const completedCount = subTasks.filter((st) => st.completed).length;

  // ── Computed completion gate ───────────────────────────────────────────────
  const completionGate = [
    {
      id: "cg-1",
      label: "All sub-tasks completed",
      color: completedCount === subTasks.length ? "bg-emerald-500" : "bg-amber-500",
      value: completedCount === subTasks.length ? undefined : undefined,
      rightLabel:
        completedCount === subTasks.length
          ? `${completedCount} / ${subTasks.length} done`
          : `${completedCount} / ${subTasks.length} done`,
      rightColor: completedCount === subTasks.length ? "text-emerald-600" : "text-amber-600",
    },
    {
      id: "cg-2",
      label: "Access control policy document",
      color: "bg-amber-500",
      rightLabel: "Under review",
      rightColor: "text-amber-600",
    },
    {
      id: "cg-3",
      label: "Management approval sign-off",
      color: "bg-red-500",
      rightLabel: "Not uploaded",
      rightColor: "text-red-500",
    },
  ];

  const blockingCount = completionGate.filter(
    (g) => g.rightLabel !== `${subTasks.length} / ${subTasks.length} done`
  ).length;

  // ── Cycle timeline icon ───────────────────────────────────────────────────
  const cycleIcon = (status: CycleStatus) => {
    if (status === "in-progress")
      return (
        <div className="w-9 h-9 rounded-full bg-[#1a2e22] flex items-center justify-center shadow-md">
          <FileText className="w-4 h-4 text-white" />
        </div>
      );
    if (status === "late")
      return (
        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shadow">
          <History className="w-4 h-4 text-slate-500" />
        </div>
      );
    return (
      <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow">
        <CheckCheck className="w-4 h-4 text-white" />
      </div>
    );
  };

  // ── Header breadcrumb / title ──────────────────────────────────────────────
  const taskTitle = task?.title || "Create New Task";
  const priorityLabel = task?.priority?.toUpperCase();
  const priorityColor =
    task?.priority === "high" || task?.priority === "critical"
      ? "bg-red-500 text-white"
      : task?.priority === "medium"
      ? "bg-amber-500 text-white"
      : "bg-slate-400 text-white";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 sm:max-w-[950px] max-h-[92vh] overflow-hidden flex flex-col rounded-xl border-0 shadow-2xl">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-0 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
              Policy Management &rsaquo; Safeguarding
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">{taskTitle}</h2>
              {task && priorityLabel && (
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-widest px-2 py-0.5 rounded",
                    priorityColor
                  )}
                >
                  {priorityLabel} PRIORITY
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-1 text-slate-400 hover:text-slate-700 transition-colors rounded-full p-1 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="px-6 border-b border-slate-100">
            <TabsList className="bg-transparent p-0 h-auto gap-0 rounded-none">
              {(
                [
                  { value: "subtasks", label: "Sub-tasks" },
                  {
                    value: "evidence",
                    label: "Evidence",
                    count: evidenceItems.filter(
                      (e) => e.status === "approved"
                    ).length,
                  },
                  { value: "cycle-history", label: "Cycle History" },
                ] as const
              ).map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "relative px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent",
                    "data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                    "text-slate-500 hover:text-slate-700 transition-colors"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {tab.label}
                    {"count" in tab && tab.count > 0 && (
                      <span className="text-[10px] font-bold bg-slate-900 text-white rounded-full w-4 h-4 flex items-center justify-center leading-none">
                        {tab.count}
                      </span>
                    )}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ╔═══════════════════════════════════╗
              ║        SUB-TASKS TAB              ║
              ╚═══════════════════════════════════╝ */}
          <TabsContent
            value="subtasks"
            className="flex-1 min-h-0 overflow-hidden m-0"
          >
            <div className="flex h-full overflow-hidden">
              {/* Left panel */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {subTasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-start gap-3 group cursor-pointer"
                    onClick={() => toggleSubTask(st.id)}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {st.completed ? (
                        <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white fill-white" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          st.completed
                            ? "line-through text-slate-400"
                            : "text-slate-800"
                        )}
                      >
                        {st.title}
                      </p>
                      {st.evidenceTag && (
                        <div className="mt-1">
                          {st.evidenceTag === "Evidence under review" ? (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                              Evidence under review
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {st.evidenceTag}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {!isReadOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSubTask(st.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 mt-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add new sub-task */}
                {!isReadOnly && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
                      onClick={() => {
                        const el = document.getElementById("new-subtask-input");
                        el?.focus();
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      ADD NEW SUB-TASK
                    </button>
                  </div>
                )}
                {!isReadOnly && (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="new-subtask-input"
                      value={newSubTaskTitle}
                      onChange={(e) => setNewSubTaskTitle(e.target.value)}
                      placeholder="Sub-task title..."
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubTask();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addSubTask}
                      className="h-8 bg-slate-900 hover:bg-slate-700"
                    >
                      Add
                    </Button>
                  </div>
                )}

                {/* Completion Gate */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-3">
                    Completion Gate
                  </p>
                  <div className="space-y-2">
                    {completionGate.map((gate) => (
                      <div
                        key={gate.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn("w-2.5 h-2.5 rounded-full", gate.color)}
                          />
                          <span className="text-sm text-slate-700">
                            {gate.label}
                          </span>
                        </div>
                        <span className={cn("text-xs font-semibold", gate.rightColor)}>
                          {gate.rightLabel}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled
                    className="mt-4 w-full py-2.5 rounded-lg border border-slate-200 text-sm text-slate-400 bg-slate-50 flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    Mark complete — {blockingCount} condition{blockingCount !== 1 ? "s" : ""} blocking
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right panel */}
              <div className="w-64 border-l border-slate-100 overflow-y-auto px-5 py-4 space-y-6 bg-slate-50/50 flex-shrink-0">
                {/* Review Frequency */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
                    Review Frequency
                  </p>
                  <Select
                    value={reviewFrequency}
                    onValueChange={setReviewFrequency}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Biannual Quality Check">
                        Biannual Quality Check
                      </SelectItem>
                      <SelectItem value="Annual (365 Days)">
                        Annual (365 Days)
                      </SelectItem>
                      <SelectItem value="Termly (120 Days)">
                        Termly (120 Days)
                      </SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                      Regulatory Requirement: Annual
                    </span>
                  </div>
                </div>

                {/* Ownership & Timeline */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-3">
                    Ownership &amp; Timeline
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">
                        Assigned To
                      </Label>
                      <Select
                        value={assigneeId}
                        onValueChange={setAssigneeId}
                        disabled={isReadOnly || isStaff}
                      >
                        <SelectTrigger className="h-9 text-sm bg-white">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {orgUsers.length > 0 ? (
                            orgUsers.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="sarah">Sarah Henderson</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">
                        Internal Due Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-9 text-sm bg-white",
                              !internalDueDate && "text-muted-foreground"
                            )}
                            disabled={isReadOnly || isStaff}
                          >
                            {internalDueDate
                              ? format(internalDueDate, "d MMM yyyy")
                              : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 text-slate-400" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={internalDueDate}
                            onSelect={setInternalDueDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between bg-white flex-shrink-0">
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                <History className="w-4 h-4" />
                View Full History
              </button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-9"
                >
                  Cancel
                </Button>
                {!isReadOnly && (
                  <Button
                    type="button"
                    onClick={handleSave}
                    className="h-9 bg-slate-900 hover:bg-slate-700"
                  >
                    Save Changes
                  </Button>
                )}
                <Button
                  type="button"
                  disabled
                  className="h-9 bg-slate-200 text-slate-400 cursor-not-allowed"
                >
                  Complete Task
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ╔═══════════════════════════════════╗
              ║         EVIDENCE TAB              ║
              ╚═══════════════════════════════════╝ */}
          <TabsContent
            value="evidence"
            className="flex-1 min-h-0 overflow-hidden m-0"
          >
            <div className="flex h-full overflow-hidden">
              {/* Left panel */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Evidence Requirements
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload and manage documentation to satisfy compliance standards.
                    </p>
                  </div>
                  {!isReadOnly && (
                    <label className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      ADD EVIDENCE
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileUpload}
                      />
                    </label>
                  )}
                </div>

                {/* Evidence items */}
                <div className="space-y-3">
                  {evidenceItems.map((item) => (
                    <div key={item.id}>
                      {item.status === "missing" ? (
                        /* Missing / empty-state card */
                        <div
                          className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-400 transition-colors"
                          onClick={() =>
                            document.getElementById("ev-file-upload")?.click()
                          }
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                            <FileText className="w-5 h-5 text-slate-400" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Missing required evidence for the current assessment cycle.
                          </p>
                          <p className="text-xs font-semibold text-slate-600 mt-2 hover:underline">
                            Click to upload training records
                          </p>
                          <input
                            id="ev-file-upload"
                            type="file"
                            className="hidden"
                            multiple
                            onChange={handleFileUpload}
                          />
                        </div>
                      ) : (
                        /* Regular evidence card */
                        <div
                          className={cn(
                            "rounded-lg border",
                            item.status === "approved"
                              ? "border-emerald-200"
                              : "border-orange-200"
                          )}
                        >
                          {/* Card header */}
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                              {item.status === "approved" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                              )}
                              <span className="text-sm font-semibold text-slate-800">
                                {item.title}
                              </span>
                            </div>
                            <EvidenceStatusBadge status={item.status} />
                          </div>

                          {/* File rows */}
                          {item.versions.map((ver) => (
                            <div
                              key={ver.version}
                              className={cn(
                                "mx-3 mb-3 rounded-md flex items-center gap-3 px-3 py-2.5",
                                item.status === "approved"
                                  ? "bg-slate-50 border border-slate-100"
                                  : "bg-orange-50 border border-orange-100"
                              )}
                            >
                              <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-400">
                                    V{ver.version}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-700 truncate">
                                    {ver.filename}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-[11px] text-slate-400">
                                    &#9998; {ver.uploadedBy}
                                  </span>
                                  {ver.expiry && (
                                    <span className="text-[11px] text-slate-400">
                                      &#128197; Exp: {ver.expiry}
                                    </span>
                                  )}
                                  {ver.comments && (
                                    <span className="text-[11px] text-orange-500 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      Comments: {ver.comments}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* Action buttons */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {item.status === "approved" ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                    >
                                      View Feedback
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                    >
                                      Replace
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs bg-slate-900 hover:bg-slate-700"
                                  >
                                    Upload Revision
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Archived versions */}
                          {item.archivedVersions && item.archivedVersions > 0 && (
                            <div className="px-4 pb-3">
                              <button className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                                <ChevronRight className="w-3 h-3" />
                                Archived Versions ({item.archivedVersions})
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Uploaded attachments */}
                  {attachments.length > 0 && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-600">
                          Additional Attachments
                        </p>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {attachments.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 px-4 py-2.5"
                          >
                            <div className="w-7 h-7 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 truncate">
                                {file.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {(file.size / 1024).toFixed(0)} KB &bull;{" "}
                                {format(new Date(file.uploadedAt), "MMM d, h:mm a")} &bull;{" "}
                                {file.uploadedBy}
                              </p>
                            </div>
                            {!isReadOnly && (
                              <button
                                onClick={() => handleRemoveFile(file.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right panel */}
              <div className="w-64 border-l border-slate-100 overflow-y-auto px-5 py-4 space-y-6 bg-slate-50/50 flex-shrink-0">
                {/* Review Frequency */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
                    Review Frequency
                  </p>
                  <div className="space-y-2">
                    <div className="px-3 py-2.5 rounded-md border border-slate-200 bg-white">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
                          Regulatory
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        Annual (365 Days)
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Next: Sept 01, 2024
                      </p>
                    </div>
                    <div className="px-3 py-2.5 rounded-md border border-slate-200 bg-white">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
                          Internal Policy
                        </span>
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        Termly (120 Days)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ownership & Timeline */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-3">
                    Ownership &amp; Timeline
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                        Assigned To
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                          JC
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Jane Cooper
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Compliance Lead
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                        Internal Due Date
                      </p>
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-sm font-bold text-red-500">
                          Feb 28, 2024
                        </span>
                      </div>
                      <p className="text-[11px] text-red-400 mt-0.5">
                        Overdue by 3 days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requirement Tip */}
                <div className="px-3 py-3 rounded-md bg-slate-100 border border-slate-200">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">
                      Requirement Tip
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All safeguarding evidence must be digitally signed by the Designated
                    Safeguarding Lead (DSL) and uploaded in PDF/A format.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ╔═══════════════════════════════════╗
              ║       CYCLE HISTORY TAB           ║
              ╚═══════════════════════════════════╝ */}
          <TabsContent
            value="cycle-history"
            className="flex-1 min-h-0 overflow-hidden m-0"
          >
            <div className="flex h-full overflow-hidden">
              {/* Left stats panel */}
              <div className="w-56 border-r border-slate-100 overflow-y-auto px-5 py-5 space-y-4 bg-slate-50/50 flex-shrink-0">
                {/* Compliance streak */}
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      Compliance Streak
                    </p>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">1</span>
                    <span className="text-sm font-medium text-slate-600">
                      Cycle On-Time
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Next re-attestation window opens in 244 days.
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-1">
                      Success Rate
                    </p>
                    <p className="text-xl font-black text-slate-900">50%</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-1">
                      Avg. Delay
                    </p>
                    <p className="text-xl font-black text-red-500">12 Days</p>
                  </div>
                </div>
              </div>

              {/* Right timeline panel */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200" />

                  <div className="space-y-4">
                    {cycles.map((cycle) => (
                      <div key={cycle.id} className="flex items-start gap-4">
                        {/* Timeline icon */}
                        <div className="relative z-10 flex-shrink-0">
                          {cycleIcon(cycle.status)}
                        </div>

                        {/* Cycle card */}
                        <div
                          className={cn(
                            "flex-1 rounded-xl border px-5 py-4",
                            cycle.status === "in-progress"
                              ? "border-slate-300 bg-white shadow-sm"
                              : "border-slate-200 bg-white"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {cycle.name}
                            </h4>
                            <CycleStatusBadge cycle={cycle} />
                          </div>

                          <div className="mt-3 flex items-start gap-6 flex-wrap">
                            {cycle.targetDate && (
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                                  Target Date
                                </p>
                                <p className="text-sm font-bold text-slate-800 mt-0.5">
                                  {cycle.targetDate}
                                </p>
                              </div>
                            )}
                            {cycle.completedDate && (
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                                  Completed
                                </p>
                                <p className="text-sm font-bold text-slate-800 mt-0.5">
                                  {cycle.completedDate}
                                </p>
                              </div>
                            )}
                            {cycle.assignedTo && (
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                                  Assigned To
                                </p>
                                <p className="text-sm font-bold text-slate-800 mt-0.5">
                                  {cycle.assignedTo}
                                </p>
                              </div>
                            )}
                            {cycle.confirmedBy && (
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                                  Confirmed By
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-[9px] font-bold">
                                    {cycle.confirmedBy.initials}
                                  </div>
                                  <p className="text-sm font-bold text-slate-800">
                                    {cycle.confirmedBy.name}
                                  </p>
                                </div>
                              </div>
                            )}
                            {cycle.status !== "in-progress" && (
                              <div className="ml-auto self-center">
                                <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline transition-colors flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5" />
                                  View Snapshot
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cycle History Footer */}
            <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Compliance Verified
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Historical snapshots are locked and archived in Evidence Vault.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
                <Button
                  size="sm"
                  className="h-9 gap-1.5 bg-slate-900 hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4" />
                  New Cycle
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;

/* ═══════════════════════════════════════════════════════════════════════════════
   COMMENTED OUT — ORIGINAL IMPLEMENTATION (before tab redesign)
   ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTasks,
  Task,
  TaskPriority,
  TaskRisk,
  TaskStatus,
  TaskAttachment,
} from "@/contexts/TaskContext";
import { schoolOrganisationService } from "@/services/school/organisationService";
import { schoolTaskService } from "@/services/school/taskService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  User as UserIcon,
  Upload,
  FileText,
  X,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useFrameworks } from "@/contexts/FrameworkContext";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultFrameworkId?: string;
}

const TaskModal = ({
  isOpen,
  onClose,
  task,
  defaultFrameworkId,
}: TaskModalProps) => {
  const { addTask, updateTask } = useTasks();
  const { user } = useAuth();
  const { frameworks } = useFrameworks();
  const queryClient = useQueryClient();

  const { data: orgUsers = [] } = useQuery({
    queryKey: ["organisation-users"],
    queryFn: schoolOrganisationService.getUsers,
    enabled: isOpen && !!user && user.role !== "admin",
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [risk, setRisk] = useState<TaskRisk>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [evidenceUploaded, setEvidenceUploaded] = useState(0);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [frameworkId, setFrameworkId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setRisk(task.risk);
        setAssigneeId(task.assigneeId || "");
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setEvidenceUploaded(task.evidenceUploaded);
        setAttachments(task.attachments || []);
        setFrameworkId(task.frameworkId || "");
      } else {
        setTitle("");
        setDescription("");
        setStatus("todo");
        setPriority("medium");
        setRisk("medium");
        setAssigneeId("");
        setDueDate(undefined);
        setEvidenceUploaded(0);
        setAttachments([]);
        setFrameworkId(defaultFrameworkId || "");
      }
    }
  }, [isOpen, task, defaultFrameworkId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = orgUsers.find((u) => u.id === assigneeId);
    if (task) {
      updateTask(task.id, {
        title, description, status, priority, risk, assigneeId,
        assigneeName: assignee?.name || "Unassigned",
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
        evidenceUploaded, attachments, frameworkId,
      });
      try {
        await schoolTaskService.updateTask(task.id, {
          title, description, priority, risk,
          dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
        });
        if (task.status !== status) {
          await schoolTaskService.updateTaskStatus(task.id, status);
        }
        if (assigneeId && assigneeId !== task.assigneeId) {
          await schoolTaskService.assignTask(task.id, assigneeId);
        }
        queryClient.invalidateQueries({ queryKey: ['school-tasks'] });
      } catch (err) {
        console.error("Failed to update task via API", err);
      }
    } else {
      try {
        await schoolTaskService.createTask({
          title, description: description || undefined,
          framework_id: frameworkId || undefined, priority, risk_level: risk,
          due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
          assigned_to: assigneeId ? [assigneeId] : undefined,
        });
        queryClient.invalidateQueries({ queryKey: ['school-tasks'] });
      } catch (err) {
        console.error("Failed to create task via API, falling back to local", err);
        addTask({
          title, description, status, priority, risk, assigneeId,
          assigneeName: assignee?.name || "Unassigned",
          dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "", frameworkId,
        });
      }
    }
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments: TaskAttachment[] = Array.from(files).map((file) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name, size: file.size, type: file.type,
        uploadedAt: new Date().toISOString(), uploadedBy: user?.name || "Unknown",
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== fileId));
  };

  const isReadOnly = false;
  const isStaff = user?.role === "staff";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[950px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
            {task && <Badge variant="outline">{task.id}</Badge>}
          </div>
          <DialogDescription>
            {task ? "Update task details and progress." : "Fill in the details for the new compliance task."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Framework</Label>
            <Select value={frameworkId} onValueChange={setFrameworkId}
              disabled={isReadOnly || !!task || !!defaultFrameworkId} required>
              <SelectTrigger><SelectValue placeholder="Select Framework" /></SelectTrigger>
              <SelectContent>
                {frameworks.map((fw) => (
                  <SelectItem key={fw.id} value={fw.id}>{fw.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {defaultFrameworkId && (
              <p className="text-[10px] text-muted-foreground">
                Automatically assigned to the current framework view.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)}
              disabled={isReadOnly || (isStaff && !!task)}
              placeholder="e.g. Annual Fire Safety Check" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnly || (isStaff && !!task)}
              placeholder="Detailed description of the task requirements..."
              className="min-h-[100px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}
                disabled={isReadOnly || isStaff}>
                <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                <SelectContent>
                  {orgUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                    disabled={isReadOnly || isStaff}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)} disabled={isReadOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}
                disabled={isReadOnly || isStaff}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={risk} onValueChange={(v) => setRisk(v as TaskRisk)}
                disabled={isReadOnly || isStaff}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(task || isStaff) && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <Label>Evidence / Progress ({evidenceUploaded}%)</Label>
              </div>
              <Slider value={[evidenceUploaded]} max={100} step={5}
                onValueChange={(val) => setEvidenceUploaded(val[0])} disabled={isReadOnly} />
              <p className="text-xs text-muted-foreground">
                Drag the slider to update progress. In a real app, you would upload files here.
              </p>
            </div>
          )}

          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <Label>Evidence Files</Label>
              {!isReadOnly && (
                <div className="flex items-center">
                  <input type="file" id="file-upload" className="hidden" multiple
                    onChange={handleFileUpload} disabled={isReadOnly} />
                  <Label htmlFor="file-upload"
                    className="cursor-pointer text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Files
                  </Label>
                </div>
              )}
            </div>
            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((file) => (
                  <div key={file.id}
                    className="flex items-center justify-between p-2 border rounded-md text-sm bg-slate-50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium text-slate-700">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(0)} KB • {format(new Date(file.uploadedAt), "MMM d, h:mm a")} • {file.uploadedBy}
                        </span>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <Button variant="ghost" size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => handleRemoveFile(file.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed rounded-md text-sm text-muted-foreground bg-slate-50/50">
                No files attached.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            {!isReadOnly && (
              <Button type="submit">{task ? "Save Changes" : "Create Task"}</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;

   ═══════════════════════════════════════════════════════════════════════════════
   END OF COMMENTED-OUT ORIGINAL IMPLEMENTATION
   ═══════════════════════════════════════════════════════════════════════════════
*/
