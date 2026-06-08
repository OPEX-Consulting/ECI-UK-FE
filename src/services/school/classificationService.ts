import api from "@/lib/api";

export interface ClassificationStepRequest {
  step: number;
  payload: Record<string, unknown>;
}

const BACKEND_VALUES: Record<string, Record<string, string>> = {
  funding_governance: {
    la_maintained: "local_authority_maintained",
    academy_trust: "academy_trust",
    single_academy: "academy_trust",
    proprietor: "independent_proprietor",
  },
  age_ranges: {
    early_years: "early_years_0_5",
    primary: "primary_5_11",
    secondary: "secondary_11_16",
    sixth_form: "sixth_form_16_18",
  },
  special_provisions: {
    sen: "sen_provision",
    boarding: "residential_boarding",
    pupil_referral: "pupil_referral_ap",
    international: "international_students",
    ey_attached: "early_years_attached",
  },
  operational_activities: {
    transport: "school_transport",
    remote_learning: "online_remote_learning",
    cctv: "cctv_in_use",
    placements: "work_placements",
    biometrics: "biometric_systems",
    data_heavy: "data_heavy_systems",
  },
};

const toBackendValue = (group: string, key: string): string =>
  BACKEND_VALUES[group]?.[key] ?? key;

const mapValues = (group: string, keys: string[]): string[] =>
  keys.map((k) => toBackendValue(group, k));

export const buildStepPayload = (
  stepId: string,
  data: {
    schoolType: string;
    fundingType: string;
    ageRanges: string[];
    specialProvisions: string[];
    operationalActivities: string[];
  },
  _startupData?: { id: string; group: string; data: Record<string, string> }[]
): Record<string, unknown> => {
  switch (stepId) {
    case "schoolType":
      return { school_type_id: data.schoolType };
    case "fundingType":
      return { funding_governance: toBackendValue("funding_governance", data.fundingType) };
    case "ageRanges":
      return { age_ranges: mapValues("age_ranges", data.ageRanges) };
    case "specialProvisions":
      return { special_provisions: mapValues("special_provisions", data.specialProvisions) };
    case "operationalActivities":
      return { operational_activities: mapValues("operational_activities", data.operationalActivities) };
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
