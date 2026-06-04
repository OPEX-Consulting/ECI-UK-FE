export interface KPIStat {
  count: number;
  weekly_change: number;
}

export interface DashboardKPIs {
  total_organisations: KPIStat;
  active: KPIStat;
  onboarding: KPIStat;
  inactive_suspended: KPIStat;
}

export interface SchoolTypeData {
  school_type: string;
  count: number;
}

export interface ComplianceTrendData {
  week: string;
  score: number;
}

export interface ComplianceDistData {
  range: string;
  count: number;
}

export interface FrameworkStatus {
  title: string;
  version: string;
  status: string;
  org_count: number;
}

export interface DashboardResponse {
  kpis: DashboardKPIs;
  orgs_by_school_type: SchoolTypeData[];
  compliance_trend: ComplianceTrendData[];
  compliance_distribution: ComplianceDistData[];
  framework_status: FrameworkStatus[];
}

// ── Admin Dashboard Stats ──────────────────────────────────────────────────────

export interface ReadinessScore {
  score?: number;
  change?: string;
  label?: string;
  last_month?: number;
}

export interface ComplianceVelocity {
  days?: number;
  label?: string;
}

export interface OrganisationCounts {
  total?: number;
  active?: number;
  inactive?: number;
  weekly_change?: number;
}

export interface PendingActions {
  count?: number;
  label?: string;
}

export interface AdminStats {
  readiness_score?: ReadinessScore;
  compliance_velocity?: ComplianceVelocity;
  total_organisations?: OrganisationCounts;
  pending_actions?: PendingActions;
}

export interface FrameworkComplianceItem {
  name?: string;
  completed?: number;
}

export interface LibraryStatusItem {
  name?: string;
  progress?: number;
  next_date?: string;
  color?: string;
}

export interface RecentIncident {
  name?: string;
  id?: string;
  framework?: string;
  type?: string;
  status?: string;
  date?: string;
}

export interface PaginatedIncidents {
  items?: RecentIncident[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
}
