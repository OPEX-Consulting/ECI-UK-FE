import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { 
  BarChart3, 
  Shield, 
  Users, 
  Heart, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

export const PrincipalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [finalizedIncidents, setFinalizedIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setAllIncidents(getIncidents());
    setFinalizedIncidents(getFinalizedIncidents());
  }, []);

  const stats = {
    total: allIncidents.length,
    finalized: finalizedIncidents.length,
    safeguarding: allIncidents.filter(i => i.type === 'safeguarding').length,
    behavioral: allIncidents.filter(i => i.type === 'behavioral').length,
    healthSafety: allIncidents.filter(i => i.type === 'health-safety').length,
    pending: allIncidents.filter(i => i.status !== 'finalized' && i.status !== 'draft').length,
  };

  // Calculate compliance readiness (simplified)
  const complianceScore = stats.total > 0 
    ? Math.round((stats.finalized / stats.total) * 100) 
    : 100;

  const recentFinalized = finalizedIncidents
    .sort((a, b) => new Date(b.finalizedAt || b.updatedAt).getTime() - new Date(a.finalizedAt || a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
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
              {stats.pending > 0 && (
                <p className="text-sm text-muted-foreground">
                  <AlertTriangle className="inline w-4 h-4 mr-1 text-status-under-review" />
                  {stats.pending} incident(s) pending review
                </p>
              )}
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
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.finalized} finalized
              </p>
            </CardContent>
          </Card>

          <Card className="border-incident-safeguarding/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Safeguarding</CardTitle>
              <Shield className="h-4 w-4 text-incident-safeguarding" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.safeguarding}</div>
              <p className="text-xs text-muted-foreground">KCSIE related</p>
            </CardContent>
          </Card>

          <Card className="border-incident-behavioral/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Behavioral</CardTitle>
              <Users className="h-4 w-4 text-incident-behavioral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.behavioral}</div>
              <p className="text-xs text-muted-foreground">EIF Behaviour & Attitudes</p>
            </CardContent>
          </Card>

          <Card className="border-incident-health-safety/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health & Safety</CardTitle>
              <Heart className="h-4 w-4 text-incident-health-safety" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.healthSafety}</div>
              <p className="text-xs text-muted-foreground">H&S regulations</p>
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
