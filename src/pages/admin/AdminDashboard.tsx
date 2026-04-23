/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "recharts";
import {
  Building2,
  CheckCircle2,
  Clock,
  PauseCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getAdminDashboardData } from "@/services/dashboardService";

const schoolTypeColors = [
  "#34d399",
  "#60a5fa",
  "#f59e0b",
  "#a78bfa",
  "#f87171",
  "#2dd4bf",
  "#818cf8",
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
  <div className="flex-1 bg-card p-5 border border-border rounded-[10px] min-w-0 transition-colors duration-300">
    <div className="flex justify-between items-start mb-3">
      <p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
        {label}
      </p>
      <span className="text-muted-foreground/40">{icon}</span>
    </div>
    <p className="mb-2 font-bold text-foreground text-4xl leading-none">
      {value}
    </p>
    <p className={`text-xs ${positive ? "text-emerald-500" : "text-red-500"}`}>
      {change}
    </p>
  </div>
);

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover shadow-lg p-2 border border-border rounded-md text-popover-foreground text-xs">
        <p className="mb-1 font-medium">{label}</p>
        <p className="text-emerald-500">{payload[0].value} orgs</p>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover shadow-lg p-2 border border-border rounded-md text-popover-foreground text-xs">
        <p className="mb-1 font-medium">{label}</p>
        <p className="text-emerald-500">{payload[0].value.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Formats snake_case strings to Title Case (e.g., "academy_trust" -> "Academy Trust")
const formatSchoolType = (type: string) => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Formats numeric changes to string (e.g., 8 -> "+8 this week", -3 -> "-3 this week")
const formatChangeText = (num: number) => {
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num} this week`;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: getAdminDashboardData,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-100px)] text-destructive">
        <AlertCircle className="mb-4 w-10 h-10" />
        <p className="font-medium text-lg">Failed to load dashboard data</p>
        <p className="text-muted-foreground text-sm">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  // ─── Data Mapping ───
  const mappedSchoolTypeData = data.orgs_by_school_type.map((item) => ({
    name: formatSchoolType(item.school_type),
    value: item.count,
  }));

  const mappedComplianceDistData = data.compliance_distribution.map((item) => ({
    name: item.range,
    value: item.count,
  }));

  const { kpis } = data;

  return (
    <div className="space-y-6 p-7 transition-colors duration-300">
      {/* Page Header */}
      <div>
        <h1 className="font-semibold text-foreground text-xl font-serif">Dashboard</h1>
        <p className="mt-0.5 text-muted-foreground text-sm">
          Real-time overview of the ECI ecosystem
        </p>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-4">
        <StatCard
          label="TOTAL ORGANISATIONS"
          value={kpis.total_organisations.count}
          change={formatChangeText(kpis.total_organisations.weekly_change)}
          positive={kpis.total_organisations.weekly_change >= 0}
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          label="ACTIVE"
          value={kpis.active.count}
          change={formatChangeText(kpis.active.weekly_change)}
          positive={kpis.active.weekly_change >= 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          label="ONBOARDING"
          value={kpis.onboarding.count}
          change={formatChangeText(kpis.onboarding.weekly_change)}
          positive={kpis.onboarding.weekly_change >= 0}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="INACTIVE / SUSPENDED"
          value={kpis.inactive_suspended.count}
          change={formatChangeText(kpis.inactive_suspended.weekly_change)}
          positive={kpis.inactive_suspended.weekly_change <= 0} // Usually, lower suspensions are positive
          icon={<PauseCircle className="w-5 h-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="gap-4 grid grid-cols-2">
        {/* Bar Chart */}
        <div className="bg-card p-[22px] border border-border rounded-[10px] transition-colors duration-300">
          <p className="mb-4 font-semibold text-foreground text-sm">
            Organisations by School Type
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={mappedSchoolTypeData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              barSize={12}
            >
              <CartesianGrid
                horizontal={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                type="number"
                tickCount={5}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={148}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomBarTooltip />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {mappedSchoolTypeData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={schoolTypeColors[index % schoolTypeColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-card p-[22px] border border-border rounded-[10px] transition-colors duration-300">
          <p className="mb-4 font-semibold text-foreground text-sm">
            Platform Compliance Trend (12 Weeks)
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={data.compliance_trend}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                stroke="hsl(var(--border))"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="week"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomLineTooltip />}
                cursor={{ stroke: "hsl(var(--primary))" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="gap-4 grid grid-cols-2">
        {/* Compliance Distribution */}
        <div className="bg-card p-[22px] border border-border rounded-[10px] transition-colors duration-300">
          <p className="mb-4 font-semibold text-foreground text-sm">
            Compliance Distribution
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={mappedComplianceDistData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              barSize={32}
            >
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomBarTooltip />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              >
                {mappedComplianceDistData.map((_entry, index) => (
                  <Cell
                    key={`cell-dist-${index}`}
                    fill={
                      index === 2
                        ? "hsl(var(--primary))"
                        : index === 3
                          ? "hsl(var(--primary) / 0.7)"
                          : "hsl(var(--muted))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Framework Library Status */}
        <div className="bg-card p-[22px] border border-border rounded-[10px] transition-colors duration-300">
          <p className="mb-4 font-semibold text-foreground text-sm">
            Framework Library Status
          </p>
          <div className="space-y-3">
            {data.framework_status.map((fw) => (
              <div
                key={fw.title}
                className="flex justify-between items-center gap-3"
              >
                <div className="min-w-0">
                  <p className="text-foreground text-sm truncate leading-tight">
                    {fw.title}
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs">
                    v{fw.version}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground/60 text-xs">
                    {fw.org_count} orgs
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      fw.status === "Published"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
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
