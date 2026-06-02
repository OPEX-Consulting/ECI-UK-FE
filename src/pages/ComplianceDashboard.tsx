import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Shield,
  Users,
  Heart,
  CheckCircle2,
  AlertTriangle,
  Download,
  TrendingUp,
  Clock,
  Loader2,
  FileText,
  ClipboardCheck,
  Activity,
  Eye,
  PlayCircle,
  MessageSquare,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { schoolDashboardService } from '@/services/school/dashboardService';
import { schoolIncidentService } from '@/services/school/incidentService';
import { cn } from '@/lib/utils';

const ComplianceDashboard = () => {
  const { data: complianceData, isLoading: complianceLoading, isError: complianceError } = useQuery({
    queryKey: ['compliance-dashboard'],
    queryFn: () => schoolIncidentService.getComplianceDashboard(),
  });

  const { data: severityData, isLoading: severityLoading, isError: severityError } = useQuery({
    queryKey: ['severity-distribution'],
    queryFn: () => schoolDashboardService.getSeverityDistribution(),
  });

  const { data: incidents = [], isLoading: incidentsLoading, isError: incidentsError } = useQuery({
    queryKey: ['all-incidents'],
    queryFn: () => schoolIncidentService.listIncidents(),
  });

  const isLoading = complianceLoading || severityLoading || incidentsLoading;
  const isError = complianceError || severityError || incidentsError;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading compliance metrics...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError || !complianceData || !severityData) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-destructive">
            <AlertTriangle className="h-8 w-8" />
            <p className="text-sm">Failed to load compliance metrics.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  console.log("COMPLIANCE_DASHBOARD_DATA:", complianceData);
  console.log("COMPLIANCE_STATS:", {
    total_incidents: complianceData.total_incidents,
    pending_review: complianceData.pending_review,
    in_progress: complianceData.in_progress,
    under_review_info_requested: complianceData.under_review_info_requested,
    this_month: complianceData.this_month,
  });

  const finalizedIncidents = incidents.filter(i => i.status === 'finalized');

  const finalized =
    complianceData.total_incidents -
    complianceData.pending_review -
    complianceData.in_progress -
    complianceData.under_review_info_requested;

  const stats = {
    total: complianceData.total_incidents,
    finalized,
    pending: complianceData.pending_review + complianceData.in_progress + complianceData.under_review_info_requested,
    pendingReview: complianceData.pending_review,
    inProgress: complianceData.in_progress,
    underReviewInfoRequested: complianceData.under_review_info_requested,
    thisMonth: complianceData.this_month,
    safeguarding: incidents.filter(i => i.type === 'safeguarding').length,
    behavioral: incidents.filter(i => i.type === 'behavioral').length,
    healthSafety: incidents.filter(i => i.type === 'health-safety').length,
    urgent: incidents.filter(i => i.isUrgent && i.status !== 'finalized').length,
    totalDocumented: severityData.total_all_time,
    readyForInspection: severityData.total_documented,
  };

  const complianceScore = stats.total > 0 ? Math.round((stats.finalized / stats.total) * 100) : 0;

  const severityCounts = {
    low: severityData.low,
    medium: severityData.medium,
    high: severityData.high,
    critical: severityData.critical,
  };

  const handleExport = () => {
    const headers = ['ID', 'Type', 'Status', 'Student', 'Location', 'Date', 'Severity', 'Reporter'];
    const rows = finalizedIncidents.map(i => [
      i.id,
      i.type,
      i.status,
      i.studentName,
      i.location,
      i.incidentDate,
      i.officerReview?.severity || 'N/A',
      i.reporterName,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Inspection readiness and compliance metrics
            </p>
          </div>
          <Button onClick={handleExport} disabled={finalizedIncidents.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export Report (CSV)
          </Button>
        </div>

        {/* Compliance Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Inspection Readiness Score
            </CardTitle>
            <CardDescription>
              Based on documentation completeness and review status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Score</span>
                <span className={`text-3xl font-bold ${
                  complianceScore >= 80 ? 'text-status-finalized' :
                  complianceScore >= 60 ? 'text-status-under-review' :
                  'text-destructive'
                }`}>
                  {complianceScore}%
                </span>
              </div>
              <Progress value={complianceScore} className="h-4" />
              <div className="grid gap-2 md:grid-cols-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-finalized" />
                  <span>{stats.finalized} finalized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-status-under-review" />
                  <span>{stats.pending} pending</span>
                </div>
                {stats.urgent > 0 && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{stats.urgent} urgent</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Incident Statistics ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Incident Statistics
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Pending Review */}
            <Card className={cn(
              'border-orange-200 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20',
              stats.pendingReview > 0 && 'ring-1 ring-orange-300 dark:ring-orange-800'
            )}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Review</p>
                    <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                      {stats.pendingReview}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="mt-3 text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0"
                >
                  Awaiting initial review
                </Badge>
              </CardContent>
            </Card>

            {/* In Progress */}
            <Card className="border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Progress</p>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      {stats.inProgress}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="mt-3 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0"
                >
                  Action in progress
                </Badge>
              </CardContent>
            </Card>

            {/* Under Review / Info Requested */}
            <Card className={cn(
              'border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20',
              stats.underReviewInfoRequested > 0 && 'ring-1 ring-purple-300 dark:ring-purple-800'
            )}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Info Requested</p>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                      {stats.underReviewInfoRequested}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="mt-3 text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-0"
                >
                  Awaiting additional info
                </Badge>
              </CardContent>
            </Card>

            {/* This Month */}
            <Card className="border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">This Month</p>
                    <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {stats.thisMonth}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="mt-3 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0"
                >
                  Incidents this month
                </Badge>
              </CardContent>
            </Card>

          </div>

          {/* Summary Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Total Incidents */}
            <Card className="border-slate-200 dark:border-slate-900/40 bg-slate-50/40 dark:bg-slate-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Incidents</p>
                    <p className="text-4xl font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                      {stats.total}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900/40 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="mt-3 text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-0"
                >
                  All time
                </Badge>
              </CardContent>
            </Card>

            {/* Finalized */}
            <Card className="border-green-200 dark:border-green-900/40 bg-green-50/40 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Finalized</p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400 tabular-nums">
                      {stats.finalized}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="mt-3 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0"
                >
                  Resolved &amp; closed
                </Badge>
              </CardContent>
            </Card>

            {/* Total Documented */}
            <Card className="border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/40 dark:bg-cyan-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Documented</p>
                    <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                      {stats.totalDocumented}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="mt-3 text-[10px] bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-0"
                >
                  All time incidents
                </Badge>
              </CardContent>
            </Card>

            {/* Ready for Inspection */}
            <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ready for Inspection</p>
                    <p className="text-4xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {stats.readyForInspection}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                    <ClipboardCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="mt-3 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0"
                >
                  Fully documented &amp; reviewed
                </Badge>
              </CardContent>
            </Card>

          </div>
        </div>
        {/* ─────────────────────────────────────────────────────────────────── */}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Stats by Type */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-incident-safeguarding/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Safeguarding</CardTitle>
                  <Shield className="h-5 w-5 text-incident-safeguarding" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.safeguarding}</div>
                  <p className="text-xs text-muted-foreground">KCSIE Part 1-5 related</p>
                </CardContent>
              </Card>

              <Card className="border-incident-behavioral/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Behavioral</CardTitle>
                  <Users className="h-5 w-5 text-incident-behavioral" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.behavioral}</div>
                  <p className="text-xs text-muted-foreground">EIF Behaviour &amp; Attitudes</p>
                </CardContent>
              </Card>

              <Card className="border-incident-health-safety/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Health &amp; Safety</CardTitle>
                  <Heart className="h-5 w-5 text-incident-health-safety" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.healthSafety}</div>
                  <p className="text-xs text-muted-foreground">H&amp;S Regulations</p>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {(stats.pendingReview > 0 || stats.underReviewInfoRequested > 0 || stats.urgent > 0) && (
              <Card className="border-status-under-review">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-status-under-review">
                    <AlertTriangle className="w-5 h-5" />
                    Compliance Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {stats.pendingReview > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        {stats.pendingReview} incident(s) pending initial review
                      </li>
                    )}
                    {stats.underReviewInfoRequested > 0 && (
                      <li className="flex items-center gap-2 text-status-info-requested">
                        <span className="w-2 h-2 rounded-full bg-status-info-requested" />
                        {stats.underReviewInfoRequested} incident(s) awaiting additional information
                      </li>
                    )}
                    {stats.urgent > 0 && (
                      <li className="flex items-center gap-2 text-destructive">
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                        {stats.urgent} urgent incident(s) require immediate attention
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="breakdown" className="mt-6 space-y-6">
            {/* Severity Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Breakdown of finalized incidents by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(
                    [
                      { label: 'Low', value: severityCounts.low, colorBar: 'bg-severity-low', colorText: 'text-severity-low' },
                      { label: 'Medium', value: severityCounts.medium, colorBar: 'bg-severity-medium', colorText: 'text-severity-medium' },
                      { label: 'High', value: severityCounts.high, colorBar: 'bg-severity-high', colorText: 'text-severity-high' },
                      { label: 'Critical', value: severityCounts.critical, colorBar: 'bg-severity-critical', colorText: 'text-severity-critical' },
                    ] as const
                  ).map(({ label, value, colorBar, colorText }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${colorText}`}>{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-muted rounded-full h-2">
                          <div
                            className={`${colorBar} h-2 rounded-full`}
                            style={{ width: `${severityData.total_documented > 0 ? (value / severityData.total_documented) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm w-8 tabular-nums">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats repeated for breakdown context */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documented</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{severityData.total_all_time}</div>
                  <p className="text-xs text-muted-foreground">All time incidents</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ready for Inspection</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-status-finalized" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-status-finalized">{severityData.total_documented}</div>
                  <p className="text-xs text-muted-foreground">Fully documented &amp; reviewed</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ComplianceDashboard;
