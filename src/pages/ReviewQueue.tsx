import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Incident } from '@/types/incident';
import { schoolIncidentService } from '@/services/school/incidentService';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { IncidentTypeBadge } from '@/components/incidents/IncidentTypeBadge';
import { ClipboardCheck, Clock, AlertTriangle, MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const safeFormatDate = (dateStr: any, formatStr: string, fallback = "N/A") => {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch (e) {
    return fallback;
  }
};

const ReviewQueue = () => {
  const navigate = useNavigate();

  const { data: allIncidents = [], isLoading: loadingIncidents, error: incidentsError } = useQuery({
    queryKey: ["incidents"],
    queryFn: schoolIncidentService.listIncidents,
  });

  const { data: discussionQueue = [], isLoading: loadingDiscussion, error: discussionError } = useQuery({
    queryKey: ["incidents-discussion-queue"],
    queryFn: schoolIncidentService.listDiscussionQueue,
  });

  useEffect(() => {
    if (incidentsError) console.error("REVIEW_QUEUE_INCIDENTS_ERROR:", incidentsError);
  }, [incidentsError]);

  useEffect(() => {
    if (discussionError) console.error("REVIEW_QUEUE_DISCUSSION_ERROR:", discussionError);
  }, [discussionError]);

  const pending = allIncidents.filter((i) => i.status === "submitted");
  const underReview = allIncidents.filter((i) => i.status === "under-review");

  useEffect(() => {
    console.log("REVIEW_QUEUE_DATA:", {
      allIncidents,
      pending: { count: pending.length, items: pending },
      underReview: { count: underReview.length, items: underReview },
      discussionQueue: { count: discussionQueue.length, items: discussionQueue },
    });
  }, [allIncidents, discussionQueue]);

  const sortByUrgency = (incidents: Incident[]) => {
    return [...incidents].sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  const IncidentList = ({ incidents, emptyMessage, loading }: { incidents: Incident[]; emptyMessage: string; loading?: boolean }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return incidents.length === 0 ? (
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
                Reported by {incident.reporterName} • {safeFormatDate(incident.createdAt, 'PPp')}
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
    );
  };

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
              Info Requested ({discussionQueue.length})
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
                  loading={loadingIncidents}
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
                  loading={loadingIncidents}
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
                  incidents={discussionQueue}
                  emptyMessage="No incidents awaiting information"
                  loading={loadingDiscussion}
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
