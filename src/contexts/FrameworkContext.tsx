import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTasks } from './TaskContext';
import { toast } from 'sonner';

export type FrameworkStatus = 'not-started' | 'in-progress' | 'implemented';

export interface Framework {
  id: string;
  name: string;
  description: string;
  authority: string;
  cycle: string;
  status: FrameworkStatus;
  taskCount: number; // For display, mocked initially
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface FrameworkContextType {
  frameworks: Framework[];
  implementFramework: (id: string) => void;
  getFramework: (id: string) => Framework | undefined;
}

const MOCK_FRAMEWORKS: Framework[] = [
  {
    id: 'kcsie',
    name: 'Keeping Children Safe in Education (KCSIE)',
    description: 'Statutory guidance for schools and colleges on safeguarding children and safer recruitment. Updated annually by the DfE.',
    authority: 'Department for Education',
    cycle: 'Annual review',
    status: 'implemented',
    taskCount: 45,
    riskLevel: 'critical',
  },
  {
    id: 'hswa',
    name: 'Health & Safety at Work Act 1974',
    description: 'Fundamental framework ensuring the health, safety and welfare of all employees and visitors within the school premises.',
    authority: 'Health & Safety Executive',
    cycle: 'Ongoing / reactive',
    status: 'implemented',
    taskCount: 38,
    riskLevel: 'high',
  },
  {
    id: 'gdpr',
    name: 'UK GDPR & Data Protection Act 2018',
    description: 'Governs how personal data of students, parents and staff is collected, stored, processed and shared by the school.',
    authority: "Information Commissioner's Office",
    cycle: 'Ongoing / complaint-driven',
    status: 'implemented',
    taskCount: 28,
    riskLevel: 'high',
  },
  {
    id: 'fire-safety',
    name: 'Regulatory Reform (Fire Safety) Order 2005',
    description: 'Requires schools to carry out fire risk assessments, maintain fire safety equipment and train staff on evacuation procedures.',
    authority: 'Fire & Rescue Authority',
    cycle: 'Annual + reactive',
    status: 'implemented',
    taskCount: 22,
    riskLevel: 'high',
  },
  {
    id: 'send',
    name: 'SEND Code of Practice 2015',
    description: 'Guidance for identifying, assessing and supporting children with special educational needs and disabilities.',
    authority: 'Department for Education',
    cycle: 'Ofsted cycle',
    status: 'implemented',
    taskCount: 30,
    riskLevel: 'medium',
  },
  {
    id: 'ofsted',
    name: 'Ofsted Education Inspection Framework',
    description: 'The framework used by Ofsted inspectors to evaluate the quality of education, behaviour, personal development and leadership.',
    authority: 'Ofsted',
    cycle: 'Every 1-4 years',
    status: 'not-started',
    taskCount: 0,
    riskLevel: 'critical',
    // This one corresponds to the user request example of a framework to be implemented
  },
];

const FrameworkContext = createContext<FrameworkContextType | undefined>(undefined);

export const FrameworkProvider = ({ children }: { children: ReactNode }) => {
  const [frameworks, setFrameworks] = useState<Framework[]>(MOCK_FRAMEWORKS);
  const { } = useTasks();

  const implementFramework = (id: string) => {
    // 1. Update status
    setFrameworks(prev => prev.map(fw => 
      fw.id === id ? { ...fw, status: 'implemented', taskCount: 33 } : fw
    ));


    // 2. Mock AI Task Generation
    // Tasks are now pre-loaded from FRAMEWORK_MOCK_TASKS in TaskContext
    // This action just "activates" them in the UI by marking framework as implemented

    toast.success('Framework implemented successfully', {
        description: 'Tasks have been generated and added to your board.'
    });
  };

  const getFramework = (id: string) => frameworks.find(fw => fw.id === id);

  return (
    <FrameworkContext.Provider value={{ frameworks, implementFramework, getFramework }}>
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
