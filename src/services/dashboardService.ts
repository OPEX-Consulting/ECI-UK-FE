import api from "@/lib/api";
import {
  DashboardResponse,
  AdminStats,
  FrameworkComplianceItem,
  LibraryStatusItem,
  PaginatedIncidents,
} from "@/types/dashboard";

export const getAdminDashboardData = async (): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>("/admin/dashboard/");
  return response.data;
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<AdminStats>("/admin/stats");
  return response.data;
};

export const getFrameworkCompliance = async (): Promise<FrameworkComplianceItem[]> => {
  const response = await api.get<FrameworkComplianceItem[]>("/admin/stats/framework-compliance");
  return response.data;
};

export const getLibraryStatus = async (): Promise<LibraryStatusItem[]> => {
  const response = await api.get<LibraryStatusItem[]>("/admin/stats/library-status");
  return response.data;
};

export const getRecentIncidents = async (
  page = 1,
  limit = 10,
): Promise<PaginatedIncidents> => {
  const response = await api.get<PaginatedIncidents>("/admin/stats/recent-incidents", {
    params: { page, limit },
  });
  return response.data;
};
