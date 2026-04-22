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
