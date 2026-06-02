export const CLASSIFICATION_LABELS: Record<string, string> = {
  la_maintained: "Local Authority Maintained",
  academy_trust: "Multi-Academy Trust (MAT)",
  single_academy: "Single Academy Trust",
  proprietor: "Independent Proprietor body",

  early_years: "Early Years (0–5)",
  early_years_0_5: "Early Years (0–5)",
  primary: "Primary (5–11)",
  primary_5_11: "Primary (5–11)",
  secondary: "Secondary (11–16)",
  secondary_11_16: "Secondary (11–16)",
  sixth_form: "Sixth Form (16–18)",
  sixth_form_16_19: "Sixth Form (16–19)",

  sen: "SEN Provision",
  sen_provision: "SEN Provision",
  boarding: "Residential / Boarding",
  pupil_referral: "Pupil Referral / AP",
  pupil_referral_ap: "Pupil Referral / AP",
  international: "International Students",
  ey_attached: "Early Years Attached Provision",
  early_years_attached: "Early Years Attached Provision",

  transport: "School Transport",
  school_transport: "School Transport",
  remote_learning: "Online / Remote Learning",
  cctv: "CCTV in Use",
  cctv_in_use: "CCTV in Use",
  placements: "Work Placements",
  work_placements: "Work Placements",
  biometrics: "Biometric Systems",
  biometric_systems: "Biometric Systems",
  data_heavy: "Data Heavy Systems (large data sets, cloud systems)",
  data_heavy_systems: "Data Heavy Systems (large data sets, cloud systems)",

  role_admin: "School Admin",
  role_principal: "Principal / School Head",
  role_compliance_officer: "Officer-in-Charge / Compliance Officer",
  role_staff: "Staff Member",
};

export const formatClassification = (value: string): string => {
  return CLASSIFICATION_LABELS[value] ?? value;
};

export const formatClassificationList = (values: string[] | undefined): string => {
  if (!values || values.length === 0) return "N/A";
  return values.map(formatClassification).join(", ");
};
