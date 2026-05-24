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

  /**
   * Get the frameworks assigned to the school's organisation.
   */
  getFrameworks: async (): Promise<any[]> => {
    const response = await api.get<any[]>("/school/organisation/frameworks");
    return response.data;
  },

  /**
   * Get all users in the school's organisation.
   */
  getUsers: async (): Promise<any[]> => {
    const response = await api.get<any[]>("/school/organisation/users");
    return response.data;
  },

  /**
   * Get all invitations/users.
   */
  getInvitations: async (): Promise<any[]> => {
    const response = await api.get<any[]>("/school/invitations");
    return response.data;
  },

  /**
   * Invite new users to the organisation.
   */
  inviteUser: async (emails: string[], role: string, name?: string): Promise<any> => {
    const response = await api.post<any>("/school/invitations", { emails, role, name: name ?? "" });
    return response.data;
  },
};
