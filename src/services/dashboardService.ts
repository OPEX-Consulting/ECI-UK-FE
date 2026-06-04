import api from "@/lib/api";
import {
  DashboardResponse,
  AdminStats,
  FrameworkComplianceResponse,
  LibraryStatusResponse,
  RecentIncidentsResponse,
} from "@/types/dashboard";

export const getAdminDashboardData = async (): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>("/admin/dashboard/");
  return response.data;
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<AdminStats>("/admin/stats");
  return response.data;
};

export const getFrameworkCompliance = async (): Promise<FrameworkComplianceResponse> => {
  const response = await api.get<FrameworkComplianceResponse>("/admin/stats/framework-compliance");
  return response.data;
};

export const getLibraryStatus = async (): Promise<LibraryStatusResponse> => {
  const response = await api.get<LibraryStatusResponse>("/admin/stats/library-status");
  return response.data;
};

export const getRecentIncidents = async (
  limit = 10,
): Promise<RecentIncidentsResponse> => {
  const response = await api.get<RecentIncidentsResponse>("/admin/stats/recent-incidents", {
    params: { limit },
  });
  return response.data;
};
