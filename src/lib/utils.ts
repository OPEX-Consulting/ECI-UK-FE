import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRole } from "@/types/incident";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeSchoolRole(role: string | undefined | null): UserRole {
  if (!role) return 'staff';
  const clean = role.toLowerCase();
  if (clean === 'role_admin' || clean === 'role_principal' || clean === 'admin' || clean === 'principal') {
    return 'principal';
  }
  if (clean === 'role_compliance_officer' || clean === 'compliance_officer' || clean === 'officer') {
    return 'officer';
  }
  if (clean === 'role_staff' || clean === 'staff') {
    return 'staff';
  }
  return 'staff'; // default fallback
}
