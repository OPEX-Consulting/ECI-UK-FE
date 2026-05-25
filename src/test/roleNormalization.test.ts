import { describe, it, expect } from 'vitest';
import { normalizeSchoolRole } from '@/lib/utils';

describe('normalizeSchoolRole', () => {
  it('should normalize principal-level roles to principal', () => {
    expect(normalizeSchoolRole('role_admin')).toBe('principal');
    expect(normalizeSchoolRole('role_principal')).toBe('principal');
    expect(normalizeSchoolRole('admin')).toBe('principal');
    expect(normalizeSchoolRole('principal')).toBe('principal');
    expect(normalizeSchoolRole('ROLE_ADMIN')).toBe('principal');
    expect(normalizeSchoolRole('Role_Principal')).toBe('principal');
  });

  it('should normalize compliance-officer-level roles to officer', () => {
    expect(normalizeSchoolRole('role_compliance_officer')).toBe('officer');
    expect(normalizeSchoolRole('compliance_officer')).toBe('officer');
    expect(normalizeSchoolRole('officer')).toBe('officer');
    expect(normalizeSchoolRole('ROLE_COMPLIANCE_OFFICER')).toBe('officer');
    expect(normalizeSchoolRole('Compliance_Officer')).toBe('officer');
  });

  it('should normalize staff-level roles to staff', () => {
    expect(normalizeSchoolRole('role_staff')).toBe('staff');
    expect(normalizeSchoolRole('staff')).toBe('staff');
    expect(normalizeSchoolRole('ROLE_STAFF')).toBe('staff');
    expect(normalizeSchoolRole('Staff')).toBe('staff');
  });

  it('should fallback to staff for unknown or empty roles', () => {
    expect(normalizeSchoolRole(null)).toBe('staff');
    expect(normalizeSchoolRole(undefined)).toBe('staff');
    expect(normalizeSchoolRole('')).toBe('staff');
    expect(normalizeSchoolRole('unknown_role')).toBe('staff');
  });
});
