import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  TrendingDown,
  ShieldCheck,
  UserCheck,
  Info,
  AlertCircle,
  FileText,
  Link2,
  Fingerprint,
  ChevronDown,
} from "lucide-react";

// ─── Mock Data (replace with API integration later) ───────────────────────────

const mockTaskDistribution = [
  { label: "TO-DO", value: 24 },
  { label: "IN PROGRESS", value: 18 },
  { label: "IN REVIEW", value: "07" },
  { label: "DONE", value: 112 },
];

const mockFrameworks = [
  {
    badge: "ISO",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-700",
    name: "ISO 27001:2022",
    subtitle: "Information Security",
    score: 92,
    scoreColor: "text-emerald-600",
    bars: [50, 60, 55, 70, 65, 90],
    barColor: "#1a5e3a",
    controls: "14/15 Active Controls",
    status: "Healthy",
    statusColor: "text-emerald-500",
  },
  {
    badge: "GDPR",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-700",
    name: "EU GDPR",
    subtitle: "Data Privacy",
    score: 76,
    scoreColor: "text-amber-600",
    bars: [45, 55, 50, 60, 55, 85],
    barColor: "#f59e0b",
    controls: "22/31 Active Controls",
    status: "Pending Evidence",
    statusColor: "text-amber-500",
  },
  {
    badge: "NIST",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-700",
    name: "NIST CSF 2.0",
    subtitle: "Cybersecurity Framework",
    score: 84,
    scoreColor: "text-emerald-600",
    bars: [40, 50, 45, 60, 55, 80],
    barColor: "#1a5e3a",
    controls: "42/50 Active Controls",
    status: "On Track",
    statusColor: "text-emerald-500",
  },
];

const mockUrgentActions = [
  {
    icon: "file",
    task: "Annual Pentest Evidence Upload",
    framework: "ISO 27001 (A.12.6.1)",
    issue: "Critical Overdue",
    issueColor: "text-red-500",
    deadline: "Oct 24, 2023",
    status: "IMMEDIATE",
    statusDot: "bg-red-500",
    statusColor: "text-red-500",
  },
  {
    icon: "link",
    task: "IAM Access Review Verification",
    framework: "NIST CSF (PR.AC-1)",
    issue: "Evidence Pending",
    issueColor: "text-muted-foreground",
    deadline: "Tomorrow",
    status: "HIGH PRIORITY",
    statusDot: "bg-amber-500",
    statusColor: "text-amber-500",
  },
  {
    icon: "fingerprint",
    task: "Privacy Policy Revision Approval",
    framework: "GDPR (Art. 13)",
    issue: "Legal Signature Missing",
    issueColor: "text-muted-foreground",
    deadline: "Oct 29, 2023",
    status: "PENDING LEGAL",
    statusDot: "bg-gray-400",
    statusColor: "text-muted-foreground",
  },
  {
    icon: "file",
    task: "Asset Registry Audit Trace",
    framework: "ISO 27001 (A.8.1.1)",
    issue: "Anomaly Detected",
    issueColor: "text-muted-foreground",
    deadline: "Oct 30, 2023",
    status: "IN REVIEW",
    statusDot: "bg-emerald-500",
    statusColor: "text-emerald-500",
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

const ActionIcon = ({ icon }: { icon: string }) => {
  const cls = "w-4 h-4 text-muted-foreground";
  switch (icon) {
    case "link":
      return <Link2 className={cls} />;
    case "fingerprint":
      return <Fingerprint className={cls} />;
    default:
      return <FileText className={cls} />;
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
              <CircularProgress percentage={88} />
            </div>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-foreground text-2xl font-bold">142</p>
                <p className="text-muted-foreground text-xs uppercase tracking-wider">
                  Passed
                </p>
              </div>
              <div className="text-center">
                <p className="text-foreground text-2xl font-bold">12</p>
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
                <span className="text-xs font-medium">0.5d</span>
              </div>
            </div>
            <p className="text-foreground text-4xl font-bold leading-none mt-3 mb-2">
              4.2 Days
            </p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: "70%" }}
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
              07 Items
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
              {mockTaskDistribution.map((task) => (
                <div
                  key={task.label}
                  className="bg-muted/40 border border-border rounded-lg px-3 py-3 text-center"
                >
                  <p className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold mb-1">
                    {task.label}
                  </p>
                  <p className="text-foreground text-2xl font-bold">
                    {task.value}
                  </p>
                </div>
              ))}
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
            {mockFrameworks.map((fw) => (
              <div
                key={fw.name}
                className="bg-card p-5 border border-border rounded-[10px] transition-colors duration-300"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider ${fw.badgeBg} ${fw.badgeText}`}
                  >
                    {fw.badge}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-semibold">
                      {fw.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {fw.subtitle}
                    </p>
                  </div>
                  <span className={`text-xl font-bold ${fw.scoreColor}`}>
                    {fw.score}%
                  </span>
                </div>
                <div className="flex items-end gap-1.5 h-[40px] mb-3">
                  {fw.bars.map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm transition-all duration-300 ${
                        i === fw.bars.length - 1
                          ? ""
                          : "bg-muted-foreground/15"
                      }`}
                      style={{
                        height: `${h * 0.4}px`,
                        backgroundColor:
                          i === fw.bars.length - 1
                            ? fw.barColor
                            : undefined,
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    {fw.controls}
                  </span>
                  <span className={`text-xs font-medium ${fw.statusColor}`}>
                    {fw.status}
                  </span>
                </div>
              </div>
            ))}
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
                {mockUrgentActions.map((action, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <ActionIcon icon={action.icon} />
                        <span className="text-foreground text-sm font-medium">
                          {action.task}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">
                      {action.framework}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-sm font-medium ${action.issueColor}`}
                      >
                        {action.issue}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">
                      {action.deadline}
                    </td>
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${action.statusDot}`}
                        />
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${action.statusColor}`}
                        >
                          {action.status}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center py-4 border-t border-border">
            <button className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold uppercase tracking-wider hover:text-foreground transition-colors">
              Load More Actions
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
