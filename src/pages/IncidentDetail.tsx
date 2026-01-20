import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getIncidentById, saveIncident, addAuditEntry, getAuditEntriesForIncident } from '@/lib/storage';
import { Incident, AuditEntry } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { IncidentTypeBadge } from '@/components/incidents/IncidentTypeBadge';
import { SeverityBadge } from '@/components/incidents/SeverityBadge';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
  FileText,
  Send,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const IncidentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getIncidentById(id);
      if (found) {
        setIncident(found);
        setAuditLog(getAuditEntriesForIncident(id));
      }
    }
  }, [id]);

  if (!incident) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Incident not found</p>
          <Button variant="link" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </div>
      </AppLayout>
    );
  }

  const canAddInfo = user?.role === 'staff' && 
    incident.reporterId === user.id && 
    incident.status === 'info-requested';

  const handleSubmitAdditionalInfo = async () => {
    if (!user || !additionalInfo.trim()) {
      toast.error('Please provide additional information');
      return;
    }

    setIsSubmitting(true);

    const updatedIncident: Incident = {
      ...incident,
      additionalInfo: additionalInfo.trim(),
      status: 'under-review',
      updatedAt: new Date().toISOString(),
    };

    saveIncident(updatedIncident);
    addAuditEntry({
      incidentId: incident.id,
      action: 'Additional information provided',
      performedBy: user.id,
      performedByName: user.name,
      details: additionalInfo.trim(),
    });

    setIncident(updatedIncident);
    setAuditLog(getAuditEntriesForIncident(incident.id));
    setAdditionalInfo('');
    toast.success('Additional information submitted');
    setIsSubmitting(false);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">Incident Report</h1>
              <IncidentTypeBadge type={incident.type} />
              <StatusBadge status={incident.status} />
              {incident.isUrgent && (
                <span className="flex items-center gap-1 text-sm text-destructive font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Urgent
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              Reported by {incident.reporterName}
            </p>
          </div>
        </div>

        {/* Info Request Alert */}
        {incident.status === 'info-requested' && incident.officerReview?.infoRequestMessage && (
          <Card className="border-status-info-requested bg-status-info-requested/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-status-info-requested text-lg">
                Additional Information Requested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{incident.officerReview.infoRequestMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">{incident.studentName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{incident.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {format(new Date(incident.incidentDate), 'PPP')} at {incident.incidentTime}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Description</p>
              <p className="whitespace-pre-wrap">{incident.description}</p>
            </div>

            {incident.immediateAction && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Immediate Action Taken</p>
                <p className="whitespace-pre-wrap">{incident.immediateAction}</p>
              </div>
            )}

            {incident.additionalInfo && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Additional Information</p>
                <p className="whitespace-pre-wrap">{incident.additionalInfo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Officer Review */}
        {incident.officerReview && incident.officerReview.assessment && (
          <Card>
            <CardHeader>
              <CardTitle>Officer Review</CardTitle>
              <CardDescription>
                Reviewed by {incident.officerReview.officerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                {incident.officerReview.severity && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Severity</p>
                    <SeverityBadge severity={incident.officerReview.severity} />
                  </div>
                )}
                {incident.officerReview.classification && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Classification</p>
                    <p className="font-medium">{incident.officerReview.classification}</p>
                  </div>
                )}
                {incident.officerReview.complianceCategory && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Compliance Category</p>
                    <p className="font-medium">{incident.officerReview.complianceCategory}</p>
                  </div>
                )}
              </div>

              {incident.officerReview.assessment && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Professional Assessment</p>
                  <p className="whitespace-pre-wrap">{incident.officerReview.assessment}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Info Form */}
        {canAddInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Provide Additional Information</CardTitle>
              <CardDescription>
                Respond to the officer's request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Your Response</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Provide the requested additional information..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleSubmitAdditionalInfo}
                disabled={isSubmitting || !additionalInfo.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Response
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {auditLog.length === 0 ? (
              <p className="text-muted-foreground text-sm">No activity recorded</p>
            ) : (
              <div className="space-y-4">
                {auditLog.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      {index < auditLog.length - 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-full bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{entry.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.performedByName} • {format(new Date(entry.timestamp), 'PPp')}
                      </p>
                      {entry.details && (
                        <p className="text-sm mt-1 text-muted-foreground italic">
                          "{entry.details}"
                        </p>
                      )}
                    </div>
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

export default IncidentDetail;
