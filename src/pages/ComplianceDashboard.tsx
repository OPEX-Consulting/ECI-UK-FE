import { useEffect, useState } from 'react';
import { getIncidents, getFinalizedIncidents } from '@/lib/storage';
import { Incident } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Shield, 
  Users, 
  Heart, 
  CheckCircle, 
  AlertTriangle,
  Download,
  TrendingUp,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const ComplianceDashboard = () => {
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [finalizedIncidents, setFinalizedIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setAllIncidents(getIncidents());
    setFinalizedIncidents(getFinalizedIncidents());
  }, []);

  const stats = {
    total: allIncidents.length,
    finalized: finalizedIncidents.length,
    pending: allIncidents.filter(i => i.status !== 'finalized' && i.status !== 'draft').length,
    safeguarding: allIncidents.filter(i => i.type === 'safeguarding').length,
    behavioral: allIncidents.filter(i => i.type === 'behavioral').length,
    healthSafety: allIncidents.filter(i => i.type === 'health-safety').length,
    urgent: allIncidents.filter(i => i.isUrgent && i.status !== 'finalized').length,
  };

  const complianceScore = stats.total > 0 
    ? Math.round((stats.finalized / stats.total) * 100) 
    : 100;

  const severityCounts = {
    low: finalizedIncidents.filter(i => i.officerReview?.severity === 'low').length,
    medium: finalizedIncidents.filter(i => i.officerReview?.severity === 'medium').length,
    high: finalizedIncidents.filter(i => i.officerReview?.severity === 'high').length,
    critical: finalizedIncidents.filter(i => i.officerReview?.severity === 'critical').length,
  };

  const handleExport = () => {
    // Create a simple CSV export
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
            <p className="text-muted-foreground">
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
              <Progress 
                value={complianceScore} 
                className="h-4"
              />
              <div className="grid gap-2 md:grid-cols-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-status-finalized" />
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
                  <p className="text-xs text-muted-foreground">
                    KCSIE Part 1-5 related
                  </p>
                </CardContent>
              </Card>

              <Card className="border-incident-behavioral/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Behavioral</CardTitle>
                  <Users className="h-5 w-5 text-incident-behavioral" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.behavioral}</div>
                  <p className="text-xs text-muted-foreground">
                    EIF Behaviour & Attitudes
                  </p>
                </CardContent>
              </Card>

              <Card className="border-incident-health-safety/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Health & Safety</CardTitle>
                  <Heart className="h-5 w-5 text-incident-health-safety" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.healthSafety}</div>
                  <p className="text-xs text-muted-foreground">
                    H&S Regulations
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {(stats.pending > 0 || stats.urgent > 0) && (
              <Card className="border-status-under-review">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-status-under-review">
                    <AlertTriangle className="w-5 h-5" />
                    Compliance Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {stats.pending > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-status-under-review" />
                        {stats.pending} incident(s) awaiting review or finalization
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
                <CardDescription>
                  Breakdown of finalized incidents by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-severity-low">Low</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 bg-muted rounded-full h-2">
                        <div 
                          className="bg-severity-low h-2 rounded-full" 
                          style={{ width: `${finalizedIncidents.length > 0 ? (severityCounts.low / finalizedIncidents.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm w-8">{severityCounts.low}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-severity-medium">Medium</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 bg-muted rounded-full h-2">
                        <div 
                          className="bg-severity-medium h-2 rounded-full" 
                          style={{ width: `${finalizedIncidents.length > 0 ? (severityCounts.medium / finalizedIncidents.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm w-8">{severityCounts.medium}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-severity-high">High</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 bg-muted rounded-full h-2">
                        <div 
                          className="bg-severity-high h-2 rounded-full" 
                          style={{ width: `${finalizedIncidents.length > 0 ? (severityCounts.high / finalizedIncidents.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm w-8">{severityCounts.high}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-severity-critical">Critical</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 bg-muted rounded-full h-2">
                        <div 
                          className="bg-severity-critical h-2 rounded-full" 
                          style={{ width: `${finalizedIncidents.length > 0 ? (severityCounts.critical / finalizedIncidents.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm w-8">{severityCounts.critical}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documented</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    All time incidents
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ready for Inspection</CardTitle>
                  <CheckCircle className="h-4 w-4 text-status-finalized" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-status-finalized">{stats.finalized}</div>
                  <p className="text-xs text-muted-foreground">
                    Fully documented & reviewed
                  </p>
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
