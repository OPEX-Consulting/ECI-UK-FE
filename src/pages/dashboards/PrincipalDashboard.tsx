import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getIncidents, getFinalizedIncidents } from '@/lib/storage';
import { Incident } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { IncidentTypeBadge } from '@/components/incidents/IncidentTypeBadge';
import { SeverityBadge } from '@/components/incidents/SeverityBadge';
import { schoolDashboardService } from '@/services/school/dashboardService';
import { 
  BarChart3, 
  Shield, 
  Users, 
  Heart, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

export const PrincipalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [finalizedIncidents, setFinalizedIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setFinalizedIncidents(getFinalizedIncidents());
  }, []);

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ['principal-dashboard'],
    queryFn: () => schoolDashboardService.getPrincipalDashboard(),
  });

  const recentFinalized = finalizedIncidents
    .sort((a, b) => new Date(b.finalizedAt || b.updatedAt).getTime() - new Date(a.finalizedAt || a.updatedAt).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError || !dashboardData) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-destructive">
            <AlertTriangle className="h-8 w-8" />
            <p className="text-sm">Failed to load dashboard data.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const complianceScore = dashboardData.incident_readiness.percentage || 0;

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
          <Button variant="outline" onClick={() => navigate('/compliance')}>
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </div>

        {/* Compliance Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Inspection Readiness
            </CardTitle>
            <CardDescription>
              Based on incident documentation and review completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Readiness Score</span>
                <span className="text-2xl font-bold">{complianceScore}%</span>
              </div>
              <Progress value={complianceScore} className="h-3" />
              <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                <span>{dashboardData.incident_readiness.completed_tasks} of {dashboardData.incident_readiness.total_tasks} tasks completed</span>
                {dashboardData.total_incidents.total > dashboardData.total_incidents.finalized && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-status-under-review" />
                    {dashboardData.total_incidents.total - dashboardData.total_incidents.finalized} incident(s) pending review
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats by Type */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.total_incidents.total}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.total_incidents.finalized} finalized
              </p>
            </CardContent>
          </Card>

          <Card className="border-incident-safeguarding/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Safeguarding</CardTitle>
              <Shield className="h-4 w-4 text-incident-safeguarding" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.safeguarding.total}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.safeguarding.finalized} finalized
              </p>
            </CardContent>
          </Card>

          <Card className="border-incident-behavioral/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Behavioral</CardTitle>
              <Users className="h-4 w-4 text-incident-behavioral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.behavioral.total}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.behavioral.finalized} finalized
              </p>
            </CardContent>
          </Card>

          <Card className="border-incident-health-safety/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health & Safety</CardTitle>
              <Heart className="h-4 w-4 text-incident-health-safety" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.health_and_safety.total}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.health_and_safety.finalized} finalized
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Finalized */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Finalized Incidents</CardTitle>
                <CardDescription>Completed and ready for inspection</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/incidents')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentFinalized.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No finalized incidents yet</p>
                <p className="text-sm">Incidents will appear here once reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFinalized.map(incident => (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/incident/${incident.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <IncidentTypeBadge type={incident.type} />
                        <StatusBadge status={incident.status} />
                        {incident.officerReview?.severity && (
                          <SeverityBadge severity={incident.officerReview.severity} />
                        )}
                      </div>
                      <p className="font-medium">{incident.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {incident.location} • {format(new Date(incident.incidentDate), 'PPP')}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

