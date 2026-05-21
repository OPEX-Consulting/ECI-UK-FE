import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Search, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFrameworkDrafts } from '@/services/frameworkService';
import type { ApiFrameworkDraft } from '@/types/framework';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mapDraftStatus = (status: ApiFrameworkDraft['status']): FrameworkStatus => {
  switch (status) {
    case 'published':        return 'Published';
    case 'ready_for_review': return 'In Review';
    case 'error':            return 'Deprecated';
    default:                 return 'Draft';
  }
};

const getDraftFrameworkName = (draft: ApiFrameworkDraft): string => {
  const inferredName = draft.raw_ai_output?.framework_name;
  if (typeof inferredName === 'string' && inferredName.trim().length > 0) {
    return inferredName.trim();
  }
  return `Draft (${draft.id.slice(0, 8)}…)`;
};

const mapDraftToRow = (d: ApiFrameworkDraft): Framework => ({
  id: d.id,
  name: d.structured_content?.title ?? getDraftFrameworkName(d),
  version: d.structured_content?.version ?? '—',
  status: mapDraftStatus(d.status),
  regulator: '—',
  orgsUsing: 0,
  lastUpdated: new Date(d.updated_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }),
});

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
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getFrameworkDrafts()
      .then((drafts) => setFrameworks(drafts.map(mapDraftToRow)))
      .catch(() => setLoadError('Failed to load frameworks. Please refresh.'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = frameworks.filter((fw) => {
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
          <h1 className="text-xl font-semibold font-serif">Framework Library</h1>
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
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading frameworks…
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-red-500 text-sm">
                  {loadError}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                  No frameworks found.
                </td>
              </tr>
            ) : (
              filtered.map((fw) => (
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
                    <button
                      onClick={() => navigate(`/admin/frameworks/${fw.id}`)}
                      className="transition-colors text-muted-foreground hover:text-foreground"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {fw.status !== 'Published' && (
                      <button
                        onClick={() => navigate(`/admin/frameworks/${fw.id}/edit`)}
                        className="transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFrameworks;
