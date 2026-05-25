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

export interface SeverityDistributionResponse {
  low: number;
  medium: number;
  high: number;
  critical: number;
  total_documented: number;
  total_all_time: number;
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
  getSeverityDistribution: async (): Promise<SeverityDistributionResponse> => {
    const response = await api.get<SeverityDistributionResponse>("/school/incidents/severity-distribution");
    return response.data;
  },
};
