// services/organisation.ts
import api from "@/lib/api";
import {
  ApiOrganisation,
  ApiSchoolType,
  ApiAdminUser,
  ApiAuditLog,
  SchoolTypeCreatePayload,
  SchoolTypeUpdatePayload,
} from "@/types/organisation";

// ── Organisations ────────────────────────────────────────────────────────────

export const getOrganisations = async (
  skip = 0,
  limit = 100,
): Promise<ApiOrganisation[]> => {
  const response = await api.get<ApiOrganisation[]>("/admin/organisations/", {
    params: { skip, limit },
  });
  return response.data;
};

// ── School Types ─────────────────────────────────────────────────────────────

export const getSchoolTypes = async (
  skip = 0,
  limit = 100,
): Promise<ApiSchoolType[]> => {
  const response = await api.get<ApiSchoolType[]>("/admin/school-types", {
    params: { skip, limit },
  });
  return response.data;
};

export const createSchoolType = async (
  payload: SchoolTypeCreatePayload,
): Promise<ApiSchoolType> => {
  const response = await api.post<ApiSchoolType>(
    "/admin/school-types",
    payload,
  );
  return response.data;
};

export const updateSchoolType = async (
  id: string,
  payload: SchoolTypeUpdatePayload,
): Promise<ApiSchoolType> => {
  const response = await api.patch<ApiSchoolType>(
    `/admin/school-types/${id}`,
    payload,
  );
  return response.data;
};

export const deleteSchoolType = async (id: string): Promise<void> => {
  await api.delete(`/admin/school-types/${id}`);
};

// ── Admin Users ──────────────────────────────────────────────────────────────

export const getAdminUsers = async (): Promise<ApiAdminUser[]> => {
  const response = await api.get<ApiAdminUser[]>("/admin/auth/list");
  return response.data;
};

export const suspendAdminUser = async (userId: string): Promise<string> => {
  const response = await api.post<string>("/admin/auth/suspend", null, {
    params: { user_id: userId },
  });
  return response.data;
};

export const unsuspendAdminUser = async (userId: string): Promise<string> => {
  const response = await api.post<string>("/admin/auth/unsuspend", null, {
    params: { user_id: userId },
  });
  return response.data;
};

// ── Audit Logs ──────────────────────────────────────────────────────────────

export const getAuditLogs = async (
  skip = 0,
  limit = 100,
  category?: string,
): Promise<ApiAuditLog[]> => {
  const response = await api.get<ApiAuditLog[]>("/admin/audit-logs", {
    params: {
      skip,
      limit,
      ...(category && category !== "all" ? { category } : {}),
    },
  });
  return response.data;
};
