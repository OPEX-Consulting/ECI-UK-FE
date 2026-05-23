import api from "@/lib/api";

export interface ClassificationStepRequest {
  step: number;
  payload: Record<string, unknown>;
}

// Map UI selection values to API-expected slugs
const AGE_RANGES_MAP: Record<string, string> = {
  early_years: "early_years_0_5",
  primary: "primary_5_11",
  secondary: "secondary_11_16",
  sixth_form: "sixth_form_16_18",
};

const SPECIAL_PROVISIONS_MAP: Record<string, string> = {
  sen: "sen_provision",
  boarding: "residential_boarding",
  pupil_referral: "pupil_referral_ap",
  international: "international_students",
  ey_attached: "early_years_attached",
};

const OPERATIONAL_ACTIVITIES_MAP: Record<string, string> = {
  transport: "school_transport",
  remote_learning: "online_remote_learning",
  cctv: "cctv_in_use",
  placements: "work_placements",
  biometrics: "biometric_systems",
  data_heavy: "data_heavy_systems",
};

/**
 * Builds the correct payload object for each compliance wizard step.
 */
export const buildStepPayload = (
  stepId: string,
  data: {
    schoolType: string;
    fundingType: string;
    ageRanges: string[];
    specialProvisions: string[];
    operationalActivities: string[];
  }
): Record<string, unknown> => {
  switch (stepId) {
    case "schoolType":
      return { school_type_id: data.schoolType };
    case "fundingType":
      return { funding_governance: data.fundingType };
    case "ageRanges":
      return {
        age_ranges: data.ageRanges.map((val) => AGE_RANGES_MAP[val] || val),
      };
    case "specialProvisions":
      return {
        special_provisions: data.specialProvisions.map(
          (val) => SPECIAL_PROVISIONS_MAP[val] || val
        ),
      };
    case "operationalActivities":
      return {
        operational_activities: data.operationalActivities.map(
          (val) => OPERATIONAL_ACTIVITIES_MAP[val] || val
        ),
      };
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
  frameworks: string[];
  regulators: string[];
  high_risk_focus_areas: string[];
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
};
