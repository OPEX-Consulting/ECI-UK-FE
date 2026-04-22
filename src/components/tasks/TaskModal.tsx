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
import { HARDCODED_USERS } from "@/types/incident";
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
  task?: Task | null; // If null, creating new
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

  // Form State
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

  // Initialize form when task changes or modal opens
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
        // Reset for new task
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assignee = HARDCODED_USERS.find((u) => u.id === assigneeId);

    if (task) {
      // Update
      updateTask(task.id, {
        title,
        description,
        status,
        priority,
        risk,
        assigneeId,
        assigneeName: assignee?.name,
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
        evidenceUploaded,
        attachments,
        frameworkId,
      });
    } else {
      // Create
      addTask({
        title,
        description,
        status,
        priority,
        risk,
        assigneeId,
        assigneeName: assignee?.name,
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
        frameworkId,
      });
    }
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments: TaskAttachment[] = Array.from(files).map(
        (file) => ({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user?.name || "Unknown",
        }),
      );
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== fileId));
  };

  const isReadOnly = false; // Officers now have full access
  const isStaff = user?.role === "staff";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
            {task && <Badge variant="outline">{task.id}</Badge>}
          </div>
          <DialogDescription>
            {task
              ? "Update task details and progress."
              : "Fill in the details for the new compliance task."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Framework</Label>
            <Select
              value={frameworkId}
              onValueChange={setFrameworkId}
              disabled={isReadOnly || !!task || !!defaultFrameworkId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((fw) => (
                  <SelectItem key={fw.id} value={fw.id}>
                    {fw.name}
                  </SelectItem>
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
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isReadOnly || (isStaff && !!task)} // Staff cannot rename tasks
              placeholder="e.g. Annual Fire Safety Check"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnly || (isStaff && !!task)}
              placeholder="Detailed description of the task requirements..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={assigneeId}
                onValueChange={setAssigneeId}
                disabled={isReadOnly || isStaff}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {HARDCODED_USERS.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                    )}
                    disabled={isReadOnly || isStaff}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TaskStatus)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
                disabled={isReadOnly || isStaff}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select
                value={risk}
                onValueChange={(v) => setRisk(v as TaskRisk)}
                disabled={isReadOnly || isStaff}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Slider
                value={[evidenceUploaded]}
                max={100}
                step={5}
                onValueChange={(val) => setEvidenceUploaded(val[0])}
                disabled={isReadOnly}
              />
              <p className="text-xs text-muted-foreground">
                Drag the slider to update progress. In a real app, you would
                upload files here.
              </p>
            </div>
          )}

          {/* Attachments Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <Label>Evidence Files</Label>
              {/* File Input */}
              {!isReadOnly && (
                <div className="flex items-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isReadOnly}
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Files
                  </Label>
                </div>
              )}
            </div>

            {/* File List */}
            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 border rounded-md text-sm bg-slate-50"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium text-slate-700">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(0)} KB •{" "}
                          {format(new Date(file.uploadedAt), "MMM d, h:mm a")} •{" "}
                          {file.uploadedBy}
                        </span>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => handleRemoveFile(file.id)}
                      >
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {!isReadOnly && (
              <Button type="submit">
                {task ? "Save Changes" : "Create Task"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
