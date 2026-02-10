import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, LayoutGrid, List as ListIcon, Filter } from 'lucide-react';
import { useTasks } from '@/contexts/TaskContext';
import { AppLayout } from '@/components/layout/AppLayout';

interface TaskLayoutProps {
  children: ReactNode;
  view: 'board' | 'list';
  setView: (view: 'board' | 'list') => void;
  onNewTask: () => void;
}

const TaskLayout = ({ children, view, setView, onNewTask }: TaskLayoutProps) => {
  const { user } = useAuth();
  const { tasks } = useTasks();

  // RBAC: Only Principal can create tasks
  const canCreateTask = user?.role === 'principal';

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header Content - Custom for Task Manager */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Task Manager</h1>
            <p className="text-muted-foreground">
              Manage compliance remediation tasks and regulatory requirements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-9 w-[200px] md:w-[300px]"
              />
            </div>
            {canCreateTask && (
              <Button onClick={onNewTask} className="hidden md:flex">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={view} onValueChange={(v) => setView(v as 'board' | 'list')} className="w-[200px]">
            <TabsList>
              <TabsTrigger value="board" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <ListIcon className="h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
             <Button variant="outline" size="sm" className="h-8 border-dashed">
                <Filter className="mr-2 h-3.5 w-3.5" />
                Filter
             </Button>
          </div>
          
          {canCreateTask && (
             <Button onClick={onNewTask} className="md:hidden w-full">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskLayout;
