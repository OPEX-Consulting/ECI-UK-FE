import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getIncidentsByReporter } from '@/lib/storage';
import { Incident, IncidentStatus } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { IncidentTypeBadge } from '@/components/incidents/IncidentTypeBadge';
import { FileText, Plus, Search, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const MyReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      const userIncidents = getIncidentsByReporter(user.id);
      setIncidents(userIncidents);
    }
  }, [user]);

  const filteredIncidents = incidents
    .filter(incident => {
      const matchesSearch = 
        incident.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif text-foreground">My Reports</h1>
            <p className="text-muted-foreground text-sm">
              View and manage your incident reports
            </p>
          </div>
          <Button onClick={() => navigate('/report')}>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, location, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="info-requested">Info Requested</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Incident Reports</CardTitle>
            <CardDescription>
              {filteredIncidents.length} report{filteredIncidents.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No reports found</p>
                <p className="text-sm">
                  {incidents.length === 0 
                    ? "You haven't submitted any reports yet" 
                    : "Try adjusting your filters"}
                </p>
                {incidents.length === 0 && (
                  <Button variant="link" onClick={() => navigate('/report')}>
                    Report your first incident
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.map(incident => (
                  <div
                    key={incident.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors gap-4 ${
                      incident.status === 'info-requested' 
                        ? 'border-status-info-requested bg-status-info-requested/5' 
                        : 'border-border'
                    }`}
                    onClick={() => navigate(`/incident/${incident.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <IncidentTypeBadge type={incident.type} />
                        <StatusBadge status={incident.status} />
                        {incident.isUrgent && (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <p className="font-medium">{incident.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {incident.location} • {format(new Date(incident.incidentDate), 'PPP')}
                      </p>
                      {incident.status === 'info-requested' && incident.officerReview?.infoRequestMessage && (
                        <p className="text-sm text-status-info-requested mt-2">
                          <strong>Action Required:</strong> {incident.officerReview.infoRequestMessage}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant={incident.status === 'info-requested' ? 'default' : 'outline'} 
                      size="sm"
                    >
                      {incident.status === 'info-requested' ? 'Respond' : 'View'}
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

export default MyReports;
