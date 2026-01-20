import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { saveIncident, generateId, addAuditEntry } from '@/lib/storage';
import { IncidentType, LOCATIONS } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Heart, AlertTriangle, Loader2, Save, Send } from 'lucide-react';
import { toast } from 'sonner';

const incidentTypes: { type: IncidentType; label: string; icon: typeof Shield; description: string }[] = [
  { 
    type: 'safeguarding', 
    label: 'Safeguarding', 
    icon: Shield,
    description: 'Child protection concerns, abuse, neglect'
  },
  { 
    type: 'behavioral', 
    label: 'Behavioral', 
    icon: Users,
    description: 'Bullying, fights, disruptive behavior'
  },
  { 
    type: 'health-safety', 
    label: 'Health & Safety', 
    icon: Heart,
    description: 'Injuries, accidents, medical emergencies'
  },
];

const ReportIncident = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '' as IncidentType | '',
    studentName: '',
    location: '',
    incidentDate: '',
    incidentTime: '',
    description: '',
    immediateAction: '',
    isUrgent: false,
  });

  const handleTypeSelect = (type: IncidentType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!user) return;
    
    // Validation
    if (!formData.type) {
      toast.error('Please select an incident type');
      return;
    }
    if (!formData.studentName.trim()) {
      toast.error('Please enter the student name');
      return;
    }
    if (!formData.location) {
      toast.error('Please select a location');
      return;
    }
    if (!formData.incidentDate) {
      toast.error('Please enter the incident date');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please describe the incident');
      return;
    }

    setIsSubmitting(true);

    const incidentId = generateId();
    const now = new Date().toISOString();

    const incident = {
      id: incidentId,
      type: formData.type as IncidentType,
      status: asDraft ? 'draft' as const : 'submitted' as const,
      studentName: formData.studentName.trim(),
      location: formData.location,
      incidentDate: formData.incidentDate,
      incidentTime: formData.incidentTime || '00:00',
      description: formData.description.trim(),
      immediateAction: formData.immediateAction.trim(),
      isUrgent: formData.isUrgent,
      reporterId: user.id,
      reporterName: user.name,
      createdAt: now,
      updatedAt: now,
    };

    saveIncident(incident);
    addAuditEntry({
      incidentId,
      action: asDraft ? 'Created as draft' : 'Submitted for review',
      performedBy: user.id,
      performedByName: user.name,
    });

    toast.success(asDraft ? 'Draft saved' : 'Incident submitted for review');
    navigate('/my-reports');
    setIsSubmitting(false);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report New Incident</h1>
          <p className="text-muted-foreground">
            Document an incident that occurred at the school
          </p>
        </div>

        {/* Incident Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Type</CardTitle>
            <CardDescription>Select the category that best describes the incident</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {incidentTypes.map(({ type, label, icon: Icon, description }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.type === type
                      ? type === 'safeguarding'
                        ? 'border-incident-safeguarding bg-incident-safeguarding-bg'
                        : type === 'behavioral'
                        ? 'border-incident-behavioral bg-incident-behavioral-bg'
                        : 'border-incident-health-safety bg-incident-health-safety-bg'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${
                    type === 'safeguarding' ? 'text-incident-safeguarding' :
                    type === 'behavioral' ? 'text-incident-behavioral' :
                    'text-incident-health-safety'
                  }`} />
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
            <CardDescription>Provide information about what happened</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name *</Label>
                <Input
                  id="studentName"
                  name="studentName"
                  placeholder="Full name of student involved"
                  value={formData.studentName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="incidentDate">Date of Incident *</Label>
                <Input
                  id="incidentDate"
                  name="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incidentTime">Time of Incident</Label>
                <Input
                  id="incidentTime"
                  name="incidentTime"
                  type="time"
                  value={formData.incidentTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description of Incident *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what happened in detail. Include who was involved, what occurred, and any witnesses."
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="immediateAction">Immediate Action Taken</Label>
              <Textarea
                id="immediateAction"
                name="immediateAction"
                placeholder="Describe any immediate actions you took in response to the incident."
                value={formData.immediateAction}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
              <Switch
                id="urgent"
                checked={formData.isUrgent}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUrgent: checked }))}
              />
              <div className="flex-1">
                <Label htmlFor="urgent" className="flex items-center gap-2 cursor-pointer">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Mark as Urgent
                </Label>
                <p className="text-sm text-muted-foreground">
                  Flag this incident for immediate attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {formData.type === 'safeguarding' && (
          <Alert className="border-incident-safeguarding bg-incident-safeguarding-bg">
            <Shield className="h-4 w-4 text-incident-safeguarding" />
            <AlertDescription className="text-foreground">
              <strong>Safeguarding Notice:</strong> This report will be flagged for immediate 
              review by the Designated Safeguarding Lead. If a child is in immediate danger, 
              please also contact emergency services.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="secondary"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit for Review
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportIncident;
