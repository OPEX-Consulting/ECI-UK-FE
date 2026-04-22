import api from "@/lib/api";
import { DashboardResponse } from "@/types/dashboard";

/**
 * Fetch the main admin dashboard data
 */
export const getAdminDashboardData = async (): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>("/admin/dashboard/");
  return response.data;
};
