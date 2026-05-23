import api from "@/lib/api";

export interface OrganisationSetupRequest {
  organisation_name: string;
  official_domain: string;
  country: string;
  region_or_local_authority: string;
}

export interface OrganisationSetupResponse {
  status: string;
  organisation_id: string;
  dashboard_locked: boolean;
  message: string;
}

export const schoolOrganisationService = {
  /**
   * Set up the school's organisation details after signup.
   * Requires a valid Bearer token (set during signup).
   */
  setup: async (
    data: OrganisationSetupRequest
  ): Promise<OrganisationSetupResponse> => {
    const response = await api.post<OrganisationSetupResponse>(
      "/school/organisation/setup",
      data
    );
    return response.data;
  },
};
