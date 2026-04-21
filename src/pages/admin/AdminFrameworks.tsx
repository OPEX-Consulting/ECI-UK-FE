import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
type FrameworkStatus = 'Published' | 'In Review' | 'Draft' | 'Deprecated';

interface Framework {
  id: string;
  name: string;
  version: string;
  status: FrameworkStatus;
  regulator: string;
  orgsUsing: number;
  lastUpdated: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const FRAMEWORKS: Framework[] = [
  { id: 'fw-1', name: 'Keeping Children Safe in Education (KCSIE)', version: 'v2024.1', status: 'Published', regulator: 'DfE', orgsUsing: 247, lastUpdated: '2024-12-15' },
  { id: 'fw-2', name: 'ISI Regulatory Compliance', version: 'v3.0', status: 'Published', regulator: 'ISI', orgsUsing: 38, lastUpdated: '2024-11-20' },
  { id: 'fw-3', name: 'Ofsted EIF Framework', version: 'v2.1', status: 'Published', regulator: 'Ofsted', orgsUsing: 198, lastUpdated: '2024-10-05' },
  { id: 'fw-4', name: 'Early Years Foundation Stage (EYFS)', version: 'v1.0', status: 'In Review', regulator: 'DfE', orgsUsing: 0, lastUpdated: '2025-03-28' },
  { id: 'fw-5', name: 'Health & Safety Compliance Framework', version: 'v1.2', status: 'Draft', regulator: 'HSE', orgsUsing: 0, lastUpdated: '2025-04-01' },
  { id: 'fw-6', name: 'Data Protection in Schools', version: 'v1.0', status: 'Deprecated', regulator: 'ICO', orgsUsing: 15, lastUpdated: '2024-06-10' },
  { id: 'fw-7', name: 'Prevent Duty Guidance', version: 'v2.0', status: 'Draft', regulator: 'Home Office', orgsUsing: 0, lastUpdated: '2025-04-05' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusBadge = (status: FrameworkStatus) => {
  switch (status) {
    case 'Published': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case 'In Review': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case 'Draft':     return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    case 'Deprecated': return "bg-red-500/10 text-red-500 border-red-500/20";
  }
};

const ALL_STATUSES: FrameworkStatus[] = ['Published', 'In Review', 'Draft', 'Deprecated'];

// ─── Component ────────────────────────────────────────────────────────────────
const AdminFrameworks = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = FRAMEWORKS.filter((fw) => {
    const matchesSearch = fw.name.toLowerCase().includes(search.toLowerCase()) ||
      fw.regulator.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fw.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Framework Library</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Manage compliance frameworks across the platform
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/frameworks/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-opacity bg-primary text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          New Framework
        </button>
      </div>

      {/* Panel */}
      <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search frameworks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md text-sm outline-none bg-background border border-border text-foreground"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9 text-sm outline-none bg-background border border-border text-foreground">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border text-popover-foreground">
              <SelectItem value="all">All Statuses</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Framework Name', 'Version', 'Status', 'Regulator', 'Orgs Using', 'Last Updated', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((fw) => (
              <tr
                key={fw.id}
                className="transition-colors border-b border-border/50 hover:bg-muted/50"
              >
                <td className="px-5 py-4 font-medium text-foreground">{fw.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{fw.version}</td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(fw.status)}`}
                  >
                    {fw.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{fw.regulator}</td>
                <td className="px-5 py-4 text-right text-muted-foreground">{fw.orgsUsing}</td>
                <td className="px-5 py-4 text-muted-foreground">{fw.lastUpdated}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button className="transition-colors text-muted-foreground hover:text-foreground">
                      <Eye className="w-4 h-4" />
                    </button>
                    {fw.status !== 'Published' && (
                      <button className="transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFrameworks;
