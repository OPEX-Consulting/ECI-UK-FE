import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getIncidentsByReporter } from '@/lib/storage';
import { Incident } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { IncidentTypeBadge } from '@/components/incidents/IncidentTypeBadge';
import { FileText, AlertTriangle, Clock, CheckCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const loadIncidents = () => {
      if (user) {
        const userIncidents = getIncidentsByReporter(user.id);
        setIncidents(userIncidents);
      }
    };

    loadIncidents();

    // Listen for custom incidents-updated event
    const handleIncidentsUpdated = () => {
      loadIncidents();
    };

    window.addEventListener('incidents-updated', handleIncidentsUpdated);

    return () => {
      window.removeEventListener('incidents-updated', handleIncidentsUpdated);
    };
  }, [user]);

  const stats = {
    total: incidents.length,
    awaitingReview: incidents.filter(i => 
      i.status === 'submitted' || i.status === 'under-review'
    ).length,
    infoRequested: incidents.filter(i => i.status === 'info-requested').length,
    finalized: incidents.filter(i => i.status === 'finalized').length,
  };

  const recentIncidents = incidents
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Welcome back, {user?.name}
            </p>
          </div>
          <Button onClick={() => navigate('/report')}>
            <Plus className="w-4 h-4 mr-2" />
            Report Incident
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">This term</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Awaiting Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.awaitingReview}</div>
              <p className="text-xs text-muted-foreground">Pending officer review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Info Requested</CardTitle>
              <AlertTriangle className="h-4 w-4 text-status-info-requested" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.infoRequested}</div>
              <p className="text-xs text-muted-foreground">Needs your response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finalized</CardTitle>
              <CheckCircle className="h-4 w-4 text-status-finalized" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.finalized}</div>
              <p className="text-xs text-muted-foreground">Completed reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Your most recent incident reports</CardDescription>
          </CardHeader>
          <CardContent>
            {recentIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No incidents reported yet</p>
                <Button variant="link" onClick={() => navigate('/report')}>
                  Report your first incident
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentIncidents.map(incident => (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/incident/${incident.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <IncidentTypeBadge type={incident.type} />
                          <StatusBadge status={incident.status} />
                        </div>
                        <p className="font-medium">{incident.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(incident.incidentDate), 'PPP')} at {incident.location}
                        </p>
                      </div>
                    </div>
                    {incident.isUrgent && (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    )}
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
