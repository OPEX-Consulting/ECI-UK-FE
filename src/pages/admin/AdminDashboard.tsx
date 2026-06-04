import { useState } from "react";
import {
  TrendingUp,
  Pencil,
  Building2,
  AlertCircle,
  Calendar,
  ChevronRight,
  Filter,
  Loader2,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getAdminStats,
  getFrameworkCompliance,
  getLibraryStatus,
  getRecentIncidents,
} from "@/services/dashboardService";
import type {
  AdminStats,
} from "@/types/dashboard";

// ─── Sub-components ───────────────────────────────────────────────────────────

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="66" height="66" viewBox="0 0 66 66" className="shrink-0">
      <circle
        cx="33"
        cy="33"
        r={radius}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="5"
      />
      <circle
        cx="33"
        cy="33"
        r={radius}
        fill="none"
        stroke="#1a5e3a"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 33 33)"
        className="transition-all duration-700"
      />
      <text
        x="33"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground font-bold"
        style={{ fontSize: "14px" }}
      >
        {percentage}%
      </text>
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [incidentPage, setIncidentPage] = useState(1);
  const INCIDENT_LIMIT = 10;

  const { data: stats, isPending: statsPending, isError: statsError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  const { data: complianceData } = useQuery({
    queryKey: ["admin-framework-compliance"],
    queryFn: getFrameworkCompliance,
  });

  const { data: libraryData } = useQuery({
    queryKey: ["admin-library-status"],
    queryFn: getLibraryStatus,
  });

  const { data: incidentsData } = useQuery({
    queryKey: ["admin-recent-incidents", incidentPage],
    queryFn: () => getRecentIncidents(incidentPage, INCIDENT_LIMIT),
  });

  if (statsPending) {
    return (
      <div className="flex h-[50vh] items-center justify-center p-7">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex h-[50vh] items-center justify-center p-7">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm">Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  const incidents = incidentsData?.items ?? [];
  const totalPages = incidentsData?.pages ?? 1;

  return (
    <div className="space-y-6 p-7 transition-colors duration-300">
      {/* Page Header */}
      <div>
        <h1 className="font-semibold text-foreground text-xl font-serif">
          Dashboard
        </h1>
        <p className="mt-0.5 text-muted-foreground text-sm">
          Real-time overview of the ECI ecosystem
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Readiness Score */}
        <div className="bg-card p-5 border border-border rounded-[10px] transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest">
              Readiness Score
            </p>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 text-xs font-medium">
                {stats?.readiness_score?.change ?? "+0%"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CircularProgress percentage={stats?.readiness_score?.score ?? 0} />
            <div>
              <p className="text-foreground text-xl font-bold">{stats?.readiness_score?.label ?? "N/A"}</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Last month: {stats?.readiness_score?.last_month ?? 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Velocity */}
        <div className="bg-card p-5 border border-border rounded-[10px] transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest">
              Compliance Velocity
            </p>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground/40" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-foreground text-3xl font-bold leading-none">
                {stats?.compliance_velocity?.days ?? 0} Days
              </p>
              <p className="text-muted-foreground text-xs mt-1.5">
                {stats?.compliance_velocity?.label ?? "Avg. Time to Close"}
              </p>
            </div>
            <div className="flex items-end gap-1 pb-1">
              {[40, 55, 70, 85, 60].map((h, i) => (
                <div
                  key={i}
                  className={`w-2.5 rounded-sm ${i === 3 ? "bg-emerald-500" : "bg-muted-foreground/20"}`}
                  style={{ height: `${h * 0.4}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Total Organisation */}
        <div className="bg-card p-5 border border-border rounded-[10px] transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest">
              Total Organisation
            </p>
            <Building2 className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <p className="text-foreground text-4xl font-bold leading-none mb-1">
            {stats?.total_organisations?.total ?? 0}
          </p>
          <p className="text-emerald-500 text-xs font-medium mb-3">
            +{stats?.total_organisations?.weekly_change ?? 0} this week
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              Active:{" "}
              <span className="text-foreground font-medium">{stats?.total_organisations?.active ?? 0}</span>
            </span>
            <span>
              Inactive:{" "}
              <span className="text-foreground font-medium">{stats?.total_organisations?.inactive ?? 0}</span>
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
              style={{
                width: `${stats?.total_organisations?.total ? ((stats.total_organisations.active ?? 0) / stats.total_organisations.total) * 100 : 0}%`,
              }}
            />
            <div
              className="h-full bg-red-400 rounded-r-full transition-all duration-500"
              style={{
                width: `${stats?.total_organisations?.total ? ((stats.total_organisations.inactive ?? 0) / stats.total_organisations.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-card p-5 border-2 border-red-400/60 rounded-[10px] transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-red-500 text-[10px] uppercase tracking-widest">
              Pending Actions
            </p>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-red-500 text-4xl font-bold leading-none mb-2">
            {stats?.pending_actions?.count ?? 0}
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {stats?.pending_actions?.label ?? "Overdue tasks requiring immediate attention."}
          </p>
          <button className="flex items-center gap-1 mt-3 text-red-500 text-sm font-semibold hover:text-red-600 transition-colors">
            Resolve Now
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Row: Compliance Distribution + Library Status */}
      <div className="gap-4 grid grid-cols-[1fr_340px]">
        {/* Compliance Distribution */}
        <div className="bg-card p-[22px] border border-border rounded-[10px] transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <p className="font-semibold text-foreground text-sm">
              Compliance Distribution
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1a5e3a]" />
                <span className="text-muted-foreground text-xs">
                  Completed
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d1e7dd]" />
                <span className="text-muted-foreground text-xs">
                  In Progress
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            {(complianceData ?? []).map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-sm font-medium">
                    {item.name}
                  </span>
                  <span className="text-foreground text-sm font-semibold">
                    {item.completed}%
                  </span>
                </div>
                <div className="h-3.5 bg-muted rounded overflow-hidden flex">
                  <div
                    className="h-full bg-[#1a5e3a] transition-all duration-700"
                    style={{ width: `${item.completed}%` }}
                  />
                  {item.completed < 100 && (
                    <div
                      className="h-full bg-[#d1e7dd] transition-all duration-700"
                      style={{ width: `${100 - item.completed}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Library Status */}
        <div className="bg-card p-[22px] border border-border rounded-[10px] transition-colors duration-300">
          <div className="flex items-center justify-between mb-5">
            <p className="font-semibold text-foreground text-sm">
              Library Status
            </p>
            <button className="text-primary text-xs font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {(libraryData ?? []).map((lib) => (
              <div
                key={lib.name}
                className="p-3.5 bg-muted/40 border border-border rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-foreground text-sm font-semibold">
                    {lib.name}
                  </p>
                  <span className="text-foreground text-sm font-semibold">
                    {lib.progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${lib.progress}%`,
                    backgroundColor: lib.color ?? "#16a34a",
                  }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">Next: {lib.next_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Finalized Incidents */}
      <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
        <div className="flex items-center justify-between p-[22px] pb-0 mb-2">
          <p className="font-semibold text-foreground text-lg">
            Recent Finalized Incidents
          </p>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <Filter className="w-3.5 h-3.5" />
              All Frameworks
            </button>
            <button className="px-3 py-1.5 text-sm font-semibold text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors">
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Incident Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Framework
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Finalized Date
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
              {incidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <p className="text-foreground text-sm font-medium">
                      {incident.name}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      ID: {incident.id}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">
                    {incident.framework}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs px-2.5 py-1 rounded font-semibold bg-emerald-500/10 text-emerald-700">
                      {incident.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {incident.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">
                    {incident.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Page {incidentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIncidentPage((p) => Math.max(1, p - 1))}
                disabled={incidentPage <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - incidentPage) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {showEllipsis && <span className="text-muted-foreground px-1">...</span>}
                      <button
                        onClick={() => setIncidentPage(p)}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          p === incidentPage
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
              <button
                onClick={() => setIncidentPage((p) => Math.min(totalPages, p + 1))}
                disabled={incidentPage >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
