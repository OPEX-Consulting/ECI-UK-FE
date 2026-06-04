import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockAssignments = [
  {
    id: "task-1",
    title: "Upload Pentest Report",
    status: "OVERDUE",
    statusColor: "text-red-600 bg-red-500/10 border-red-200/50",
    borderColor: "border-red-500/20 hover:border-red-500/35",
    date: "Oct 12, 2023",
    category: "Security Operations",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: "task-2",
    title: "Review IAM Policy",
    status: "DUE TODAY",
    statusColor: "text-amber-600 bg-amber-500/10 border-amber-200/50",
    borderColor: "border-amber-500/20 hover:border-amber-500/35",
    date: "Oct 25, 2023",
    category: "Governance",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: "task-3",
    title: "Update Asset Registry",
    status: "ON TRACK",
    statusColor: "text-emerald-600 bg-emerald-500/10 border-emerald-200/50",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/35",
    date: "Oct 28, 2023",
    category: "Asset Management",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
];

const mockFrameworks = [
  { name: "ISO 27001", progress: 82, badge: "ISO" },
  { name: "GDPR", progress: 65, badge: "EU" },
];

const mockActivity = [
  {
    id: "act-1",
    type: "approved",
    title: 'Evidence Approved for "Network Access Log Review"',
    time: "2 HOURS AGO",
    author: "BY AUDIT TEAM",
    quote: "Documentation looks solid, Marcus. Covers all requirements for Q3.",
  },
  {
    id: "act-2",
    type: "comment",
    title: 'New Comment on "Encryption Standard Update"',
    time: "YESTERDAY",
    author: "SARAH JENKINS",
  },
  {
    id: "act-3",
    type: "submitted",
    title: 'File Submitted: "Firewall_Config_v2.pdf"',
    time: "2 DAYS AGO",
  },
  {
    id: "act-4",
    type: "adjusted",
    title: "Deadline Adjusted for High Priority Task",
    time: "3 DAYS AGO",
  },
];

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

export const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
              <CircularProgress percentage={94} trend="↑ 1.2%" />
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
                2.8 Days
              </p>
              <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-widest mb-3">
                Completion Velocity
              </p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: "80%" }}
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
                3 Tasks
              </p>
              <p className="font-semibold text-red-500/80 text-[10px] uppercase tracking-widest mb-3">
                Items Due Soon
              </p>
              <p className="text-muted-foreground text-xs italic">
                Required for quarterly audit compliance.
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

              <div className="space-y-3">
                {mockAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`p-4 border-2 ${assignment.borderColor} rounded-[10px] bg-card flex items-center justify-between transition-all`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${assignment.iconBg} flex items-center justify-center`}>
                        <AlertTriangle className={`w-5 h-5 ${assignment.status === 'OVERDUE' ? 'text-red-500' : assignment.status === 'DUE TODAY' ? 'text-amber-500' : 'text-emerald-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm">{assignment.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {assignment.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Folder className="w-3 h-3" /> {assignment.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${assignment.statusColor}`}>
                        {assignment.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Framework Contributions */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Framework Contributions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockFrameworks.map((fw) => (
                  <div key={fw.name} className="bg-card p-4 border border-border rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase bg-muted text-muted-foreground tracking-wider">
                        {fw.badge}
                      </span>
                      <div>
                        <p className="text-foreground text-sm font-semibold">{fw.name}</p>
                        <div className="w-[120px] h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${fw.progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">{fw.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="bg-card p-5 border border-border rounded-[10px]">
            <h2 className="text-lg font-bold text-foreground mb-6">Recent Activity</h2>
            <div className="relative pl-6 border-l border-border space-y-6 ml-3">
              {mockActivity.map((activity) => (
                <div key={activity.id} className="relative">
                  {/* Node Icon */}
                  <div className="absolute -left-[36px] top-0 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center">
                    {activity.type === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {activity.type === 'comment' && <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />}
                    {activity.type === 'submitted' && <Upload className="w-3.5 h-3.5 text-muted-foreground" />}
                    {activity.type === 'adjusted' && <Flag className="w-3.5 h-3.5 text-red-500" />}
                  </div>

                  {/* Content */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground leading-tight">
                      {activity.title}
                    </h4>
                    <p className="text-[9px] text-muted-foreground font-semibold tracking-wider mt-1 uppercase">
                      {activity.time} {activity.author ? `• ${activity.author}` : ''}
                    </p>
                    {activity.quote && (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mt-2 text-xs italic text-slate-600 font-medium">
                        "{activity.quote}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
