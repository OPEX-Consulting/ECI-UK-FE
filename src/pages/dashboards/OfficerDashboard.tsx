import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { schoolDashboardService } from "@/services/school/dashboardService";
import {
  TrendingDown,
  ShieldCheck,
  UserCheck,
  Info,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";

// ─── Sub-components ───────────────────────────────────────────────────────────

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="150" height="150" viewBox="0 0 150 150" className="shrink-0">
      <circle
        cx="75"
        cy="75"
        r={radius}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="8"
      />
      <circle
        cx="75"
        cy="75"
        r={radius}
        fill="none"
        stroke="#1a5e3a"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 75 75)"
        className="transition-all duration-700"
      />
      <text
        x="75"
        y="68"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground font-bold"
        style={{ fontSize: "32px" }}
      >
        {percentage}%
      </text>
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DistItem = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-muted/40 border border-border rounded-lg px-3 py-3 text-center">
    <p className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold mb-1">{label}</p>
    <p className="text-foreground text-2xl font-bold">{value}</p>
  </div>
);

const displayFramework = (fw: string | null) => {
  if (!fw) return null;
  const lowered = fw.toLowerCase();
  if (lowered === "unknown" || lowered === "uncategorised" || lowered === "uncategorized") return null;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(fw)) return null;
  return fw;
};

const formatDeadline = (iso: string | null) => {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [urgentPage, setUrgentPage] = useState(0);
  const URGENT_PAGE_SIZE = 8;

  const { data: dashboard, isPending: dashPending } = useQuery({
    queryKey: ["officer-dashboard"],
    queryFn: () => schoolDashboardService.getOfficerDashboard(),
  });
  const { data: fwCompliance, isPending: fwPending } = useQuery({
    queryKey: ["officer-fw-compliance"],
    queryFn: () => schoolDashboardService.getOfficerFrameworkCompliance(),
  });
  const { data: urgentActions, isPending: urgentPending } = useQuery({
    queryKey: ["officer-urgent-actions"],
    queryFn: () => schoolDashboardService.getUrgentActions(),
  });

  const isLoading = dashPending || fwPending || urgentPending;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const taskDist = dashboard?.task_distribution;
  const frameworks = fwCompliance?.items ?? [];
  const urgentItems = urgentActions?.items ?? [];
  const paginatedUrgent = urgentItems.slice(urgentPage * URGENT_PAGE_SIZE, (urgentPage + 1) * URGENT_PAGE_SIZE);
  const urgentTotalPages = Math.max(1, Math.ceil(urgentItems.length / URGENT_PAGE_SIZE));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif text-foreground">
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.name}
          </p>
        </div>

        {/* Top Row */}
        <div className="grid grid-cols-[280px_1fr_280px] gap-4">
          {/* Readiness Score */}
          <div className="bg-card p-6 border border-border rounded-[10px] transition-colors duration-300 row-span-2">
            <div className="flex items-center justify-between mb-2">
              <Info className="w-4 h-4 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-[0.15em] mb-4 text-center">
              Readiness Score
            </p>
            <div className="flex justify-center mb-5">
              <CircularProgress percentage={Math.round(dashboard?.readiness_score.percentage ?? 0)} />
            </div>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-foreground text-2xl font-bold">{dashboard?.readiness_score.passed ?? 0}</p>
                <p className="text-muted-foreground text-xs uppercase tracking-wider">
                  Passed
                </p>
              </div>
              <div className="text-center">
                <p className="text-foreground text-2xl font-bold">{dashboard?.readiness_score.flagged ?? 0}</p>
                <p className="text-muted-foreground text-xs uppercase tracking-wider">
                  Flagged
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Velocity */}
          <div className="bg-card p-5 border border-border rounded-[10px] transition-colors duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest">
                    Compliance Velocity (MTTR)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-500">
                <TrendingDown className="w-3 h-3" />
                <span className="text-xs font-medium">{dashboard?.compliance_velocity.average_days.toFixed(1)}d</span>
              </div>
            </div>
            <p className="text-foreground text-4xl font-bold leading-none mt-3 mb-2">
              {dashboard?.compliance_velocity.average_days.toFixed(1) ?? 0} Days
            </p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (dashboard?.compliance_velocity.average_days ?? 0) * 15)}%` }}
              />
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-card p-5 border border-border rounded-[10px] transition-colors duration-300 border-l-4 border-l-amber-400 row-span-2">
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-amber-500 text-[10px] font-semibold uppercase tracking-wider">
                Action Needed
              </span>
            </div>
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest mt-3">
              Pending Approvals
            </p>
            <p className="text-foreground text-4xl font-bold leading-none mt-1 mb-2">
              {dashboard?.pending_items ?? 0} Items
            </p>
            <p className="text-muted-foreground text-sm italic">
              Requires review in next 24h
            </p>
          </div>

          {/* Task Distribution */}
          <div className="bg-card p-5 border border-border rounded-[10px] transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest">
                Task Distribution
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground font-medium">
                  ISO 27001
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground font-medium">
                  NIST CSF
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {taskDist && (
                <>
                  <DistItem label="TO-DO" value={taskDist.todo} />
                  <DistItem label="IN PROGRESS" value={taskDist.in_progress} />
                  <DistItem label="IN REVIEW" value={taskDist.in_review} />
                  <DistItem label="DONE" value={taskDist.done} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Framework Compliance */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <p className="font-semibold text-foreground text-base">
              Framework Compliance
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {frameworks.map((fw) => {
              const statusColor =
                fw.status === "Healthy" || fw.status === "On Track"
                  ? "text-emerald-500"
                  : fw.status === "Pending Evidence"
                    ? "text-amber-500"
                    : "text-muted-foreground";
              return (
                <div
                  key={fw.framework_id}
                  className="bg-card p-5 border border-border rounded-[10px] transition-colors duration-300"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span
                      className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider ${
                        fw.percentage >= 80
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-amber-500/10 text-amber-700"
                      }`}
                    >
                      {fw.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm font-semibold">
                        {fw.framework_name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {fw.category}
                      </p>
                    </div>
                    <span className={`text-xl font-bold ${
                      fw.percentage >= 80 ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {Math.round(fw.percentage)}%
                    </span>
                  </div>
                  <div className="flex items-end gap-1.5 h-[40px] mb-3">
                    {[50, 60, 55, 70, 65, fw.percentage].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm transition-all duration-300 ${
                          i === 5 ? "" : "bg-muted-foreground/15"
                        }`}
                        style={{
                          height: `${h * 0.4}px`,
                          backgroundColor: i === 5 ? "#1a5e3a" : undefined,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      {fw.active_controls}/{fw.total_controls} Active Controls
                    </span>
                    <span className={`text-xs font-medium ${statusColor}`}>
                      {fw.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Urgent Actions Required */}
        <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
          <div className="flex items-center justify-between p-[22px] pb-0 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <p className="font-semibold text-foreground text-base">
                Urgent Actions Required
              </p>
            </div>
            <button
              onClick={() => navigate("/review")}
              className="text-foreground text-sm font-semibold hover:underline underline-offset-2"
            >
              View All Tasks
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Control / Task
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Framework
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {                urgentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No urgent actions.
                  </td>
                </tr>
              ) : (
                paginatedUrgent.map((action) => {
                  const s = action.status.toUpperCase();
                  const dotColor = s === "TODO"
                    ? "bg-gray-400"
                    : s === "IN_PROGRESS"
                      ? "bg-blue-500"
                      : s === "REVIEW"
                        ? "bg-amber-500"
                        : s === "DONE"
                          ? "bg-emerald-500"
                          : s === "CRITICAL" || s === "IMMEDIATE"
                            ? "bg-red-500"
                            : s === "HIGH" || s === "HIGH PRIORITY"
                              ? "bg-amber-500"
                              : s === "IN REVIEW" || s === "PENDING"
                                ? "bg-gray-400"
                                : "bg-emerald-500";
                  const textColor = s === "TODO" || s === "PENDING"
                    ? "text-gray-500"
                    : s === "IN_PROGRESS"
                      ? "text-blue-500"
                      : s === "REVIEW"
                        ? "text-amber-500"
                        : s === "DONE"
                          ? "text-emerald-500"
                          : s === "CRITICAL" || s === "IMMEDIATE"
                            ? "text-red-500"
                            : s === "HIGH" || s === "HIGH PRIORITY"
                              ? "text-amber-500"
                              : s === "IN REVIEW"
                                ? "text-emerald-500"
                                : "text-muted-foreground";
                  return (
                    <tr
                      key={action.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground text-sm font-medium">
                            {action.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">
                        {displayFramework(action.framework) ?? "\u2014"}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-sm font-medium ${
                          action.issue === "Critical Overdue"
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}>
                          {action.issue}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">
                        {formatDeadline(action.deadline)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                          <span className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}>
                            {action.status}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between py-4 border-t border-border px-6">
            <span className="text-xs text-muted-foreground">
              {urgentItems.length} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUrgentPage(Math.max(0, urgentPage - 1))}
                disabled={urgentPage === 0}
                className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                {urgentPage + 1} / {urgentTotalPages}
              </span>
              <button
                onClick={() => setUrgentPage(Math.min(urgentTotalPages - 1, urgentPage + 1))}
                disabled={urgentPage >= urgentTotalPages - 1}
                className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
