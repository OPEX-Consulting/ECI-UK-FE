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
  } else if (item.category === 'health & safety' || item.category === 'health-safety') {
    type = 'health-safety';
  } else if (item.category === 'data_protection' || item.category === 'data-protection') {
    type = 'data-protection';
  } else if (item.category === 'fire_safety' || item.category === 'fire-safety') {
    type = 'fire-safety';
  }

  // Map status
  let status: IncidentStatus = 'submitted';
  if (item.status === 'open') {
    status = 'submitted';
  } else if (item.status === 'information_requested') {
    status = 'info-requested';
  } else if (item.status === 'action_in_progress') {
    status = 'under-review';
  } else if (item.status === 'resolved/closed') {
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
    } : undefined
  };
};

export const schoolIncidentService = {
  listIncidents: async (): Promise<Incident[]> => {
    const response = await api.get<BackendIncident[]>("/school/incidents");
    const backendData = response.data || [];
    return backendData.map(mapBackendIncidentToFrontend);
  },
};
