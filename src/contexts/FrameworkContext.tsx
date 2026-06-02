import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { schoolOrganisationService } from '@/services/school/organisationService';
import { useAuth } from './AuthContext';

export type FrameworkStatus = 'not-started' | 'in-progress' | 'implemented';

export interface Framework {
  id: string;
  name: string;
  description: string;
  authority: string;
  cycle: string;
  status: FrameworkStatus;
  taskCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface FrameworkContextType {
  frameworks: Framework[];
  isLoading: boolean;
  implementFramework: (id: string) => void;
  getFramework: (id: string) => Framework | undefined;
}

const mapApiFramework = (fw: any): Framework => {
  const taskCount = fw.themes?.reduce(
    (sum: number, theme: any) => sum + (theme.tasks?.length ?? 0),
    0
  ) ?? 0;

  return {
    id: fw.id,
    name: fw.title || fw.name,
    description: fw.description || '',
    authority: fw.authority || '',
    cycle: fw.cycle || '',
    status: taskCount > 0 ? 'implemented' : 'not-started',
    taskCount,
    riskLevel: fw.risk_level || 'medium',
  };
};

const FrameworkContext = createContext<FrameworkContextType | undefined>(undefined);

export const FrameworkProvider = ({ children }: { children: ReactNode }) => {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['organisation-frameworks'],
    queryFn: schoolOrganisationService.getFrameworks,
    enabled: !authLoading && !!user && user.role !== 'admin',
  });

  useEffect(() => {
    if (data) {
      const mapped: Framework[] = data.map(mapApiFramework);
      setFrameworks(mapped);
    }
  }, [data]);

  const implementFramework = (id: string) => {
    setFrameworks(prev => prev.map(fw =>
      fw.id === id ? { ...fw, status: 'implemented', taskCount: fw.taskCount || 33 } : fw
    ));

    toast.success('Framework implemented successfully', {
        description: 'Tasks have been generated and added to your board.'
    });
  };

  const getFramework = (id: string) => frameworks.find(fw => fw.id === id);

  return (
    <FrameworkContext.Provider value={{ frameworks, isLoading, implementFramework, getFramework }}>
      {children}
    </FrameworkContext.Provider>
  );
};

export const useFrameworks = () => {
  const context = useContext(FrameworkContext);
  if (context === undefined) {
    throw new Error('useFrameworks must be used within a FrameworkProvider');
  }
  return context;
};
