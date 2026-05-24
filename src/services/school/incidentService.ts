import api from "@/lib/api";
import { Incident, IncidentType, IncidentStatus, IncidentSeverity } from "@/types/incident";

export interface BackendIncident {
  id: string;
  organisation_id: string;
  category: string;
  title: string;
  student_name: string;
  reported_by_staff_id: string;
  assigned_officer_id?: string;
  date: string;
  time: string;
  description: string;
  severity?: string;
  status: string;
  documents?: any[];
  discussion?: any[];
  history?: any[];
  created_at: string;
  updated_at: string;
  location?: string;
  immediate_action?: string;
  is_urgent?: boolean;
}

export const mapBackendIncidentToFrontend = (item: BackendIncident): Incident => {
  // Map category to type
  let type: IncidentType = 'safeguarding';
  if (item.category === 'behavioral') {
    type = 'behavioral';
  } else if (item.category === 'health & safety' || item.category === 'health-safety' || item.category === 'health_safety') {
    type = 'health-safety';
  } else if (item.category === 'data_protection' || item.category === 'data-protection') {
    type = 'data-protection';
  } else if (item.category === 'fire_safety' || item.category === 'fire-safety') {
    type = 'fire-safety';
  }

  // Map status
  let status: IncidentStatus = 'submitted';
  if (item.status === 'open' || item.status === 'submitted') {
    status = 'submitted';
  } else if (item.status === 'draft') {
    status = 'draft';
  } else if (item.status === 'information_requested' || item.status === 'info-requested' || item.status === 'info_requested') {
    status = 'info-requested';
  } else if (item.status === 'action_in_progress' || item.status === 'under_review' || item.status === 'under-review') {
    status = 'under-review';
  } else if (item.status === 'resolved/closed' || item.status === 'finalized' || item.status === 'closed') {
    status = 'finalized';
  }

  return {
    id: item.id,
    title: item.title,
    type,
    status,
    studentName: item.student_name,
    location: item.location || 'Main Building',
    assignedTo: item.assigned_officer_id,
    incidentDate: item.date,
    incidentTime: item.time,
    description: item.description,
    immediateAction: item.immediate_action || 'None',
    isUrgent: item.is_urgent ?? false,
    reporterId: item.reported_by_staff_id,
    reporterName: 'Staff Member',
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    officerReview: item.severity ? {
      officerId: item.assigned_officer_id || '',
      officerName: 'Compliance Officer',
      severity: item.severity as IncidentSeverity,
    } : undefined,
    documents: item.documents || [],
    discussion: item.discussion || [],
    history: item.history || []
  };
};

export const schoolIncidentService = {
  listIncidents: async (): Promise<Incident[]> => {
    const response = await api.get<BackendIncident[]>("/school/incidents");
    const backendData = response.data || [];
    return backendData.map(mapBackendIncidentToFrontend);
  },

  listMyReports: async (limit = 10): Promise<{ total: number; limit: number; items: Incident[] }> => {
    const response = await api.get<{ total: number; limit: number; items: BackendIncident[] }>("/school/incidents/my-reports", {
      params: { limit }
    });
    return {
      total: response.data?.total ?? 0,
      limit: response.data?.limit ?? limit,
      items: (response.data?.items || []).map(mapBackendIncidentToFrontend)
    };
  },

  createIncident: async (data: {
    category: string;
    title: string;
    student_name: string;
    reported_by_staff_id: string;
    date: string;
    time: string;
    description: string;
    severity?: string;
  }): Promise<Incident> => {
    const response = await api.post<BackendIncident>("/school/incidents", data);
    return mapBackendIncidentToFrontend(response.data);
  },

  getIncidentDetail: async (incidentId: string): Promise<Incident> => {
    const response = await api.get<BackendIncident>(`/school/incidents/${incidentId}`);
    return mapBackendIncidentToFrontend(response.data);
  },

  editIncident: async (incidentId: string, data: { title?: string; description?: string }): Promise<Incident> => {
    const response = await api.patch<BackendIncident>(`/school/incidents/${incidentId}`, data);
    return mapBackendIncidentToFrontend(response.data);
  },

  updateStatus: async (incidentId: string, status: string): Promise<Incident> => {
    const response = await api.post<BackendIncident>(`/school/incidents/${incidentId}/status`, { status });
    return mapBackendIncidentToFrontend(response.data);
  },

  assignOfficer: async (incidentId: string, officerId: string): Promise<Incident> => {
    const response = await api.post<BackendIncident>(`/school/incidents/${incidentId}/assign`, { officer_id: officerId });
    return mapBackendIncidentToFrontend(response.data);
  },

  uploadDocument: async (incidentId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/school/incidents/${incidentId}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  addDiscussionMessage: async (incidentId: string, message: string): Promise<any> => {
    const response = await api.post(`/school/incidents/${incidentId}/discussion`, { message });
    return response.data;
  }
};
