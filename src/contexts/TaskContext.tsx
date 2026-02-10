import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, HARDCODED_USERS } from '@/types/incident';

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskRisk = 'low' | 'medium' | 'high';

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  risk: TaskRisk;
  assigneeId?: string;
  assigneeName?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  evidenceUploaded: number; // Percentage 0-100
  attachments: TaskAttachment[];
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'evidenceUploaded' | 'attachments'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByAssignee: (assigneeId: string) => Task[];
}

const MOCK_TASKS: Task[] = [
  {
    id: 'TSK-392',
    title: 'Server Access Review Q3',
    description: 'Quarterly review of server access logs and permissions.',
    status: 'todo',
    priority: 'high',
    risk: 'high',
    assigneeId: 'user-2', // John Samuel (Staff)
    assigneeName: 'John Samuel',
    dueDate: '2024-10-24',
    createdAt: '2024-10-01',
    updatedAt: '2024-10-01',
    evidenceUploaded: 0,
    attachments: [],
  },
  {
    id: 'TSK-205',
    title: 'SOC2 Type II Audit Prep',
    description: 'Prepare evidence for upcoming SOC2 audit.',
    status: 'in-progress',
    priority: 'high',
    risk: 'high',
    assigneeId: 'user-2',
    assigneeName: 'John Samuel',
    dueDate: '2024-10-20',
    createdAt: '2024-09-15',
    updatedAt: '2024-10-10',
    evidenceUploaded: 65,
    attachments: [
      {
        id: 'att-1',
        name: 'audit-preliminary-results.pdf',
        size: 1024 * 1024 * 2.5, // 2.5MB
        type: 'application/pdf',
        uploadedAt: '2024-10-02T10:00:00Z',
        uploadedBy: 'John Samuel'
      }
    ],
  },
  {
    id: 'TSK-119',
    title: 'Firewall Configuration Audit',
    description: 'Audit firewall rules against security policy.',
    status: 'in-review',
    priority: 'medium',
    risk: 'medium',
    assigneeId: 'user-2',
    assigneeName: 'John Samuel',
    dueDate: '2024-10-25',
    createdAt: '2024-10-05',
    updatedAt: '2024-10-18',
    evidenceUploaded: 95,
    attachments: [],
  },
  {
    id: 'TSK-401',
    title: 'Update Privacy Policy',
    description: 'Review and update privacy policy for new regulations.',
    status: 'todo',
    priority: 'medium',
    risk: 'medium',
    assigneeId: 'user-2',
    assigneeName: 'John Samuel',
    dueDate: '2024-11-01',
    createdAt: '2024-10-15',
    updatedAt: '2024-10-15',
    evidenceUploaded: 10,
    attachments: [],
  },
  {
    id: 'TSK-442',
    title: 'Vendor Risk Assessments',
    description: 'Conduct risk assessments for new vendors.',
    status: 'todo',
    priority: 'low',
    risk: 'low',
    assigneeId: 'user-3', // Sammy Jay (Officer) - though usually staff does work
    assigneeName: 'Sammy Jay', 
    dueDate: '2024-11-10',
    createdAt: '2024-10-18',
    updatedAt: '2024-10-18',
    evidenceUploaded: 0,
    attachments: [],
  }
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'evidenceUploaded' | 'attachments'>) => {
    const task: Task = {
      ...newTask,
      id: `TSK-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      evidenceUploaded: 0,
      attachments: [],
    };
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getTasksByAssignee = (assigneeId: string) => {
    return tasks.filter(task => task.assigneeId === assigneeId);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTasksByAssignee }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
