import api from "@/lib/api";
import { Task } from "@/contexts/TaskContext";

const mapBackendTaskToFrontend = (backendTask: any): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description,
    status: backendTask.status || 'todo',
    priority: backendTask.priority || 'medium',
    risk: backendTask.risk_level || 'medium',
    assigneeId: backendTask.assigned_to?.[0] || undefined,
    assigneeName: 'Unassigned', // we can map this later if needed
    dueDate: backendTask.due_date || new Date().toISOString().split('T')[0],
    createdAt: backendTask.created_at,
    updatedAt: backendTask.updated_at,
    evidenceUploaded: backendTask.evidence_list?.length ? 100 : 0,
    attachments: backendTask.evidence_list || [],
    frameworkId: backendTask.framework_id,
  };
};

export const schoolTaskService = {
  /**
   * Get tasks for a specific framework.
   */
  getFrameworkTasks: async (frameworkId: string): Promise<Task[]> => {
    const response = await api.get<any[]>(`/school/tasks/frameworks/${frameworkId}`);
    // console.log('tasks response', response.data);
    return response.data.map(mapBackendTaskToFrontend);
  },

  /**
   * Get all tasks, with optional filtering.
   */
  getAllTasks: async (params?: { status?: string; framework_id?: string; organisation_id?: string }): Promise<Task[]> => {
    const response = await api.get<any[]>('/school/tasks', { params });
    // console.log('all tasks response', response.data);
    return response.data.map(mapBackendTaskToFrontend);
  }
};
