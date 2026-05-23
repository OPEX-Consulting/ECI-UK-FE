import api from "@/lib/api";

export interface ClassificationStepRequest {
  step: number;
  payload: Record<string, unknown>;
}

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
      return { school_type: data.schoolType };
    case "fundingType":
      return { funding_type: data.fundingType };
    case "ageRanges":
      return { age_ranges: data.ageRanges };
    case "specialProvisions":
      return { special_provisions: data.specialProvisions };
    case "operationalActivities":
      return { operational_activities: data.operationalActivities };
    default:
      return {};
  }
};

export const classificationService = {
  /**
   * Save a single compliance classification step.
   * Called on every "Next" click in the wizard.
   * step: 1-5 (1-indexed, matching STEPS array position + 1)
   */
  saveStep: async (data: ClassificationStepRequest): Promise<void> => {
    await api.post("/school/classification/step", data);
  },
};
