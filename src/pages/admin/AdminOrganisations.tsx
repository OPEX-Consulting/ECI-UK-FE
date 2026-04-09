import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
type OrgStatus = 'Active' | 'Onboarding' | 'Suspended';

interface Organisation {
  id: string;
  name: string;
  schoolType: string;
  status: OrgStatus;
  region: string;
  compliance: number;
  frameworks: number;
  users: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ORGS: Organisation[] = [
  { id: 'org-1', name: 'Greenfield Academy', schoolType: 'Academy (Single)', status: 'Active', region: 'London', compliance: 87, frameworks: 3, users: 12 },
  { id: 'org-2', name: "St. Mary's Primary School", schoolType: 'Faith School', status: 'Active', region: 'South East', compliance: 92, frameworks: 4, users: 8 },
  { id: 'org-3', name: 'Riverside Free School', schoolType: 'Free School', status: 'Onboarding', region: 'North West', compliance: 34, frameworks: 2, users: 3 },
  { id: 'org-4', name: 'Oakwood Independent', schoolType: 'Independent', status: 'Active', region: 'London', compliance: 78, frameworks: 5, users: 15 },
  { id: 'org-5', name: 'Thornton MAT', schoolType: 'Academy (MAT)', status: 'Active', region: 'Yorkshire', compliance: 81, frameworks: 3, users: 42 },
  { id: 'org-6', name: 'Elmhurst Special School', schoolType: 'Special School', status: 'Active', region: 'West Midlands', compliance: 69, frameworks: 4, users: 6 },
  { id: 'org-7', name: 'Birchwood Community School', schoolType: 'State-funded (Maintained)', status: 'Suspended', region: 'East Midlands', compliance: 23, frameworks: 2, users: 9 },
  { id: 'org-8', name: 'Highgate Prep', schoolType: 'Independent', status: 'Onboarding', region: 'London', compliance: 0, frameworks: 0, users: 2 },
];

const statusBadge = (status: OrgStatus) => {
  switch (status) {
    case 'Active':     return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case 'Onboarding': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case 'Suspended':  return "bg-red-500/10 text-red-500 border-red-500/20";
  }
};

const ComplianceBar = ({ value }: { value: number }) => (
  <div className="flex items-center gap-2">
    <div className="w-20 h-1.5 rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          background: value >= 70 ? 'hsl(var(--primary))' : value >= 30 ? '#f59e0b' : 'hsl(var(--muted-foreground)/0.4)',
        }}
      />
    </div>
    <span className="text-xs text-muted-foreground">{value}%</span>
  </div>
);

const ORG_TYPES = ['Academy (Single)', 'Faith School', 'Free School', 'Independent', 'Academy (MAT)', 'Special School', 'State-funded (Maintained)'];

const AdminOrganisations = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = ORGS.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.region.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchType = typeFilter === 'all' || o.schoolType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Organisations</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Manage all schools on the ECI platform
        </p>
      </div>

      <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search organisations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md text-sm outline-none bg-background border border-border text-foreground"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-sm outline-none bg-background border border-border text-foreground">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border text-popover-foreground">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Onboarding">Onboarding</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] h-9 text-sm outline-none bg-background border border-border text-foreground">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border text-popover-foreground">
              <SelectItem value="all">All Types</SelectItem>
              {ORG_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Organisation', 'School Type', 'Status', 'Region', 'Compliance', 'Frameworks', 'Users', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((org) => (
              <tr
                key={org.id}
                className="transition-colors border-b border-border/50 hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/admin/organisations/${org.id}`)}
              >
                <td className="px-5 py-4 font-medium text-foreground">{org.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{org.schoolType}</td>
                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(org.status)}`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{org.region}</td>
                <td className="px-5 py-4"><ComplianceBar value={org.compliance} /></td>
                <td className="px-5 py-4 text-center text-muted-foreground">{org.frameworks}</td>
                <td className="px-5 py-4 text-center text-muted-foreground">{org.users}</td>
                <td className="px-5 py-4">
                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { ORGS };
export default AdminOrganisations;
