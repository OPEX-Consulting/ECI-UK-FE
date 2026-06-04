// ── Principal Dashboard ─────────────────────────────────────────────────────

export interface OperationalComplianceVelocity {
  current_mttr_days: number;
  target_days: number;
  previous_mttr_days: number;
}

export interface PendingActionItem {
  title: string;
  category: string;
  due_date: string | null;
  framework: string | null;
}

export interface PendingInstitutionalActionsResponse {
  critical_overdue: PendingActionItem[];
  due_in_24h: PendingActionItem[];
}

export interface CategoryDistribution {
  category: string;
  percentage: number;
  count: number;
}

export interface FrameworkDistributionItem {
  framework_id: string;
  framework_name: string;
  percentage: number;
  done: number;
  total: number;
}

export interface InstitutionalDistributionResponse {
  by_category: CategoryDistribution[];
  by_framework: FrameworkDistributionItem[];
}

export interface FrameworkHealthItem {
  framework_id: string;
  framework_name: string;
  percentage: number;
  trend: number;
}

export interface FrameworkHealthResponse {
  items: FrameworkHealthItem[];
}

export interface RecentOperationalIncident {
  id: string;
  incident_name: string;
  category: string;
  status: string;
  priority: string;
  date: string;
}

export interface RecentOperationalIncidentsResponse {
  items: RecentOperationalIncident[];
  total: number;
  page: number;
  limit: number;
}

// ── Teacher Dashboard ────────────────────────────────────────────────────────

export interface TeacherComplianceHealth {
  percentage: number;
  increase: number;
}

export interface TeacherDashboardStats {
  compliance_health: TeacherComplianceHealth;
  compliance_velocity_days: number;
  due_tasks: number;
  total_incidents: number;
}

export interface TeacherActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_name: string;
  timestamp: string;
}

export interface TeacherActivityResponse {
  items: TeacherActivityItem[];
}

export interface ActiveAssignment {
  id: string;
  title: string;
  framework: string | null;
  due_date: string | null;
  priority: string;
  status: string;
}

export interface ActiveAssignmentsResponse {
  items: ActiveAssignment[];
  total: number;
}

export interface FrameworkContributionItem {
  framework_id: string;
  framework_name: string;
  assigned: number;
  done: number;
  percentage: number;
}

export interface FrameworkContributionResponse {
  items: FrameworkContributionItem[];
}

// ── Officer Dashboard ────────────────────────────────────────────────────────

export interface ReadinessScore {
  percentage: number;
  passed: number;
  flagged: number;
}

export interface TaskDistribution {
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
}

export interface ComplianceVelocitySummary {
  average_days: number;
  total_completed: number;
}

export interface DashboardStatsResponse {
  readiness_score: ReadinessScore;
  compliance_velocity: ComplianceVelocitySummary;
  task_distribution: TaskDistribution;
  pending_items: number;
}

export interface FrameworkComplianceItem {
  framework_id: string;
  framework_name: string;
  category: string;
  percentage: number;
  active_controls: number;
  total_controls: number;
  status: string;
}

export interface FrameworkComplianceListResponse {
  items: FrameworkComplianceItem[];
}

export interface UrgentActionItem {
  id: string;
  title: string;
  framework: string | null;
  issue: string;
  deadline: string | null;
  status: string;
}

export interface UrgentActionsResponse {
  items: UrgentActionItem[];
}
