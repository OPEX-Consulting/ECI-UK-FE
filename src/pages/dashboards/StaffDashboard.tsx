import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { schoolDashboardService } from '@/services/school/dashboardService';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  MoreVertical,
  Gauge,
  MessageSquare,
  Upload,
  Flag,
  ArrowUpDown,
  ChevronRight,
  Filter,
  Calendar,
  Folder,
  Loader2,
} from 'lucide-react';



// ─── Sub-components ──────────────────────────────────────────────────────────

const CircularProgress = ({ percentage, trend }: { percentage: number; trend?: string }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="130" height="130" viewBox="0 0 130 130" className="shrink-0">
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
          className="opacity-40"
        />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="#166534" // dark green
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 65 65)"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{percentage}%</span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const statusStyle = (status: string) => {
  const s = status.toUpperCase();
  if (s === "OVERDUE" || s === "CRITICAL")
    return "text-red-600 bg-red-500/10 border-red-200/50";
  if (s === "DUE TODAY" || s === "HIGH" || s === "DUE_SOON")
    return "text-amber-600 bg-amber-500/10 border-amber-200/50";
  return "text-emerald-600 bg-emerald-500/10 border-emerald-200/50";
};

const borderStyle = (status: string) => {
  const s = status.toUpperCase();
  if (s === "OVERDUE" || s === "CRITICAL")
    return "border-red-500/20 hover:border-red-500/35";
  if (s === "DUE TODAY" || s === "HIGH" || s === "DUE_SOON")
    return "border-amber-500/20 hover:border-amber-500/35";
  return "border-emerald-500/20 hover:border-emerald-500/35";
};

const formatTimestamp = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = Math.floor(diffMs / 3600000);
  if (diffHrs < 1) return "JUST NOW";
  if (diffHrs < 24) return `${diffHrs} HOURS AGO`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "YESTERDAY";
  return `${diffDays} DAYS AGO`;
};

const displayFramework = (fw: string | null) => {
  if (!fw) return null;
  const lowered = fw.toLowerCase();
  if (lowered === "unknown" || lowered === "uncategorised" || lowered === "uncategorized") return null;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(fw)) return null;
  return fw;
};

const formatDueDate = (iso: string | null) => {
  if (!iso) return "No date";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const activityIcon = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes("approv") || a.includes("accept")) return "approved";
  if (a.includes("comment") || a.includes("message")) return "comment";
  if (a.includes("submit") || a.includes("upload") || a.includes("file"))
    return "submitted";
  if (a.includes("adjust") || a.includes("deadline") || a.includes("change"))
    return "adjusted";
  return "comment";
};

export const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dashboard, isPending: dashPending } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: () => schoolDashboardService.getTeacherDashboard(),
  });
  const { data: activityResp, isPending: actPending } = useQuery({
    queryKey: ["teacher-activity"],
    queryFn: () => schoolDashboardService.getTeacherActivity(),
  });
  const { data: assignmentsResp, isPending: assignPending } = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: () => schoolDashboardService.getTeacherAssignments(),
  });
  const { data: fwContribution, isPending: fwPending } = useQuery({
    queryKey: ["teacher-fw-contribution"],
    queryFn: () => schoolDashboardService.getTeacherFrameworkContribution(),
  });

  const isLoading = dashPending || actPending || assignPending || fwPending;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const assignments = assignmentsResp?.items ?? [];
  const activityItems = activityResp?.items ?? [];
  const frameworks = fwContribution?.items ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif text-foreground">Compliance Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Welcome back, {user?.name}
            </p>
          </div>
          <Button onClick={() => navigate('/report')}>
            <Plus className="w-4 h-4 mr-2" />
            Report Incident
          </Button>
        </div>

        {/* Top Row Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Compliance Health */}
          <div className="bg-card p-5 border border-border rounded-[10px] flex flex-col items-center relative">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                My Compliance Health
              </span>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <div className="py-2">
              <CircularProgress
                percentage={Math.round(dashboard?.compliance_health.percentage ?? 0)}
                trend={`↑ ${(dashboard?.compliance_health.increase ?? 0).toFixed(1)}%`}
              />
            </div>
          </div>

          {/* Card 2: Completion Velocity */}
          <div className="bg-card p-5 border border-border rounded-[10px] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Gauge className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded text-xs font-semibold">
                Consistent
              </span>
            </div>
            <div className="mt-4">
              <p className="text-foreground text-4xl font-bold leading-none mb-1">
                {dashboard?.compliance_velocity_days.toFixed(1)} Days
              </p>
              <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest mb-3">
                Completion Velocity
              </p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (dashboard?.compliance_velocity_days ?? 0) * 20)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Items Due Soon */}
          <div className="bg-card p-5 border-2 border-red-500 rounded-[10px] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-red-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Critical Action
              </span>
            </div>
            <div className="mt-4">
              <p className="text-red-600 text-4xl font-bold leading-none mb-1">
                {dashboard?.due_tasks ?? 0} Tasks
              </p>
              <p className="font-semibold text-red-500/80 text-[10px] uppercase tracking-widest mb-3">
                Items Due Soon
              </p>
              <p className="text-muted-foreground text-xs italic">
                {dashboard?.total_incidents ?? 0} total incidents reported.
              </p>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Active Assignments & Framework Contributions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Assignments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Active Assignments</h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                  <button className="flex items-center gap-1 hover:text-foreground">
                    <Filter className="w-3.5 h-3.5" /> Filter
                  </button>
                  <button className="flex items-center gap-1 hover:text-foreground">
                    <ArrowUpDown className="w-3.5 h-3.5" /> Sort
                  </button>
                </div>
              </div>

              {assignments.length === 0 ? (
                <p className="text-muted-foreground text-sm py-6 text-center">No active assignments.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => navigate("/tasks")}
                      className={`p-4 border-2 ${borderStyle(a.priority)} rounded-[10px] bg-card flex items-center justify-between transition-all cursor-pointer`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <AlertTriangle className={`w-5 h-5 ${
                            a.priority === "OVERDUE" || a.priority === "CRITICAL"
                              ? "text-red-500"
                              : a.priority === "HIGH" || a.priority === "DUE_SOON"
                                ? "text-amber-500"
                                : "text-emerald-500"
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-sm">{a.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {formatDueDate(a.due_date)}
                            </span>
                            {displayFramework(a.framework) && (
                              <span className="flex items-center gap-1">
                                <Folder className="w-3 h-3" /> {displayFramework(a.framework)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${statusStyle(a.priority)}`}>
                          {a.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Framework Contributions */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Framework Contributions</h2>
              {frameworks.length === 0 ? (
                <p className="text-muted-foreground text-sm py-6 text-center">No framework contributions.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {frameworks.map((fw) => (
                    <div key={fw.framework_id} className="bg-card p-4 border border-border rounded-[10px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase bg-muted text-muted-foreground tracking-wider">
                          {fw.framework_name.slice(0, 6)}
                        </span>
                        <div>
                          <p className="text-foreground text-sm font-semibold">{fw.framework_name}</p>
                          <div className="w-[120px] h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${fw.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-muted-foreground">{Math.round(fw.percentage)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="bg-card p-5 border border-border rounded-[10px]">
            <h2 className="text-lg font-bold text-foreground mb-6">Recent Activity</h2>
            {activityItems.length === 0 ? (
              <p className="text-muted-foreground text-sm py-6 text-center">No recent activity.</p>
            ) : (
              <div className="relative pl-6 border-l border-border space-y-6 ml-3">
                {activityItems.map((act) => {
                  const iconType = activityIcon(act.action);
                  return (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[36px] top-0 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center">
                        {iconType === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {iconType === 'comment' && <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />}
                        {iconType === 'submitted' && <Upload className="w-3.5 h-3.5 text-muted-foreground" />}
                        {iconType === 'adjusted' && <Flag className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground leading-tight">
                          {act.entity_name}
                        </h4>
                        <p className="text-[9px] text-muted-foreground font-semibold tracking-wider mt-1 uppercase">
                          {formatTimestamp(act.timestamp)} &bull; {act.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
