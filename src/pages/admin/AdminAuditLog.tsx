import { useState } from 'react';
import { Search, BookOpen, Building2, Users, GraduationCap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = 'framework' | 'organisation' | 'admin user' | 'school type';

interface AuditEntry {
  id: string;
  action: string;
  category: Category;
  detail: string;
  user: string;
  timestamp: string;
}

const ENTRIES: AuditEntry[] = [
  { id: 'a-1', action: 'Framework Published', category: 'framework', detail: 'KCSIE 2024.1 published to Framework Content DB', user: 'Emmanuel Adedeji', timestamp: '4/8/2025, 9:45:00 AM' },
  { id: 'a-2', action: 'Profile Updated', category: 'organisation', detail: "Greenfield Academy — school type changed from Free School to Academy (Single)", user: 'Sarah Chen', timestamp: '4/7/2025, 4:30:00 PM' },
  { id: 'a-3', action: 'Draft Submitted', category: 'framework', detail: 'EYFS v1.0 submitted for Platform Admin review', user: 'James Whitfield', timestamp: '4/7/2025, 2:20:00 PM' },
  { id: 'a-4', action: 'User Invited', category: 'admin user', detail: 'Invited newexpert@edu.uk as Content Contributor', user: 'Emmanuel Adedeji', timestamp: '4/7/2025, 11:00:00 AM' },
  { id: 'a-5', action: 'Draft Edited', category: 'framework', detail: 'H&S Compliance Framework — added 3 new action items to Theme 2', user: 'Dr. Priya Patel', timestamp: '4/6/2025, 10:00:00 AM' },
  { id: 'a-6', action: 'School Type Created', category: 'school type', detail: 'Grammar School added as new school type (inactive)', user: 'Emmanuel Adedeji', timestamp: '4/5/2025, 3:30:00 PM' },
  { id: 'a-7', action: 'Classification Re-run', category: 'organisation', detail: 'Thornton MAT — re-classified. Added: Ofsted EIF. Removed: none.', user: 'Sarah Chen', timestamp: '4/5/2025, 9:00:00 AM' },
  { id: 'a-8', action: 'User Suspended', category: 'admin user', detail: 'Michael Torres — account suspended by Platform Admin', user: 'Emmanuel Adedeji', timestamp: '4/4/2025, 2:00:00 PM' },
  { id: 'a-9', action: 'Framework Deprecated', category: 'framework', detail: 'Data Protection in Schools v1.0 — marked as deprecated', user: 'Emmanuel Adedeji', timestamp: '4/3/2025, 11:30:00 AM' },
];

const CATEGORIES: Category[] = ['framework', 'organisation', 'admin user', 'school type'];

const categoryBadge = (cat: Category) => {
  switch (cat) {
    case 'framework':    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case 'organisation': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case 'admin user':   return "bg-red-500/10 text-red-500 border-red-500/20";
    case 'school type':  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }
};

const CategoryIcon = ({ cat }: { cat: Category }) => {
  const s = { width: 16, height: 16 };
  switch (cat) {
    case 'framework':    return <BookOpen style={s} />;
    case 'organisation': return <Building2 style={s} />;
    case 'admin user':   return <Users style={s} />;
    case 'school type':  return <GraduationCap style={s} />;
  }
};

const AdminAuditLog = () => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = ENTRIES.filter((e) => {
    const matchSearch =
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.detail.toLowerCase().includes(search.toLowerCase()) ||
      e.user.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || e.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm mt-1 text-muted-foreground">Immutable record of all platform actions</p>
      </div>

      {/* Panel */}
      <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search audit log..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md text-sm outline-none bg-background border border-border text-foreground transition-colors focus-within:border-primary"
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[180px] h-9 text-sm outline-none bg-background border border-border text-foreground">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border text-popover-foreground">
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Feed */}
        <div className="divide-y divide-border/50">
          {filtered.map((entry) => (
            <div key={entry.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/50">
              {/* Icon Avatar */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${categoryBadge(entry.category)}`}
              >
                <CategoryIcon cat={entry.category} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{entry.action}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${categoryBadge(entry.category)}`}
                  >
                    {entry.category}
                  </span>
                </div>
                <p className="text-sm mt-0.5 text-muted-foreground">{entry.detail}</p>
                <p className="text-xs mt-1 text-muted-foreground/60">
                  {entry.user} • {entry.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLog;
