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
