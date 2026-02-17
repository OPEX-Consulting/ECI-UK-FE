import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useTasks,
  Task,
  TaskStatus,
  TaskPriority,
  TaskRisk,
} from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Edit2, MoreHorizontal, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskListProps {
  onEditTask: (task: Task) => void;
  tasks?: Task[];
}

const TaskList = ({ onEditTask, tasks: propTasks }: TaskListProps) => {
  const { tasks: contextTasks, updateTask } = useTasks();
  const tasks = propTasks || contextTasks;
  const { user } = useAuth();

  // RBAC: Filter tasks based on role
  const visibleTasks =
    user?.role === "staff"
      ? tasks.filter((t) => t.assigneeId === user.id)
      : tasks;

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case "low":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "bg-slate-100 text-slate-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "in-review":
        return "bg-yellow-100 text-yellow-700";
      case "done":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getRiskColor = (risk: TaskRisk) => {
    switch (risk) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-green-600";
      default:
        return "text-slate-600";
    }
  };

  const statusLabels: Record<TaskStatus, string> = {
    todo: "To Do",
    "in-progress": "In Progress",
    "in-review": "In Review",
    done: "Done",
  };

  const isOfficer = false; // Officers now have full access

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No tasks found.
              </TableCell>
            </TableRow>
          ) : (
            visibleTasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-slate-50/50"
                onClick={() => onEditTask(task)}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="truncate max-w-[280px] font-semibold text-slate-900">
                      {task.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {task.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("font-normal", getStatusColor(task.status))}
                  >
                    {statusLabels[task.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize font-normal border-0",
                      getPriorityColor(task.priority),
                    )}
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full bg-current",
                        getRiskColor(task.risk),
                      )}
                    />
                    <span className="capitalize text-slate-700">
                      {task.risk}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-indigo-50 text-indigo-700">
                        {task.assigneeName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-600">
                      {task.assigneeName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm",
                      task.dueDate &&
                        new Date(task.dueDate) < new Date() &&
                        task.status !== "done"
                        ? "text-red-600 font-medium"
                        : "text-slate-600",
                    )}
                  >
                    {task.dueDate
                      ? format(new Date(task.dueDate), "MMM d, yyyy")
                      : "-"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                      >
                        <Edit2 className="mr-2 h-3.5 w-3.5" />
                        Edit Task
                      </DropdownMenuItem>
                      {!isOfficer && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <DropdownMenuItem
                              key={key}
                              disabled={task.status === key}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTask(task.id, {
                                  status: key as TaskStatus,
                                });
                              }}
                            >
                              {label}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskList;
