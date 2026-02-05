import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getIncidents } from '@/lib/storage';
import { Incident, IncidentType, IncidentStatus } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { IncidentTypeBadge } from '@/components/incidents/IncidentTypeBadge';
import { SeverityBadge } from '@/components/incidents/SeverityBadge';
import { FileText, Search, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const AllIncidents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setIncidents(getIncidents());
  }, []);

  const filteredIncidents = incidents
    .filter(incident => {
      const matchesSearch = 
        incident.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.reporterName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || incident.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
      
      // For officers and principals, hide drafts
      const hideDrafts = user?.role !== 'staff' ? incident.status !== 'draft' : true;
      
      return matchesSearch && matchesType && matchesStatus && hideDrafts;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getDetailPath = (incident: Incident) => {
    if (user?.role === 'officer' && incident.status !== 'finalized') {
      return `/review/${incident.id}`;
    }
    return `/incident/${incident.id}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Incidents</h1>
          <p className="text-muted-foreground text-sm">
            View and manage all incident reports
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, reporter, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="safeguarding">Safeguarding</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="health-safety">Health & Safety</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="info-requested">Info Requested</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents</CardTitle>
            <CardDescription>
              {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No incidents found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.map(incident => (
                  <div
                    key={incident.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors gap-4 ${
                      incident.isUrgent && incident.status !== 'finalized' 
                        ? 'border-destructive bg-destructive/5' 
                        : 'border-border'
                    }`}
                    onClick={() => navigate(getDetailPath(incident))}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <IncidentTypeBadge type={incident.type} />
                        <StatusBadge status={incident.status} />
                        {incident.officerReview?.severity && (
                          <SeverityBadge severity={incident.officerReview.severity} />
                        )}
                        {incident.isUrgent && incident.status !== 'finalized' && (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <p className="font-medium">{incident.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        Reported by {incident.reporterName} • {format(new Date(incident.incidentDate), 'PPP')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {incident.location}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
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

export default AllIncidents;
