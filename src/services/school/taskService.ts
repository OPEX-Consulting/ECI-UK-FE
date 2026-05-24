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
  },

  /**
   * Get task details by ID.
   */
  getTaskDetails: async (taskId: string): Promise<Task> => {
    const response = await api.get<any>(`/school/tasks/${taskId}`);
    return mapBackendTaskToFrontend(response.data);
  },

  /**
   * Update task details.
   */
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    // Map frontend properties back to backend if necessary
    const payload: any = { ...updates };
    if (updates.title) payload.title = updates.title;
    if (updates.description) payload.description = updates.description;
    if (updates.dueDate) payload.due_date = updates.dueDate;
    if (updates.priority) payload.priority = updates.priority;
    if (updates.risk) payload.risk_level = updates.risk;
    if (updates.assigneeId) payload.assigned_to = [updates.assigneeId];
    
    const response = await api.patch<any>(`/school/tasks/${taskId}`, payload);
    return mapBackendTaskToFrontend(response.data);
  },

  /**
   * Update task status.
   */
  updateTaskStatus: async (taskId: string, status: string): Promise<Task> => {
    const response = await api.post<any>(`/school/tasks/${taskId}/status`, { status });
    return mapBackendTaskToFrontend(response.data);
  },

  /**
   * Assign task to a user.
   */
  assignTask: async (taskId: string, assigneeId: string): Promise<Task> => {
    const response = await api.post<any>(`/school/tasks/${taskId}/assign`, {
      assigned_to: [assigneeId],
    });
    return mapBackendTaskToFrontend(response.data);
  }
};
