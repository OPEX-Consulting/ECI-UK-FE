import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Download,
} from "lucide-react";

// ─── Mock Data (replace with API integration later) ───────────────────────────

const mockDistributionCategories = [
  {
    name: "Safeguarding",
    percentage: 98,
    bars: [65, 80, 55, 90, 70],
  },
  {
    name: "Health & Safety",
    percentage: 84,
    bars: [50, 60, 45, 75, 55],
  },
  {
    name: "GDPR / Privacy",
    percentage: 91,
    bars: [60, 55, 85, 70, 50],
  },
  {
    name: "Finance Controls",
    percentage: 72,
    bars: [45, 50, 40, 60, 55],
  },
];

const mockFrameworkHealth = [
  {
    name: "KCSIE 2025",
    subtitle: "STATUTORY GUIDANCE",
    score: 88,
    change: "+1.2%",
    bars: [50, 70, 55, 80, 65, 90, 75],
  },
  {
    name: "ISO 27001",
    subtitle: "INFORMATION SECURITY",
    score: 64,
    change: "STABLE",
    bars: [40, 55, 45, 60, 50, 55, 45],
  },
];

const mockPendingActions = [
  {
    label: "Critical Overdue",
    description: "Staff Safeguarding Audit",
    variant: "critical" as const,
  },
  {
    label: "Due in 24h",
    description: "Financial Risk Assessment",
    variant: "warning" as const,
  },
];

const mockIncidents = [
  {
    name: "Unauthorised Visitor Access",
    category: "Site Security",
    status: "Under Review",
    statusColor: "amber",
    priority: "HIGH",
    priorityBg: "bg-red-500",
    priorityText: "text-white",
    date: "Oct 24, 09:12",
  },
  {
    name: "Data Breach (Accidental Email)",
    category: "GDPR",
    status: "Resolved",
    statusColor: "emerald",
    priority: "MEDIUM",
    priorityBg: "bg-amber-500",
    priorityText: "text-white",
    date: "Oct 22, 14:45",
  },
  {
    name: "Missing Fire Drill Record",
    category: "H&S Compliance",
    status: "Under Review",
    statusColor: "amber",
    priority: "LOW",
    priorityBg: "bg-gray-200",
    priorityText: "text-gray-700",
    date: "Oct 21, 10:30",
  },
];

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
              <CircularProgress percentage={92} />
            </div>
            <p className="text-center text-muted-foreground text-xs leading-relaxed">
              Institutional compliance is trending positively across all
              monitored frameworks.
            </p>
          </div>

          {/* Operational Compliance Velocity */}
          <div className="bg-card p-6 border border-border rounded-[10px] transition-colors duration-300">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest mb-4">
              Operational Compliance Velocity
            </p>
            <p className="text-foreground text-4xl font-bold leading-none mb-1">
              4.2{" "}
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
                <p className="text-foreground text-lg font-bold mt-0.5">5.0d</p>
              </div>
              <div className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2.5">
                <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                  Previous
                </p>
                <p className="text-foreground text-lg font-bold mt-0.5">4.8d</p>
              </div>
            </div>
          </div>

          {/* Pending Institutional Actions */}
          <div className="bg-card p-6 border border-border rounded-[10px] transition-colors duration-300">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest mb-4">
              Pending Institutional Actions
            </p>
            <div className="space-y-3 mb-4">
              {mockPendingActions.map((action, i) => (
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
                  </div>
                  {action.variant === "critical" ? (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              View All 12 Actions
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
            {mockDistributionCategories.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-foreground text-sm font-medium">
                    {cat.name}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {cat.percentage}%
                  </span>
                </div>
                <MiniBarChart
                  bars={cat.bars}
                  highlightIndex={cat.bars.indexOf(Math.max(...cat.bars))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row: Framework Health + Recent Incidents */}
        <div className="grid grid-cols-[340px_1fr] gap-4">
          {/* Framework Health */}
          <div className="space-y-4">
            <p className="font-semibold text-foreground text-lg">
              Framework Health
            </p>
            {mockFrameworkHealth.map((fw) => (
              <div
                key={fw.name}
                className="bg-card p-5 border border-border rounded-[10px] transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-foreground text-base font-bold">
                      {fw.name}
                    </p>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-0.5">
                      {fw.subtitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-xl font-bold">
                      {fw.score}%
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        fw.change.startsWith("+")
                          ? "text-emerald-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {fw.change}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <MiniBarChart
                    bars={fw.bars}
                    highlightIndex={fw.bars.indexOf(Math.max(...fw.bars))}
                  />
                </div>
              </div>
            ))}
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
                  {mockIncidents.map((incident, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <p className="text-foreground text-sm font-medium">
                          {incident.name}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">
                        {incident.category}
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              incident.statusColor === "emerald"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span
                            className={
                              incident.statusColor === "emerald"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }
                          >
                            {incident.status}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${incident.priorityBg} ${incident.priorityText}`}
                        >
                          {incident.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm whitespace-nowrap">
                        {incident.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
