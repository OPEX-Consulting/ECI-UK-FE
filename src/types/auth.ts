export type AdminRole =
  | "super_admin"
  | "platform_admin"
  | "content_contributor"
  | "principal"
  | "officer"
  | "staff";

export type Permission =
  | "manage_admins"
  | "manage_frameworks"
  | "contribute_frameworks"
  | "manage_school_types"
  | "manage_organisations"
  | "view_dashboard"
  | "view_audit_log"
  | "view_frameworks";

export const ROLE_PERMISSIONS: Record<Permission, AdminRole[]> = {
  manage_admins: ["super_admin", "platform_admin"],
  manage_frameworks: ["super_admin", "platform_admin"],
  contribute_frameworks: [
    "super_admin",
    "platform_admin",
    "content_contributor",
  ],
  manage_school_types: ["super_admin", "platform_admin"],
  manage_organisations: ["super_admin", "platform_admin"],
  view_dashboard: ["super_admin", "platform_admin", "principal", "officer"],
  view_audit_log: ["super_admin", "platform_admin", "principal"],
  view_frameworks: [
    "super_admin",
    "platform_admin",
    "principal",
    "officer",
    "staff",
  ],
};

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: "active" | "invited" | "suspended";
  invited_by: string | null;
  last_login: string | null;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface SchoolLoginResponse {
  access_token: string;
  token_type: string;
  stage: "activated" | "pending" | "suspended" | string;
}

/** Shape of a decoded school JWT payload (sub=email, uid, typ, exp). */
export interface SchoolJwtPayload {
  sub: string; // email
  uid: string;
  typ: string; // "school_user"
  exp: number;
}

export type SchoolUserRole =
  | "principal"
  | "officer"
  | "staff"
  | "role_principal"
  | "role_compliance_officer"
  | "role_staff"
  | "role_admin"
  | "admin";

/** Represents a logged-in school user (derived from JWT + API profile). */
export interface SchoolUser {
  id: string;
  email: string;
  name: string;
  role: SchoolUserRole;
  stage: string;
}

export interface SchoolSignUpRequest {
  email: string;
  password: string;
  confirm_password: string;
  name: string;
}
