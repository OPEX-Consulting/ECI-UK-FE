import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskStatus, TaskPriority, TaskRisk } from "@/contexts/TaskContext";
import { useQuery } from "@tanstack/react-query";
import { schoolOrganisationService } from "@/services/school/organisationService";
import { useAuth } from "@/contexts/AuthContext";

export interface TaskFiltersState {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  risk: TaskRisk | "all";
  assigneeId: string | "all";
}

export const defaultFilters: TaskFiltersState = {
  status: "all",
  priority: "all",
  risk: "all",
  assigneeId: "all",
};

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
}

const TaskFilters = ({ filters, onChange }: TaskFiltersProps) => {
  const { user } = useAuth();

  const { data: orgUsers = [] } = useQuery({
    queryKey: ["organisation-users"],
    queryFn: schoolOrganisationService.getUsers,
    enabled: !!user && user.role !== "admin",
  });

  const activeCount = Object.values(filters).filter((v) => v !== "all").length;

  const handleChange = (key: keyof TaskFiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onChange(defaultFilters);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status */}
      <Select
        value={filters.status}
        onValueChange={(v) => handleChange("status", v)}
      >
        <SelectTrigger className="h-8 w-[130px] text-xs border-dashed">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="in-review">In Review</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority */}
      <Select
        value={filters.priority}
        onValueChange={(v) => handleChange("priority", v)}
      >
        <SelectTrigger className="h-8 w-[130px] text-xs border-dashed">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      {/* Risk */}
      <Select
        value={filters.risk}
        onValueChange={(v) => handleChange("risk", v)}
      >
        <SelectTrigger className="h-8 w-[120px] text-xs border-dashed">
          <SelectValue placeholder="Risk" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Risks</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      {/* Assignee */}
      {user?.role !== "staff" && (
        <Select
          value={filters.assigneeId}
          onValueChange={(v) => handleChange("assigneeId", v)}
        >
          <SelectTrigger className="h-8 w-[150px] text-xs border-dashed">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {orgUsers.map((u: any) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name || u.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Active filter count + reset */}
      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Clear
          <Badge
            variant="secondary"
            className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          >
            {activeCount}
          </Badge>
        </Button>
      )}
    </div>
  );
};

export default TaskFilters;
