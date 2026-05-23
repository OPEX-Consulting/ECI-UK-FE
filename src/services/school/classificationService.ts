import api from "@/lib/api";

export interface ClassificationStepRequest {
  step: number;
  payload: Record<string, unknown>;
}

export const buildStepPayload = (
  stepId: string,
  data: {
    schoolType: string;
    fundingType: string;
    ageRanges: string[];
    specialProvisions: string[];
    operationalActivities: string[];
  },
  startupData?: { id: string, group: string, data: Record<string, string> }[]
): Record<string, unknown> => {
  const getMap = (group: string) => startupData?.find(g => g.group === group)?.data || {};

  switch (stepId) {
    case "schoolType":
      return { school_type_id: data.schoolType };
    case "fundingType": {
      const fMap = getMap("funding_governance");
      return { funding_governance: fMap[data.fundingType] || data.fundingType };
    }
    case "ageRanges": {
      const aMap = getMap("age_ranges");
      return {
        age_ranges: data.ageRanges.map((val) => aMap[val] || val),
      };
    }
    case "specialProvisions": {
      const sMap = getMap("special_provisions");
      return {
        special_provisions: data.specialProvisions.map(
          (val) => sMap[val] || val
        ),
      };
    }
    case "operationalActivities": {
      const oMap = getMap("operational_activities");
      return {
        operational_activities: data.operationalActivities.map(
          (val) => oMap[val] || val
        ),
      };
    }
    default:
      return {};
  }
};

export interface ClassificationStepResponse {
  message: string;
  next_stage: string;
  school: {
    official_domain: string;
    country: string;
    region_or_local_authority: string;
    school_type_id: string;
    funding_governance: string;
    age_ranges: string[];
    special_provisions: string[];
    operational_activities: string[];
    compliance_summary: Record<string, unknown>;
  };
}

export interface ClassificationSummaryResponse {
  message: string;
  frameworks: { id: string; name: string }[];
  regulators: string[];
  high_risk_focus_areas: string[];
  organization?: {
    name: string;
    domain: string;
    country: string;
    region: string;
  };
}

export const classificationService = {
  /**
   * Save a single compliance classification step.
   * Called on every "Next" click in the wizard.
   * step: 1-5 (1-indexed, matching STEPS array position + 1)
   */
  saveStep: async (data: ClassificationStepRequest): Promise<ClassificationStepResponse> => {
    const response = await api.post<ClassificationStepResponse>(
      "/school/classification/step",
      data
    );
    return response.data;
  },

  /**
   * Fetch the classification summary after all 5 steps are complete.
   * Returns identified frameworks, regulators, and high-risk focus areas.
   */
  getSummary: async (): Promise<ClassificationSummaryResponse> => {
    const response = await api.get<ClassificationSummaryResponse>(
      "/school/classification/summary"
    );
    return response.data;
  },

  /**
   * Fetch available school types for the compliance wizard.
   */
  getSchoolTypes: async (skip = 0, limit = 100): Promise<import("@/types/organisation").ApiSchoolType[]> => {
    const response = await api.get<import("@/types/organisation").ApiSchoolType[]>("/school-types", {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Fetch startup data mappings for compliance wizard.
   */
  getStartupData: async (skip = 0, limit = 100): Promise<{ id: string, group: string, data: Record<string, string> }[]> => {
    const response = await api.get<{ id: string, group: string, data: Record<string, string> }[]>("/startup-data", {
      params: { skip, limit },
    });
    return response.data;
  },
};
