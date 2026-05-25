import { AppLayout } from '@/components/layout/AppLayout';
import { useFrameworks } from '@/contexts/FrameworkContext';
import FrameworkCard from '@/components/frameworks/FrameworkCard';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

const Frameworks = () => {
  const { frameworks, isLoading } = useFrameworks();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="">
              <h1 className="text-2xl font-serif tracking-tight text-slate-900">
              Frameworks & Standards</h1>
             <p className="text-muted-foreground text-sm">
                Browse, implement, and track compliance frameworks applicable to your school
            </p>
        </div>

        <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search tasks, incidents, policies..." 
                className="pl-9 max-w-md bg-white"
            />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Loading frameworks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {frameworks.map(fw => (
                  <FrameworkCard key={fw.id} framework={fw} />
              ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Frameworks;
