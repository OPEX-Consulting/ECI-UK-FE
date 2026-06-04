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

export interface ComplianceReadiness {
  overall_percentage: number;
  last_month_percentage: number;
  percentage_increase: number;
  total_organisations: number;
  organisations_with_tasks: number;
}

export interface ComplianceVelocity {
  average_days: number;
  total_completed_tasks: number;
}

export interface OrganisationCount {
  total_active: number;
  total_inactive: number;
}

export interface PerOrganisationPending {
  organisation_id: string;
  organisation_name: string;
  pending_count: number;
}

export interface PendingActions {
  total: number;
  per_organisation: PerOrganisationPending[];
}

export interface AdminStats {
  compliance_readiness: ComplianceReadiness;
  compliance_velocity: ComplianceVelocity;
  total_organisations: OrganisationCount;
  pending_actions: PendingActions;
}

export interface FrameworkComplianceItem {
  framework_id: string;
  framework_title: string;
  total_organisations: number;
  total_tasks: number;
  completed_tasks: number;
  incomplete_tasks: number;
}

export interface FrameworkComplianceResponse {
  items: FrameworkComplianceItem[];
  total: number;
}

export interface OrganisationStatus {
  organisation_id: string;
  organisation_name: string;
  completed: boolean;
}

export interface LibraryStatusItem {
  framework_id: string;
  framework_title: string;
  slug: string;
  total_organisations: number;
  organisation_statuses: OrganisationStatus[];
  organisations_completed: number;
  next_due_date: string | null;
}

export interface LibraryStatusResponse {
  items: LibraryStatusItem[];
  total: number;
}

export interface RecentIncident {
  incident_name: string;
  framework: string | null;
  incident_type: string;
  status: string;
  finalized_date: string;
}

export interface RecentIncidentsResponse {
  total: number;
  items: RecentIncident[];
}
