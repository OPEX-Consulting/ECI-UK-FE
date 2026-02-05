import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getIncidentsByStatus, getIncidents } from '@/lib/storage';
import { Incident } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { IncidentTypeBadge } from '@/components/incidents/IncidentTypeBadge';
import { ClipboardCheck, Clock, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingReview, setPendingReview] = useState<Incident[]>([]);
  const [underReview, setUnderReview] = useState<Incident[]>([]);

  useEffect(() => {
    const pending = getIncidentsByStatus(['submitted']);
    const reviewing = getIncidentsByStatus(['under-review', 'info-requested']);
    setPendingReview(pending);
    setUnderReview(reviewing);
  }, []);

  const allIncidents = getIncidents();
  const stats = {
    pendingCount: pendingReview.length,
    inProgressCount: underReview.length,
    totalThisMonth: allIncidents.filter(i => {
      const incidentDate = new Date(i.createdAt);
      const now = new Date();
      return incidentDate.getMonth() === now.getMonth() && 
             incidentDate.getFullYear() === now.getFullYear();
    }).length,
    urgentCount: pendingReview.filter(i => i.isUrgent).length,
  };

  const sortedPending = [...pendingReview].sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className={stats.urgentCount > 0 ? 'border-destructive' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCount}</div>
              {stats.urgentCount > 0 && (
                <p className="text-xs text-destructive font-medium">
                  {stats.urgentCount} urgent
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressCount}</div>
              <p className="text-xs text-muted-foreground">Under review / Info requested</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalThisMonth}</div>
              <p className="text-xs text-muted-foreground">Total incidents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/review')}
              >
                View All Pending
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Review Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Review Queue</CardTitle>
            <CardDescription>Incidents awaiting your review (urgent first)</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedPending.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No incidents pending review</p>
                <p className="text-sm">Great job keeping up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPending.slice(0, 5).map(incident => (
                  <div
                    key={incident.id}
                    className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                      incident.isUrgent ? 'border-destructive bg-destructive/5' : 'border-border'
                    }`}
                    onClick={() => navigate(`/review/${incident.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <IncidentTypeBadge type={incident.type} />
                          <StatusBadge status={incident.status} />
                          {incident.isUrgent && (
                            <span className="text-xs font-semibold text-destructive uppercase">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="font-medium">{incident.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Reported by {incident.reporterName} • {format(new Date(incident.createdAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                ))}
                {sortedPending.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => navigate('/review')}
                  >
                    View all {sortedPending.length} pending incidents
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Progress */}
        {underReview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
              <CardDescription>Incidents you're currently reviewing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {underReview.map(incident => (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/review/${incident.id}`)}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <IncidentTypeBadge type={incident.type} />
                        <StatusBadge status={incident.status} />
                      </div>
                      <p className="font-medium">{incident.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {incident.location} • {format(new Date(incident.incidentDate), 'PPP')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Continue
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};
