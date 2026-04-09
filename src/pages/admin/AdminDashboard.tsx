import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import { Building2, CheckCircle2, Clock, PauseCircle } from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const schoolTypeData = [
  { name: 'State-funded (Maintained)', value: 98 },
  { name: 'Academy (Single)', value: 83 },
  { name: 'Academy (MAT)', value: 44 },
  { name: 'Independent', value: 39 },
  { name: 'Free School', value: 32 },
  { name: 'Special School', value: 16 },
  { name: 'Faith School', value: 9 },
];

const schoolTypeColors = ['#34d399', '#60a5fa', '#f59e0b', '#a78bfa', '#f87171', '#2dd4bf', '#818cf8'];

const complianceTrendData = [
  { week: 'W1', score: 63 },
  { week: 'W2', score: 64 },
  { week: 'W3', score: 63.5 },
  { week: 'W4', score: 65 },
  { week: 'W5', score: 65.5 },
  { week: 'W6', score: 67 },
  { week: 'W7', score: 66.5 },
  { week: 'W8', score: 68 },
  { week: 'W9', score: 68.5 },
  { week: 'W10', score: 69 },
  { week: 'W11', score: 70 },
  { week: 'W12', score: 71 },
];

const complianceDistData = [
  { name: '0-25%', value: 12 },
  { name: '26-50%', value: 47 },
  { name: '51-75%', value: 134 },
  { name: '76-90%', value: 98 },
  { name: '91-100%', value: 21 },
];

const frameworkLibrary = [
  {
    name: 'Keeping Children Safe in Education (KCSIE)',
    version: 'DfE • v2024.1',
    orgs: 247,
    status: 'Published',
  },
  {
    name: 'ISI Regulatory Compliance',
    version: 'ISI • v3.0',
    orgs: 38,
    status: 'Published',
  },
  {
    name: 'Ofsted Education Inspection Framework (EIF)',
    version: 'Ofsted • v2023.2',
    orgs: 189,
    status: 'Published',
  },
  {
    name: 'GDPR & Data Protection (Education)',
    version: 'ICO • v2.1',
    orgs: 203,
    status: 'Published',
  },
  {
    name: 'SEN & Disability (SEND) Code of Practice',
    version: 'DfE • v2015.r1',
    orgs: 97,
    status: 'Draft',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}

const StatCard = ({ label, value, change, positive, icon }: StatCardProps) => (
  <div className="bg-card border border-border rounded-[10px] p-5 flex-1 min-w-0 transition-colors duration-300">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <span className="text-muted-foreground/40">{icon}</span>
    </div>
    <p className="text-4xl font-bold text-foreground leading-none mb-2">{value}</p>
    <p className={`text-xs ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
      {change}
    </p>
  </div>
);

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-md p-2 text-xs text-popover-foreground shadow-lg">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-emerald-500">{payload[0].value} orgs</p>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-md p-2 text-xs text-popover-foreground shadow-lg">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-emerald-500">{payload[0].value.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  return (
    <div className="p-7 space-y-6 transition-colors duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm mt-0.5 text-muted-foreground">
          Real-time overview of the ECI ecosystem
        </p>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-4">
        <StatCard
          label="TOTAL ORGANISATIONS"
          value={312}
          change="+8 this week"
          positive
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          label="ACTIVE"
          value={247}
          change="+5 this week"
          positive
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          label="ONBOARDING"
          value={48}
          change="+6 this week"
          positive
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="INACTIVE / SUSPENDED"
          value={17}
          change="-3 this week"
          positive={false}
          icon={<PauseCircle className="w-5 h-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-[10px] p-[22px] transition-colors duration-300">
          <p className="text-sm font-semibold text-foreground mb-4">Organisations by School Type</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={schoolTypeData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              barSize={12}
            >
              <CartesianGrid horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickCount={5}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={148}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {schoolTypeData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={schoolTypeColors[index % schoolTypeColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-card border border-border rounded-[10px] p-[22px] transition-colors duration-300">
          <p className="text-sm font-semibold text-foreground mb-4">Platform Compliance Trend (12 Weeks)</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={complianceTrendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" />
              <XAxis
                dataKey="week"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: 'hsl(var(--primary))' }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Compliance Distribution */}
        <div className="bg-card border border-border rounded-[10px] p-[22px] transition-colors duration-300">
          <p className="text-sm font-semibold text-foreground mb-4">Compliance Distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={complianceDistData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={32}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                {complianceDistData.map((_entry, index) => (
                  <Cell
                    key={`cell-dist-${index}`}
                    fill={index === 2 ? 'hsl(var(--primary))' : index === 3 ? 'hsl(var(--primary) / 0.7)' : 'hsl(var(--muted))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Framework Library Status */}
        <div className="bg-card border border-border rounded-[10px] p-[22px] transition-colors duration-300">
          <p className="text-sm font-semibold text-foreground mb-4">Framework Library Status</p>
          <div className="space-y-3">
            {frameworkLibrary.map((fw) => (
              <div key={fw.name} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate leading-tight">{fw.name}</p>
                  <p className="text-xs mt-0.5 text-muted-foreground">
                    {fw.version}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground/60">
                    {fw.orgs} orgs
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      fw.status === 'Published' 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
                  >
                    {fw.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
