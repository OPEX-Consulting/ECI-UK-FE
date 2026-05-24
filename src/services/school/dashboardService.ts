import api from "@/lib/api";

export interface IncidentCategorySummary {
  total: number;
  finalized: number;
  label: string;
  framework_ref: string;
}

export interface PrincipalDashboardResponse {
  incident_readiness: {
    total_tasks: number;
    completed_tasks: number;
    percentage: number;
  };
  total_incidents: IncidentCategorySummary;
  safeguarding: IncidentCategorySummary;
  behavioral: IncidentCategorySummary;
  health_and_safety: IncidentCategorySummary;
}

export interface StaffDashboardResponse {
  total_this_term: number;
  awaiting_review: number;
  info_requested: number;
  finalized: number;
  term_label: string;
  term_start: string;
}

export const schoolDashboardService = {
  getPrincipalDashboard: async (): Promise<PrincipalDashboardResponse> => {
    const response = await api.get<PrincipalDashboardResponse>("/school/dashboard");
    return response.data;
  },
  getStaffDashboard: async (): Promise<StaffDashboardResponse> => {
    const response = await api.get<StaffDashboardResponse>("/school/incidents/my-dashboard");
    return response.data;
  },
};
