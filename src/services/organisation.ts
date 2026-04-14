import api from "@/lib/api";
import { ApiOrganisation, ApiSchoolType } from "@/types/organisation";


export const getOrganisations = async (skip = 0, limit = 100): Promise<ApiOrganisation[]> => {
  const response = await api.get<ApiOrganisation[]>("/admin/organisations/", {
    params: { skip, limit }
  });
  return response.data;
};

export const getSchoolTypes = async (skip = 0, limit = 100): Promise<ApiSchoolType[]> => {
  console.log("Fetching school types with params:", { skip, limit });
  const response = await api.get<ApiSchoolType[]>("/admin/school-types", {
    params: { skip, limit }
  });
  console.log("School types API response:", response.data);
  return response.data;
};

