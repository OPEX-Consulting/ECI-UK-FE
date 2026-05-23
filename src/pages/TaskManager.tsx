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

const TaskManager = () => {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { user } = useAuth();
  const { tasks: localTasks } = useTasks();
  const { frameworkId } = useParams();
  const { getFramework } = useFrameworks();

  const framework = frameworkId ? getFramework(frameworkId) : undefined;
  
  const { data: apiTasks, isLoading } = useQuery({
    queryKey: ['school-tasks', frameworkId],
    queryFn: () => frameworkId ? schoolTaskService.getFrameworkTasks(frameworkId) : schoolTaskService.getAllTasks(),
    enabled: !!user && user.role !== 'admin'
  });

  const filteredTasks = useMemo(() => {
    // If we have data from API, use it. Otherwise fallback to context localTasks (or empty)
    if (apiTasks) {
      return apiTasks;
    }
    
    // Fallback logic
    if (frameworkId) {
        return localTasks.filter(t => t.frameworkId === frameworkId);
    }
    return localTasks;
  }, [apiTasks, localTasks, frameworkId]);

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
