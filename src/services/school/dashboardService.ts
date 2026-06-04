import api from "@/lib/api";
import type {
  OperationalComplianceVelocity,
  PendingInstitutionalActionsResponse,
  InstitutionalDistributionResponse,
  FrameworkHealthResponse,
  RecentOperationalIncidentsResponse,
  TeacherDashboardStats,
  TeacherActivityResponse,
  ActiveAssignmentsResponse,
  FrameworkContributionResponse,
  DashboardStatsResponse,
  FrameworkComplianceListResponse,
  UrgentActionsResponse,
} from "@/types/schoolStats";

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

const BASE = "/school/stats";

export const schoolDashboardService = {
  // ── Existing ────────────────────────────────────────────────────────────────
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
  // ── Principal ───────────────────────────────────────────────────────────────
  getComplianceVelocity: async (): Promise<OperationalComplianceVelocity> => {
    const response = await api.get<OperationalComplianceVelocity>(`${BASE}/compliance-velocity`);
    return response.data;
  },
  getPendingActions: async (): Promise<PendingInstitutionalActionsResponse> => {
    const response = await api.get<PendingInstitutionalActionsResponse>(`${BASE}/pending-actions`);
    return response.data;
  },
  getDistribution: async (): Promise<InstitutionalDistributionResponse> => {
    const response = await api.get<InstitutionalDistributionResponse>(`${BASE}/distribution`);
    return response.data;
  },
  getFrameworkHealth: async (): Promise<FrameworkHealthResponse> => {
    const response = await api.get<FrameworkHealthResponse>(`${BASE}/framework-health`);
    return response.data;
  },
  getRecentIncidents: async (page = 1, limit = 20): Promise<RecentOperationalIncidentsResponse> => {
    const response = await api.get<RecentOperationalIncidentsResponse>(`${BASE}/recent-incidents`, {
      params: { page, limit },
    });
    return response.data;
  },
  // ── Teacher ─────────────────────────────────────────────────────────────────
  getTeacherDashboard: async (): Promise<TeacherDashboardStats> => {
    const response = await api.get<TeacherDashboardStats>(`${BASE}/teacher/dashboard`);
    return response.data;
  },
  getTeacherActivity: async (): Promise<TeacherActivityResponse> => {
    const response = await api.get<TeacherActivityResponse>(`${BASE}/teacher/activity`);
    return response.data;
  },
  getTeacherAssignments: async (): Promise<ActiveAssignmentsResponse> => {
    const response = await api.get<ActiveAssignmentsResponse>(`${BASE}/teacher/assignments`);
    return response.data;
  },
  getTeacherFrameworkContribution: async (): Promise<FrameworkContributionResponse> => {
    const response = await api.get<FrameworkContributionResponse>(`${BASE}/teacher/framework-contribution`);
    return response.data;
  },
  // ── Officer ─────────────────────────────────────────────────────────────────
  getOfficerDashboard: async (): Promise<DashboardStatsResponse> => {
    const response = await api.get<DashboardStatsResponse>(`${BASE}/dashboard`);
    return response.data;
  },
  getOfficerFrameworkCompliance: async (): Promise<FrameworkComplianceListResponse> => {
    const response = await api.get<FrameworkComplianceListResponse>(`${BASE}/framework-compliance`);
    return response.data;
  },
  getUrgentActions: async (): Promise<UrgentActionsResponse> => {
    const response = await api.get<UrgentActionsResponse>(`${BASE}/urgent-actions`);
    return response.data;
  },
};
