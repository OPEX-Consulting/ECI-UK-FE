import { useState } from 'react';
import TaskLayout from '@/components/tasks/TaskLayout';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskList from '@/components/tasks/TaskList';
import TaskModal from '@/components/tasks/TaskModal';
import { Task } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const TaskManager = () => {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { user } = useAuth();

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
    >
      {view === 'board' ? (
        <TaskBoard onEditTask={handleEditTask} />
      ) : (
        <TaskList onEditTask={handleEditTask} />
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={editingTask}
      />
    </TaskLayout>
  );
};

export default TaskManager;
