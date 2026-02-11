import { useState, useMemo } from 'react';
import TaskLayout from '@/components/tasks/TaskLayout';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskList from '@/components/tasks/TaskList';
import TaskModal from '@/components/tasks/TaskModal';
import { Task, useTasks } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useParams } from 'react-router-dom';
import { useFrameworks } from '@/contexts/FrameworkContext';

const TaskManager = () => {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { frameworkId } = useParams();
  const { getFramework } = useFrameworks();

  const framework = frameworkId ? getFramework(frameworkId) : undefined;
  
  const filteredTasks = useMemo(() => {
    if (frameworkId) {
        return tasks.filter(t => t.frameworkId === frameworkId);
    }
    return tasks;
  }, [tasks, frameworkId]);

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
      {view === 'board' ? (
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
