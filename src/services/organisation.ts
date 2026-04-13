import api from "@/lib/api";
import { ApiOrganisation } from "@/types/organisation";


export const getOrganisations = async (skip = 0, limit = 100): Promise<ApiOrganisation[]> => {
  const response = await api.get<ApiOrganisation[]>("/admin/organisations/", {
    params: { skip, limit }
  });
  return response.data;
};
