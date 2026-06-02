import api from "@/lib/api";
import { Task, TaskStatus } from "@/contexts/TaskContext";
import type { ApiFrameworkSubTask } from "@/types/framework";

/**
 * Maps frontend TaskStatus values (kebab-case) to backend enum values (snake_case).
 * Frontend: 'todo' | 'in-progress' | 'in-review' | 'done'
 * Backend:  'todo' | 'in_progress' | 'review'    | 'done'
 */
export const toBackendStatus = (status: string): string => {
  const map: Record<string, string> = {
    'todo': 'todo',
    'in-progress': 'in_progress',
    'in-review': 'review',
    'done': 'done',
  };
  return map[status] ?? status;
};

/**
 * Maps backend status values back to frontend TaskStatus values.
 */
export const toFrontendStatus = (status: string): TaskStatus => {
  const map: Record<string, TaskStatus> = {
    'todo': 'todo',
    'in_progress': 'in-progress',
    'review': 'in-review',
    'done': 'done',
  };
  return map[status] ?? (status as TaskStatus);
};

const mapBackendTaskToFrontend = (backendTask: any): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description ?? '',
    status: toFrontendStatus(backendTask.status || 'todo'),
    priority: backendTask.priority || 'medium',
    risk: backendTask.risk_level || 'medium',
    assigneeId: backendTask.assigned_to?.[0] || undefined,
    assigneeName: 'Unassigned',
    dueDate: backendTask.due_date || new Date().toISOString().split('T')[0],
    createdAt: backendTask.created_at,
    updatedAt: backendTask.updated_at,
    evidenceUploaded: backendTask.evidence_list?.length ? 100 : 0,
    attachments: backendTask.evidence_list || [],
    frameworkId: backendTask.framework_id,
    subTasks: backendTask.subtasks || backendTask.sub_tasks || undefined,
    actionItems: backendTask.action_items || undefined,
    legal_counsel_review: backendTask.legal_counsel_review ?? false,
  };
};

export const schoolTaskService = {
  /**
   * Get tasks for a specific framework.
   */
  getFrameworkTasks: async (frameworkId: string): Promise<Task[]> => {
    const response = await api.get<any[]>(`/school/tasks/frameworks/${frameworkId}`);
    return response.data.map(mapBackendTaskToFrontend);
  },

  /**
   * Get all tasks, with optional filtering.
   */
  getAllTasks: async (params?: { status?: string; framework_id?: string; organisation_id?: string }): Promise<Task[]> => {
    const response = await api.get<any[]>('/school/tasks', { params });
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
   * Update basic task fields (title, description, priority, risk, due date).
   */
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.risk !== undefined) payload.risk_level = updates.risk;
    if (updates.assigneeId !== undefined) payload.assigned_to = [updates.assigneeId];

    const response = await api.patch<any>(`/school/tasks/${taskId}`, payload);
    return mapBackendTaskToFrontend(response.data);
  },

  /**
   * Update task status. Translates frontend status to backend enum automatically.
   */
  updateTaskStatus: async (taskId: string, status: string): Promise<Task> => {
    const backendStatus = toBackendStatus(status);
    const response = await api.post<any>(`/school/tasks/${taskId}/status`, { status: backendStatus });
    return mapBackendTaskToFrontend(response.data);
  },

  /**
   * Assign task to one or more users.
   */
  assignTask: async (taskId: string, assigneeId: string): Promise<Task> => {
    const response = await api.post<any>(`/school/tasks/${taskId}/assign`, {
      assigned_to: [assigneeId],
    });
    return mapBackendTaskToFrontend(response.data);
  },

  /**
   * Create a new task via multipart form.
   */
  createTask: async (data: {
    title: string;
    description?: string;
    framework_id?: string;
    priority?: string;
    risk_level?: string;
    due_date?: string;
    assigned_to?: string[];
    organisation_id?: string;
  }): Promise<Task> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.framework_id) formData.append('framework_id', data.framework_id);
    if (data.priority) formData.append('priority', data.priority);
    if (data.risk_level) formData.append('risk_level', data.risk_level);
    if (data.due_date) formData.append('due_date', data.due_date);
    if (data.assigned_to?.length) formData.append('assigned_to', JSON.stringify(data.assigned_to));
    if (data.organisation_id) formData.append('organisation_id', data.organisation_id);

    const response = await api.post<any>('/school/tasks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapBackendTaskToFrontend(response.data);
  },

  /**
   * Add evidence to a task's action item.
   */
  addEvidence: async (taskId: string, actionItemId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    console.log("ADD_EVIDENCE_REQUEST:", {
      url: `/school/tasks/${taskId}/action-items/${actionItemId}/evidence`,
      method: "POST",
      actionItemId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    // Log FormData entries
    for (const [key, value] of (formData as any).entries()) {
      console.log("FORM_DATA_ENTRY:", { key, value });
    }
    const response = await api.post(
      `/school/tasks/${taskId}/action-items/${actionItemId}/evidence`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    console.log("ADD_EVIDENCE_RESPONSE:", response.data);
    return response.data;
  },

  /**
   * Add a subtask to a task.
   */
  addSubtask: async (taskId: string, data: { title: string; description?: string; evidence_required?: boolean }): Promise<ApiFrameworkSubTask> => {
    const response = await api.post<ApiFrameworkSubTask>(`/school/tasks/${taskId}/subtasks`, data);
    return response.data;
  },

  /**
   * Update a subtask's details.
   */
  updateSubtask: async (taskId: string, subtaskId: string, data: { title?: string; description?: string; evidence_required?: boolean; display_order?: number }): Promise<ApiFrameworkSubTask> => {
    const response = await api.patch<ApiFrameworkSubTask>(`/school/tasks/${taskId}/subtasks/${subtaskId}`, data);
    return response.data;
  },

  /**
   * Mark a subtask as complete.
   */
  completeSubtask: async (taskId: string, subtaskId: string): Promise<ApiFrameworkSubTask> => {
    const url = `/school/tasks/${taskId}/subtasks/${subtaskId}/complete`;
    const payload = { status: "completed" };
    console.log("COMPLETE_SUBTASK_REQUEST:", { url, method: "POST", payload });
    const response = await api.post<ApiFrameworkSubTask>(url, payload);
    console.log("COMPLETE_SUBTASK_RESPONSE:", response.data);
    return response.data;
  },

  /**
   * Delete a subtask.
   */
  deleteSubtask: async (taskId: string, subtaskId: string): Promise<void> => {
    await api.delete(`/school/tasks/${taskId}/subtasks/${subtaskId}`);
  },

  /**
   * Get task analytics data.
   */
  getTaskAnalytics: async (taskId: string): Promise<any> => {
    const response = await api.get(`/school/tasks/${taskId}/analytics`);
    return response.data;
  },

  /**
   * Toggle legal counsel review status for a task.
   */
  toggleLegalCounselReview: async (taskId: string): Promise<{ legal_counsel_review: boolean }> => {
    const response = await api.post<{ legal_counsel_review: boolean }>(
      `/school/tasks/${taskId}/legal-counsel-review/toggle`
    );
    return response.data;
  },
};
