import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { schoolDashboardService } from "@/services/school/dashboardService";
import {
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Download,
  Loader2,
  AlertTriangle,
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
        y="70"
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

const MiniBarChart = ({
  bars,
  highlightIndex,
}: {
  bars: number[];
  highlightIndex?: number;
}) => (
  <div className="flex items-end gap-1.5 h-[50px]">
    {bars.map((h, i) => (
      <div
        key={i}
        className={`w-5 rounded-sm transition-all duration-300 ${
          i === (highlightIndex ?? -1)
            ? "bg-[#1a5e3a]"
            : "bg-muted-foreground/15"
        }`}
        style={{ height: `${h * 0.5}px` }}
      />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const PrincipalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [distributionView, setDistributionView] = useState<
    "department" | "framework"
  >("framework");

  const {
    data: principalDash,
    isPending: pdPending,
    isError: pdError,
  } = useQuery({
    queryKey: ["school-principal-dashboard"],
    queryFn: () => schoolDashboardService.getPrincipalDashboard(),
  });

  const {
    data: velocity,
    isPending: velPending,
    isError: velError,
  } = useQuery({
    queryKey: ["school-compliance-velocity"],
    queryFn: () => schoolDashboardService.getComplianceVelocity(),
  });
  const {
    data: pendingActions,
    isPending: paPending,
    isError: paError,
  } = useQuery({
    queryKey: ["school-pending-actions"],
    queryFn: () => schoolDashboardService.getPendingActions(),
  });
  const {
    data: distribution,
    isPending: distPending,
    isError: distError,
  } = useQuery({
    queryKey: ["school-distribution"],
    queryFn: () => schoolDashboardService.getDistribution(),
  });
  const {
    data: frameworkHealth,
    isPending: fhPending,
    isError: fhError,
  } = useQuery({
    queryKey: ["school-framework-health"],
    queryFn: () => schoolDashboardService.getFrameworkHealth(),
  });
  const {
    data: incidentsResp,
    isPending: incPending,
    isError: incError,
  } = useQuery({
    queryKey: ["school-recent-incidents"],
    queryFn: () => schoolDashboardService.getRecentIncidents(),
  });

  const isLoading = pdPending || velPending || paPending || distPending || fhPending || incPending;
  const hasError = pdError || velError || paError || distError || fhError || incError;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (hasError) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center text-destructive flex-col gap-2">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm">Failed to load dashboard data.</p>
        </div>
      </AppLayout>
    );
  }

  const displayFramework = (fw: string | null) => {
    if (!fw) return null;
    const lowered = fw.toLowerCase();
    if (lowered === "unknown" || lowered === "uncategorised" || lowered === "uncategorized") return null;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(fw)) return null;
    return fw;
  };

  const allPending: { label: string; description: string; framework: string | null; variant: "critical" | "warning" }[] = [
    ...(pendingActions?.critical_overdue ?? []).map((a) => ({
      label: "Critical Overdue",
      description: a.title,
      framework: displayFramework(a.framework),
      variant: "critical" as const,
    })),
    ...(pendingActions?.due_in_24h ?? []).map((a) => ({
      label: "Due in 24h",
      description: a.title,
      framework: displayFramework(a.framework),
      variant: "warning" as const,
    })),
  ];

  const catDist = distribution?.by_category ?? [];
  const fwDist = distribution?.by_framework ?? [];

  const fwHealthItems = frameworkHealth?.items ?? [];
  const incidents = incidentsResp?.items ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif text-foreground">
              Compliance Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back, {user?.name}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/compliance")}>
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* Regulatory Readiness Score */}
          <div className="bg-card p-6 border border-border rounded-[10px] transition-colors duration-300">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest mb-4">
              Regulatory Readiness Score
            </p>
            <div className="flex justify-center mb-3">
              <CircularProgress percentage={Math.round(principalDash?.incident_readiness.percentage ?? 0)} />
            </div>
            <p className="text-center text-muted-foreground text-xs leading-relaxed">
              {principalDash?.total_incidents.label ?? "Institutional compliance overview"}
            </p>
          </div>

          {/* Operational Compliance Velocity */}
          <div className="bg-card p-6 border border-border rounded-[10px] transition-colors duration-300">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest mb-4">
              Operational Compliance Velocity
            </p>
            <p className="text-foreground text-4xl font-bold leading-none mb-1">
              {velocity ? `${velocity.current_mttr_days.toFixed(1)}` : "\u2014"}{" "}
              <span className="text-lg font-normal text-muted-foreground">
                days
              </span>
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed mt-2 mb-5">
              Average time to remediation (MTTR) for high-priority internal
              audit findings.
            </p>
            <div className="flex gap-3">
              <div className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2.5">
                <p className="text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">
                  Target
                </p>
                <p className="text-foreground text-lg font-bold mt-0.5">{velocity ? `${velocity.target_days.toFixed(1)}d` : "\u2014"}</p>
              </div>
              <div className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2.5">
                <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                  Previous
                </p>
                <p className="text-foreground text-lg font-bold mt-0.5">{velocity ? `${velocity.previous_mttr_days.toFixed(1)}d` : "\u2014"}</p>
              </div>
            </div>
          </div>

          {/* Pending Institutional Actions */}
          <div className="bg-card p-6 border border-border rounded-[10px] transition-colors duration-300">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest mb-4">
              Pending Institutional Actions
            </p>
            {allPending.length === 0 ? (
              <p className="text-muted-foreground text-sm py-6 text-center">No pending actions.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {allPending.slice(0, 5).map((action, i) => (
                  <div
                    key={i}
                    className={`flex items-start justify-between p-3 rounded-lg border-l-4 ${
                      action.variant === "critical"
                        ? "bg-red-50 dark:bg-red-500/5 border-red-500"
                        : "bg-amber-50 dark:bg-amber-500/5 border-amber-400"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          action.variant === "critical"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {action.label}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {action.description}
                      </p>
                      {action.framework && (
                        <p className="text-muted-foreground/60 text-[10px] mt-0.5 uppercase tracking-wider">
                          {action.framework}
                        </p>
                      )}
                    </div>
                    {action.variant === "critical" ? (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate("/tasks")}
              className="w-full py-2.5 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              View All {pendingActions
                ? pendingActions.critical_overdue.length + pendingActions.due_in_24h.length
                : 0} Actions
            </button>
          </div>
        </div>

        {/* Institutional Distribution */}
        <div className="bg-card p-[22px] border border-border rounded-[10px] transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <p className="font-semibold text-foreground text-lg">
              Institutional Distribution
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDistributionView("department")}
                className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${
                  distributionView === "department"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:bg-muted/50"
                }`}
              >
                By Department
              </button>
              <button
                onClick={() => setDistributionView("framework")}
                className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${
                  distributionView === "framework"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:bg-muted/50"
                }`}
              >
                By Framework
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {(distributionView === "department" ? catDist : fwDist).map((item) => {
              const pct = "percentage" in item ? item.percentage : item.percentage;
              const rawLabel = "category" in item ? item.category : item.framework_name;
              const label = displayFramework(rawLabel) ?? "Framework";
              const bars = [pct * 0.6, pct * 0.8, pct * 0.55, pct * 0.9, pct * 0.7].map(
                (v) => Math.round(v),
              );
              const itemKey = "framework_id" in item ? item.framework_id : item.category;
              return (
                <div key={itemKey}>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-foreground text-sm font-medium">
                      {label}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {pct}%
                    </span>
                  </div>
                  <MiniBarChart
                    bars={bars}
                    highlightIndex={bars.indexOf(Math.max(...bars))}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: Framework Health + Recent Incidents */}
        <div className="grid grid-cols-[340px_1fr] gap-4">
          {/* Framework Health */}
          <div className="space-y-4">
            <p className="font-semibold text-foreground text-lg">
              Framework Health
            </p>
            {fwHealthItems.map((fw) => {
              const bars = [50, 70, 55, 80, 65, 90, 75].map((b) =>
                Math.round(b * (fw.percentage / 100)),
              );
              const trendStr =
                fw.trend > 0 ? `+${fw.trend.toFixed(1)}%` : fw.trend < 0 ? `${fw.trend.toFixed(1)}%` : "STABLE";
              return (
                <div
                  key={fw.framework_id}
                  className="bg-card p-5 border border-border rounded-[10px] transition-colors duration-300"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-foreground text-base font-bold">
                        {displayFramework(fw.framework_name) ?? "Framework"}
                      </p>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-0.5">
                        Framework Health
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground text-xl font-bold">
                        {fw.percentage}%
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          fw.trend > 0
                            ? "text-emerald-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {trendStr}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <MiniBarChart
                      bars={bars}
                      highlightIndex={bars.indexOf(Math.max(...bars))}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Operational Incidents */}
          <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
            <div className="flex items-center justify-between p-[22px] pb-0 mb-2">
              <p className="font-semibold text-foreground text-lg">
                Recent Operational Incidents
              </p>
              <button
                onClick={() => navigate("/incidents")}
                className="flex items-center gap-1.5 text-primary text-sm font-medium hover:underline"
              >
                Full Log
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Incident Name
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No incidents found.
                      </td>
                    </tr>
                  )}
                  {incidents.map((incident) => {
                    const isResolved =
                      incident.status.toLowerCase().includes("resolved") ||
                      incident.status.toLowerCase().includes("closed");
                    return (
                      <tr
                        key={incident.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-6">
                          <p className="text-foreground text-sm font-medium">
                            {incident.incident_name}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">
                          {incident.category}
                        </td>
                        <td className="py-4 px-4">
                          <span className="flex items-center gap-1.5 text-xs font-medium">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isResolved ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            <span
                              className={
                                isResolved ? "text-emerald-600" : "text-amber-600"
                              }
                            >
                              {incident.status}
                            </span>
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                              incident.priority === "HIGH" || incident.priority === "CRITICAL"
                                ? "bg-red-500 text-white"
                                : incident.priority === "MEDIUM"
                                  ? "bg-amber-500 text-white"
                                  : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {incident.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm whitespace-nowrap">
                          {incident.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
