import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getIncidentById, saveIncident, addAuditEntry } from '@/lib/storage';
import { Incident, IncidentSeverity, COMPLIANCE_CATEGORIES } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { IncidentTypeBadge } from '@/components/incidents/IncidentTypeBadge';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
  FileText,
  Send,
  MessageSquare,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ReviewIncident = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reviewData, setReviewData] = useState({
    severity: '' as IncidentSeverity | '',
    classification: '',
    assessment: '',
    complianceCategory: '',
    infoRequestMessage: '',
  });

  useEffect(() => {
    if (id) {
      const found = getIncidentById(id);
      if (found) {
        setIncident(found);
        if (found.officerReview) {
          setReviewData({
            severity: found.officerReview.severity || '',
            classification: found.officerReview.classification || '',
            assessment: found.officerReview.assessment || '',
            complianceCategory: found.officerReview.complianceCategory || '',
            infoRequestMessage: '',
          });
        }
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

  const handleStartReview = () => {
    if (!user) return;

    const updatedIncident: Incident = {
      ...incident,
      status: 'under-review',
      officerReview: {
        officerId: user.id,
        officerName: user.name,
      },
      updatedAt: new Date().toISOString(),
    };

    saveIncident(updatedIncident);
    addAuditEntry({
      incidentId: incident.id,
      action: 'Review started',
      performedBy: user.id,
      performedByName: user.name,
    });

    setIncident(updatedIncident);
    toast.success('Review started');
  };

  const handleRequestInfo = async () => {
    if (!user || !reviewData.infoRequestMessage.trim()) {
      toast.error('Please enter a message explaining what information you need');
      return;
    }

    setIsSubmitting(true);

    const updatedIncident: Incident = {
      ...incident,
      status: 'info-requested',
      officerReview: {
        ...incident.officerReview,
        officerId: user.id,
        officerName: user.name,
        severity: reviewData.severity as IncidentSeverity || undefined,
        classification: reviewData.classification || undefined,
        assessment: reviewData.assessment || undefined,
        complianceCategory: reviewData.complianceCategory || undefined,
        infoRequestMessage: reviewData.infoRequestMessage.trim(),
      },
      updatedAt: new Date().toISOString(),
    };

    saveIncident(updatedIncident);
    addAuditEntry({
      incidentId: incident.id,
      action: 'Additional information requested',
      performedBy: user.id,
      performedByName: user.name,
      details: reviewData.infoRequestMessage.trim(),
    });

    setIncident(updatedIncident);
    setReviewData(prev => ({ ...prev, infoRequestMessage: '' }));
    toast.success('Information request sent to staff member');
    setIsSubmitting(false);
  };

  const handleFinalize = async () => {
    if (!user) return;
    
    if (!reviewData.severity || !reviewData.assessment.trim()) {
      toast.error('Please provide severity and assessment before finalizing');
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const updatedIncident: Incident = {
      ...incident,
      status: 'finalized',
      officerReview: {
        ...incident.officerReview,
        officerId: user.id,
        officerName: user.name,
        severity: reviewData.severity as IncidentSeverity,
        classification: reviewData.classification || undefined,
        assessment: reviewData.assessment.trim(),
        complianceCategory: reviewData.complianceCategory || undefined,
        reviewedAt: now,
      },
      finalizedAt: now,
      finalizedBy: user.name,
      updatedAt: now,
    };

    saveIncident(updatedIncident);
    addAuditEntry({
      incidentId: incident.id,
      action: 'Incident finalized and submitted to Principal',
      performedBy: user.id,
      performedByName: user.name,
    });

    toast.success('Incident finalized and submitted to Principal');
    navigate('/review');
    setIsSubmitting(false);
  };

  const canReview = user?.role === 'officer' && 
    (incident.status === 'submitted' || incident.status === 'under-review' || incident.status === 'info-requested');

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Original Report */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Review Incident</h1>
              <p className="text-sm text-muted-foreground">
                Original staff report
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Staff Report</CardTitle>
                <div className="flex items-center gap-2">
                  <IncidentTypeBadge type={incident.type} />
                  <StatusBadge status={incident.status} />
                </div>
              </div>
              <CardDescription>
                Reported by {incident.reporterName} on {format(new Date(incident.createdAt), 'PPP')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {incident.isUrgent && (
                <div className="flex items-center gap-2 text-destructive font-medium p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  Marked as Urgent
                </div>
              )}

              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Student:</strong> {incident.studentName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Location:</strong> {incident.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Date/Time:</strong> {format(new Date(incident.incidentDate), 'PPP')} at {incident.incidentTime}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                  {incident.description}
                </p>
              </div>

              {incident.immediateAction && (
                <div>
                  <p className="text-sm font-medium mb-2">Immediate Action Taken</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                    {incident.immediateAction}
                  </p>
                </div>
              )}

              {incident.additionalInfo && (
                <div>
                  <p className="text-sm font-medium mb-2">Additional Information (Staff Response)</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                    {incident.additionalInfo}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Officer Review */}
        <div className="space-y-6">
          <div className="h-[52px] flex items-center">
            <h2 className="text-xl font-bold text-foreground">Officer Assessment</h2>
          </div>

          {incident.status === 'submitted' && canReview && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    Start your review to assess this incident
                  </p>
                  <Button onClick={handleStartReview}>
                    Start Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(incident.status === 'under-review' || incident.status === 'info-requested') && canReview && (
            <Card>
              <CardHeader>
                <CardTitle>Your Assessment</CardTitle>
                <CardDescription>
                  Complete your review of this incident
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Severity *</Label>
                    <Select
                      value={reviewData.severity}
                      onValueChange={(value) => setReviewData(prev => ({ ...prev, severity: value as IncidentSeverity }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Classification</Label>
                    <Select
                      value={reviewData.classification}
                      onValueChange={(value) => setReviewData(prev => ({ ...prev, classification: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Minor Incident">Minor Incident</SelectItem>
                        <SelectItem value="Moderate Incident">Moderate Incident</SelectItem>
                        <SelectItem value="Serious Incident">Serious Incident</SelectItem>
                        <SelectItem value="Critical Incident">Critical Incident</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Compliance Category</Label>
                  <Select
                    value={reviewData.complianceCategory}
                    onValueChange={(value) => setReviewData(prev => ({ ...prev, complianceCategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select compliance category" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLIANCE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Professional Assessment *</Label>
                  <Textarea
                    placeholder="Provide your professional assessment of this incident, including recommended follow-up actions..."
                    value={reviewData.assessment}
                    onChange={(e) => setReviewData(prev => ({ ...prev, assessment: e.target.value }))}
                    rows={5}
                  />
                </div>

                <Separator />

                {/* Request More Info */}
                <div className="space-y-2">
                  <Label>Request Additional Information</Label>
                  <Textarea
                    placeholder="If you need more details from the staff member, describe what you need here..."
                    value={reviewData.infoRequestMessage}
                    onChange={(e) => setReviewData(prev => ({ ...prev, infoRequestMessage: e.target.value }))}
                    rows={3}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleRequestInfo}
                    disabled={isSubmitting || !reviewData.infoRequestMessage.trim()}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    Request More Info
                  </Button>
                </div>

                <Separator />

                {/* Finalize */}
                <Button 
                  onClick={handleFinalize}
                  disabled={isSubmitting || !reviewData.severity || !reviewData.assessment.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Finalize & Submit to Principal
                </Button>
              </CardContent>
            </Card>
          )}

          {incident.status === 'finalized' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-status-finalized" />
                  Review Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This incident has been finalized and submitted to the Principal.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ReviewIncident;
