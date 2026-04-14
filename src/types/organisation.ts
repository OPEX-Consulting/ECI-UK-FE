export type OrgStatus = "Active" | "Onboarding" | "Suspended";

export interface ApiOrganisation {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  assigned_frameworks: string[];
  metadata?: {
    region?: string;
    compliance_score?: number;
    total_users?: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface Organisation {
  id: string;
  name: string;
  schoolType: string;
  status: OrgStatus;
  region: string;
  compliance: number;
  frameworks: number;
  users: number;
}

export interface ApiSchoolType {
  id: string;
  name: string;
  slug: string;
  description: string;
  country: string;
  status: string; // "active" | "deprecated"
  orgs_using: number;
  created_at: string;
  updated_at: string;
}

export interface SchoolTypeCreatePayload {
  name: string;
  description: string;
  country: string;
  status?: string;
}

export interface SchoolTypeUpdatePayload {
  name?: string;
  description?: string;
  country?: string;
  status?: string;
}
