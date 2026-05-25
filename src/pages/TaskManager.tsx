import { useState, useMemo } from 'react';
import TaskLayout from '@/components/tasks/TaskLayout';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskList from '@/components/tasks/TaskList';
import TaskModal from '@/components/tasks/TaskModal';
import { Task, useTasks } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useParams } from 'react-router-dom';
import { useFrameworks } from '@/contexts/FrameworkContext';
import { useQuery } from '@tanstack/react-query';
import { schoolTaskService } from '@/services/school/taskService';
import { schoolOrganisationService } from '@/services/school/organisationService';
import { TaskFiltersState, defaultFilters } from '@/components/tasks/TaskFilters';

const TaskManager = () => {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFiltersState>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuth();
  const { tasks: localTasks } = useTasks();
  const { frameworkId } = useParams();
  const { getFramework } = useFrameworks();

  const framework = frameworkId ? getFramework(frameworkId) : undefined;

  // Fetch API tasks
  const { data: apiTasks, isLoading } = useQuery({
    queryKey: ['school-tasks', frameworkId],
    queryFn: () =>
      frameworkId
        ? schoolTaskService.getFrameworkTasks(frameworkId)
        : schoolTaskService.getAllTasks(),
    enabled: !!user && user.role !== 'admin',
  });

  // Fetch org users so we can resolve assignee names
  const { data: orgUsers = [] } = useQuery({
    queryKey: ['organisation-users'],
    queryFn: schoolOrganisationService.getUsers,
    enabled: !!user && user.role !== 'admin',
  });

  // Merge tasks from API with resolved assignee names
  const resolvedTasks = useMemo(() => {
    const source = apiTasks ?? (frameworkId
      ? localTasks.filter((t) => t.frameworkId === frameworkId)
      : localTasks);

    return source.map((task) => {
      // If assigneeId exists, look up the name from orgUsers
      if (task.assigneeId) {
        const foundUser = (orgUsers as any[]).find((u) => u.id === task.assigneeId);
        if (foundUser) {
          return { ...task, assigneeName: foundUser.name || foundUser.email || 'Unassigned' };
        }
      }
      return task;
    });
  }, [apiTasks, localTasks, frameworkId, orgUsers]);

  // Apply search + filters
  const filteredTasks = useMemo(() => {
    let tasks = resolvedTasks;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      tasks = tasks.filter((t) => t.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      tasks = tasks.filter((t) => t.priority === filters.priority);
    }

    // Risk filter
    if (filters.risk !== 'all') {
      tasks = tasks.filter((t) => t.risk === filters.risk);
    }

    // Assignee filter
    if (filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned') {
        tasks = tasks.filter((t) => !t.assigneeId);
      } else {
        tasks = tasks.filter((t) => t.assigneeId === filters.assigneeId);
      }
    }

    return tasks;
  }, [resolvedTasks, searchQuery, filters]);

  // Basic route protection
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  return (
    <TaskLayout
      view={view}
      setView={setView}
      onNewTask={handleNewTask}
      title={framework ? `${framework.name} Tasks` : undefined}
      filters={filters}
      onFiltersChange={setFilters}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p>Loading tasks...</p>
        </div>
      ) : view === 'board' ? (
        <TaskBoard onEditTask={handleEditTask} tasks={filteredTasks} />
      ) : (
        <TaskList onEditTask={handleEditTask} tasks={filteredTasks} />
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        defaultFrameworkId={frameworkId}
      />
    </TaskLayout>
  );
};

export default TaskManager;
