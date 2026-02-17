import { useMemo, useState } from "react";
import { useTasks, Task, TaskStatus } from "@/contexts/TaskContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Calendar,
  MoreHorizontal,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  defaultDropAnimationSideEffects,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To-Do", color: "bg-slate-500" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-500" },
  { id: "in-review", title: "In Review", color: "bg-yellow-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

interface TaskBoardProps {
  onEditTask: (task: Task) => void;
  tasks?: Task[];
}

// Draggable Task Card Component
const DraggableTaskCard = ({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "critical":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn("touch-none", isDragging && "opacity-50 z-50")}
    >
      <Card
        className="mb-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-l-4"
        style={{
          borderLeftColor:
            task.risk === "high"
              ? "#ef4444"
              : task.risk === "medium"
                ? "#f59e0b"
                : task.risk === "critical"
                  ? "#7e22ce"
                  : "#3b82f6",
        }}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header Tags */}
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "capitalize px-2 py-0.5 rounded-sm font-normal text-xs",
                  getPriorityColor(task.priority),
                )}
              >
                {task.priority} Priority
              </Badge>
              {task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                task.status !== "done" && (
                  <Badge
                    variant="destructive"
                    className="px-2 py-0.5 rounded-sm font-normal text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" /> Overdue
                  </Badge>
                )}
            </div>
          </div>

          {/* Title */}
          <div>
            <h4 className="font-semibold text-sm leading-tight text-slate-900 line-clamp-2">
              {task.title}
            </h4>
            <span className="text-xs text-muted-foreground mt-1 block">
              {task.id}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                  {task.assigneeName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {task.dueDate && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.dueDate), "MMM d")}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Droppable Column Component
const DroppableColumn = ({
  column,
  tasks,
  children,
}: {
  column: any;
  tasks: Task[];
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      key={column.id}
      className="flex-1 flex flex-col min-w-[280px] max-w-[350px] bg-slate-100/50 rounded-lg p-2 h-full"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", column.color)} />
          <h3 className="font-semibold text-sm text-slate-700">
            {column.title}
          </h3>
          <Badge
            variant="secondary"
            className="bg-slate-200 text-slate-600 px-2 h-5 text-[10px] min-w-[20px] justify-center"
          >
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Tasks List */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 min-h-[100px]",
          isOver && "bg-slate-200/50 rounded-lg transition-colors",
        )}
      >
        {children}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <p className="text-sm text-muted-foreground">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskBoard = ({ onEditTask, tasks: propTasks }: TaskBoardProps) => {
  const { tasks: contextTasks, updateTask } = useTasks();
  const tasks = propTasks || contextTasks;
  const { user } = useAuth();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Filter tasks based on role
  const visibleTasks =
    user?.role === "staff"
      ? tasks.filter((t) => t.assigneeId === user.id)
      : tasks;

  // Officer view only - disable drag?
  // We can just not wrap in DndContext or disable sensors if officer.
  // Better: DndContext works but onDragEnd checks permission.
  // Officer view now has full access
  const isOfficer = false;

  const handleDragStart = (event: DragStartEvent) => {
    if (isOfficer) return;
    const { active } = event;
    const task = visibleTasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    if (isOfficer) return;

    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    if (activeTask && activeTask.status !== newStatus) {
      updateTask(taskId, { status: newStatus });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full min-w-[1000px] gap-6">
            {COLUMNS.map((column) => {
              const columnTasks = visibleTasks.filter(
                (t) => t.status === column.id,
              );
              return (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                >
                  {columnTasks.map((task) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      onClick={() => onEditTask(task)}
                    />
                  ))}
                </DroppableColumn>
              );
            })}
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeTask ? (
          <Card
            className="mb-3 shadow-xl cursor-grabbing border-l-4 opacity-80 rotate-3"
            style={{
              borderLeftColor:
                activeTask.risk === "high"
                  ? "#ef4444"
                  : activeTask.risk === "medium"
                    ? "#f59e0b"
                    : "#3b82f6",
              width: "280px",
            }}
          >
            <CardContent className="p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-sm leading-tight text-slate-900 line-clamp-2">
                  {activeTask.title}
                </h4>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskBoard;
