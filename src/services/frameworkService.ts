import api from '@/lib/api';
import type { ApiFramework, ApiFrameworkDraft } from '@/types/framework';

/** Upload a binary file and kick off AI extraction. */
export const uploadFrameworkDocument = async (
  file: File,
  onUploadProgress?: (percent: number) => void,
): Promise<ApiFrameworkDraft> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<ApiFrameworkDraft>(
    '/admin/frameworks/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onUploadProgress && evt.total) {
          onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    },
  );
  return response.data;
};

/** Submit a public URL for AI extraction. */
export const createFrameworkFromUrl = async (
  url_link: string,
): Promise<ApiFrameworkDraft> => {
  const formData = new FormData();
  formData.append('url_link', url_link);
  const response = await api.post<ApiFrameworkDraft>(
    '/admin/frameworks/',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};

/** Submit raw text for AI extraction. */
export const createFrameworkFromText = async (
  text: string,
): Promise<ApiFrameworkDraft> => {
  const formData = new FormData();
  formData.append('text', text);
  const response = await api.post<ApiFrameworkDraft>(
    '/admin/frameworks/',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};

/** List all framework drafts (excludes normalized_text from projection). */
export const getFrameworkDrafts = async (): Promise<ApiFrameworkDraft[]> => {
  const response = await api.get<ApiFrameworkDraft[]>('/admin/frameworks/drafts');
  return response.data;
};

/** List all published frameworks with organisation counts. */
export const getPublishedFrameworks = async (): Promise<ApiFramework[]> => {
  const response = await api.get<ApiFramework[]>('/admin/frameworks/');
  return response.data;
};

/** Fetch a single draft by UUID. */
export const getFrameworkDraft = async (id: string): Promise<ApiFrameworkDraft> => {
  const response = await api.get<ApiFrameworkDraft>(`/admin/frameworks/${id}`);
  return response.data;
};

/** Trigger Phase 2 synthesis for selected obligations. */
export const synthesizeTasks = async (
  id: string,
  selectedObligations: string[],
): Promise<ApiFrameworkDraft> => {
  const response = await api.post<ApiFrameworkDraft>(
    `/admin/frameworks/${id}/synthesize`,
    { selected_obligations: selectedObligations },
  );
  return response.data;
};

/** Re-run Phase 1 extraction with optional admin guidance. */
export const refineFrameworkObligations = async (
  id: string,
  additionalInstructions: string,
): Promise<ApiFrameworkDraft> => {
  const response = await api.post<ApiFrameworkDraft>(
    `/admin/frameworks/${id}/submit`,
    { additional_instructions: additionalInstructions.trim() },
  );
  return response.data;
};

/** Persist the editor's structured_content back to the backend. */
export const updateFrameworkStructure = async (
  id: string,
  structuredContent: ApiFramework,
): Promise<ApiFrameworkDraft> => {
  const response = await api.patch<ApiFrameworkDraft>(
    `/admin/frameworks/${id}`,
    structuredContent,
  );
  return response.data;
};

/** Publish a ready_for_review draft (requires manage_frameworks permission). */
export const publishFramework = async (id: string): Promise<ApiFrameworkDraft> => {
  const response = await api.post<ApiFrameworkDraft>(
    `/admin/frameworks/${id}/publish`,
  );
  return response.data;
};

/** Add Subtask */
export const addSubTask = async (
  taskId: string,
  subtask: {
    title: string;
    description?: string;
    evidence_required: boolean;
    display_order: number;
  }
): Promise<any> => {
  const response = await api.post(`/school/tasks/${taskId}/subtasks`, subtask);
  return response.data;
};

/** Update Subtask */
export const updateSubTask = async (
  taskId: string,
  subtaskId: string,
  subtask: {
    title: string;
    description?: string;
    evidence_required: boolean;
    display_order?: number;
  }
): Promise<any> => {
  const response = await api.patch(`/school/tasks/${taskId}/subtasks/${subtaskId}`, subtask);
  return response.data;
};

/** Delete Subtask */
export const deleteSubTask = async (
  taskId: string,
  subtaskId: string
): Promise<any> => {
  const response = await api.delete(`/school/tasks/${taskId}/subtasks/${subtaskId}`);
  return response.data;
};

