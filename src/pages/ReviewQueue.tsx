import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidentsByStatus } from '@/lib/storage';
import { Incident } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { IncidentTypeBadge } from '@/components/incidents/IncidentTypeBadge';
import { ClipboardCheck, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const ReviewQueue = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState<Incident[]>([]);
  const [underReview, setUnderReview] = useState<Incident[]>([]);
  const [infoRequested, setInfoRequested] = useState<Incident[]>([]);

  useEffect(() => {
    setPending(getIncidentsByStatus(['submitted']));
    setUnderReview(getIncidentsByStatus(['under-review']));
    setInfoRequested(getIncidentsByStatus(['info-requested']));
  }, []);

  const sortByUrgency = (incidents: Incident[]) => {
    return [...incidents].sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  const IncidentList = ({ incidents, emptyMessage }: { incidents: Incident[]; emptyMessage: string }) => (
    incidents.length === 0 ? (
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    ) : (
      <div className="space-y-4">
        {sortByUrgency(incidents).map(incident => (
          <div
            key={incident.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors gap-4 ${
              incident.isUrgent ? 'border-destructive bg-destructive/5' : 'border-border'
            }`}
            onClick={() => navigate(`/review/${incident.id}`)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
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
              <p className="text-sm text-muted-foreground">
                {incident.location}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Review
            </Button>
          </div>
        ))}
      </div>
    )
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
          <p className="text-muted-foreground">
            Manage and review incident reports
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="reviewing" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              In Review ({underReview.length})
            </TabsTrigger>
            <TabsTrigger value="info" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Info Requested ({infoRequested.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Review</CardTitle>
                <CardDescription>
                  New incidents awaiting your review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentList 
                  incidents={pending} 
                  emptyMessage="No incidents pending review" 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviewing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Under Review</CardTitle>
                <CardDescription>
                  Incidents you're currently reviewing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentList 
                  incidents={underReview} 
                  emptyMessage="No incidents under review" 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Information Requested</CardTitle>
                <CardDescription>
                  Waiting for additional information from staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentList 
                  incidents={infoRequested} 
                  emptyMessage="No incidents awaiting information" 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReviewQueue;
