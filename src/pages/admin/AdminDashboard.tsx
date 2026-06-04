import React from "react";
import {
  TrendingUp,
  Pencil,
  Building2,
  AlertCircle,
  Calendar,
  ChevronRight,
  Filter,
} from "lucide-react";

// ─── Mock Data (replace with API integration later) ───────────────────────────

const mockComplianceDistribution = [
  { name: "ISO 27001:2022", completed: 92 },
  { name: "GDPR - Privacy", completed: 78 },
  { name: "SOC 2 Type II", completed: 85 },
  { name: "NIST CSF", completed: 64 },
  { name: "HIPAA", completed: 100 },
];

const mockLibraryStatus = [
  {
    name: "Cybersecurity Act",
    progress: 80,
    nextDate: "Oct 12",
    color: "#16a34a",
  },
  {
    name: "Cloud Control Matrix",
    progress: 45,
    nextDate: "Sep 30",
    color: "#f97316",
  },
  {
    name: "PCI-DSS 4.0",
    progress: 95,
    nextDate: "Nov 05",
    color: "#0d9488",
  },
];

const mockIncidents = [
  {
    name: "Unauth Access Attempt - Region EU-1",
    id: "INC-8821",
    framework: "ISO 27001",
    type: "SECURITY",
    typeBg: "bg-emerald-500/10",
    typeText: "text-emerald-700",
    status: "RESOLVED",
    date: "Aug 24, 2023",
  },
  {
    name: "Data Retention Policy Violation",
    id: "INC-8742",
    framework: "GDPR",
    type: "PRIVACY",
    typeBg: "bg-emerald-500/10",
    typeText: "text-emerald-700",
    status: "RESOLVED",
    date: "Aug 20, 2023",
  },
  {
    name: "Third-Party Vendor Breach Alert",
    id: "INC-8690",
    framework: "SOC 2 Type II",
    type: "RISK",
    typeBg: "bg-emerald-500/10",
    typeText: "text-emerald-700",
    status: "RESOLVED",
    date: "Aug 15, 2023",
  },
];

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
                +2.4%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CircularProgress percentage={84} />
            <div>
              <p className="text-foreground text-xl font-bold">High</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Last month: 81.6%
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
                14 Days
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
            148
          </p>
          <p className="text-emerald-500 text-xs font-medium mb-3">
            +3 this week
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              Active:{" "}
              <span className="text-foreground font-medium">132</span>
            </span>
            <span>
              Inactive:{" "}
              <span className="text-foreground font-medium">16</span>
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
              style={{ width: "89%" }}
            />
            <div
              className="h-full bg-red-400 rounded-r-full transition-all duration-500"
              style={{ width: "11%" }}
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
            15
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Overdue tasks requiring immediate attention.
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
            {mockComplianceDistribution.map((item) => (
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
            {mockLibraryStatus.map((lib) => (
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
                      backgroundColor: lib.color,
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">Next: {lib.nextDate}</span>
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
              {mockIncidents.map((incident) => (
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
                    <span
                      className={`text-xs px-2.5 py-1 rounded font-semibold ${incident.typeBg} ${incident.typeText}`}
                    >
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
      </div>
    </div>
  );
};

export default AdminDashboard;
