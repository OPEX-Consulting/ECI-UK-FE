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
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAdminStats,
  getFrameworkCompliance,
  getLibraryStatus,
  getRecentIncidents,
  remindPendingActions,
} from "@/services/dashboardService";
import { toast } from "sonner";
// ─── Constants ─────────────────────────────────────────────────────────────────

const LIBRARY_COLORS = ["#16a34a", "#f97316", "#0d9488", "#6366f1", "#dc2626"];

const formatDate = (iso: string | null) => {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

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
  const INCIDENTS_PER_PAGE = 10;

  const { data: stats, isPending: statsPending, isError: statsError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  const { data: complianceResp } = useQuery({
    queryKey: ["admin-framework-compliance"],
    queryFn: getFrameworkCompliance,
  });

  const { data: libraryResp } = useQuery({
    queryKey: ["admin-library-status"],
    queryFn: getLibraryStatus,
  });

  const { data: incidentsResp } = useQuery({
    queryKey: ["admin-recent-incidents"],
    queryFn: () => getRecentIncidents(100),
  });

  const remindMutation = useMutation({
    mutationFn: remindPendingActions,
    onSuccess: (data) => {
      toast.success(`Reminders sent to ${data.total_sent} organisation${data.total_sent !== 1 ? "s" : ""}`);
      if (data.total_failed > 0) {
        toast.error(`${data.total_failed} reminder${data.total_failed !== 1 ? "s" : ""} failed to send`);
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err?.message || "Failed to send reminders";
      toast.error(msg);
    },
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

  if (statsError || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center p-7">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm">Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  const complianceList = complianceResp?.items ?? [];
  const libraryItems = (libraryResp?.items ?? []).map((item, idx) => ({
    ...item,
    _progress:
      item.total_organisations > 0
        ? Math.round((item.organisations_completed / item.total_organisations) * 100)
        : 0,
    _color: LIBRARY_COLORS[idx % LIBRARY_COLORS.length],
  }));

  const allIncidents = incidentsResp?.items ?? [];
  const totalIncidents = incidentsResp?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalIncidents / INCIDENTS_PER_PAGE));
  const {
    compliance_readiness: cr,
    compliance_velocity: cv,
    total_organisations: to,
    pending_actions: pa,
  } = stats;

  const totalOrgs = to.total_active + to.total_inactive;
  const activePct = totalOrgs > 0 ? (to.total_active / totalOrgs) * 100 : 0;
  const inactivePct = totalOrgs > 0 ? (to.total_inactive / totalOrgs) * 100 : 0;

  const readinessLabel =
    cr.overall_percentage >= 80 ? "High" : cr.overall_percentage >= 50 ? "Medium" : "Low";

  const incidents = allIncidents.slice(
    (incidentPage - 1) * INCIDENTS_PER_PAGE,
    incidentPage * INCIDENTS_PER_PAGE,
  );

  const pageNumbers: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - incidentPage) <= 1) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
      pageNumbers.push("...");
    }
  }

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
                +{cr.percentage_increase.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CircularProgress percentage={cr.overall_percentage} />
            <div>
              <p className="text-foreground text-xl font-bold">{readinessLabel}</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Last month: {cr.last_month_percentage.toFixed(1)}%
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
                {Math.round(cv.average_days)} Days
              </p>
              <p className="text-muted-foreground text-xs mt-1.5">
                Avg. Time to Close
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
            {totalOrgs}
          </p>
          <p className="text-emerald-500 text-xs font-medium mb-3">
            {cr.organisations_with_tasks} with active tasks
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              Active:{" "}
              <span className="text-foreground font-medium">{to.total_active}</span>
            </span>
            <span>
              Inactive:{" "}
              <span className="text-foreground font-medium">{to.total_inactive}</span>
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
              style={{ width: `${activePct}%` }}
            />
            <div
              className="h-full bg-red-400 rounded-r-full transition-all duration-500"
              style={{ width: `${inactivePct}%` }}
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
            {pa.total}
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Overdue tasks requiring immediate attention.
          </p>
          <button
            onClick={() => remindMutation.mutate()}
            disabled={remindMutation.isPending}
            className="flex items-center gap-1 mt-3 text-red-500 text-sm font-semibold hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {remindMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Resolve Now
                <ChevronRight className="w-4 h-4" />
              </>
            )}
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
            {complianceList.map((item) => (
              <div key={item.framework_id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-sm font-medium">
                    {item.framework_title}
                  </span>
                  <span className="text-foreground text-sm font-semibold">
                    {Math.round(item.completed_tasks)}%
                  </span>
                </div>
                <div className="h-3.5 bg-muted rounded overflow-hidden flex">
                  <div
                    className="h-full bg-[#1a5e3a] transition-all duration-700"
                    style={{ width: `${item.completed_tasks}%` }}
                  />
                  {item.completed_tasks < 100 && (
                    <div
                      className="h-full bg-[#d1e7dd] transition-all duration-700"
                      style={{ width: `${item.incomplete_tasks}%` }}
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
            {libraryItems.map((lib) => (
              <div
                key={lib.framework_id}
                className="p-3.5 bg-muted/40 border border-border rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-foreground text-sm font-semibold">
                    {lib.framework_title}
                  </p>
                  <span className="text-foreground text-sm font-semibold">
                    {lib._progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${lib._progress}%`,
                      backgroundColor: lib._color,
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">Next: {formatDate(lib.next_due_date)}</span>
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
              {incidents.map((incident, idx) => (
                <tr
                  key={incident.incident_name + idx}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <p className="text-foreground text-sm font-medium">
                      {incident.incident_name}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">
                    {incident.framework ?? "\u2014"}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs px-2.5 py-1 rounded font-semibold bg-emerald-500/10 text-emerald-700">
                      {incident.incident_type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {incident.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">
                    {formatDate(incident.finalized_date)}
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
              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="text-muted-foreground px-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setIncidentPage(p)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                      p === incidentPage
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
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
