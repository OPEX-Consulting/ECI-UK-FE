import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { ORGS } from '@/mocks/organisations';

type Tab = 'profile' | 'compliance' | 'users' | 'audit';

const complianceFrameworks = [
  { name: 'KCSIE 2024.1', completion: 87, overdue: 2, evidenceGaps: 1, lastActivity: '2025-04-07' },
  { name: 'Ofsted EIF v2.1', completion: 74, overdue: 0, evidenceGaps: 3, lastActivity: '2025-04-05' },
  { name: 'Health & Safety v1.2', completion: 61, overdue: 1, evidenceGaps: 2, lastActivity: '2025-03-20' },
];

const orgUsers = [
  { name: 'Sarah Chen', email: 'sarah@greenfield.sch.uk', role: 'Principal', status: 'Active', lastLogin: '2025-04-07' },
  { name: 'David Okafor', email: 'd.okafor@greenfield.sch.uk', role: 'Officer', status: 'Active', lastLogin: '2025-04-06' },
  { name: 'Emma Walsh', email: 'e.walsh@greenfield.sch.uk', role: 'Staff', status: 'Active', lastLogin: '2025-04-05' },
];

const auditEvents = [
  { label: 'Profile Updated', detail: 'School type updated', user: 'Sarah Chen', date: '4/7/2025, 10:00:00 AM' },
  { label: 'Classification Re-run', detail: 'Added Ofsted EIF framework', user: 'Emmanuel Adedeji', date: '4/5/2025, 2:30:00 PM' },
  { label: 'Onboarding Complete', detail: 'Organisation marked as active', user: 'System', date: '3/20/2025, 9:00:00 AM' },
];

const getTabClass = (active: boolean) => {
  return `py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
    active 
      ? 'border-primary text-primary' 
      : 'border-transparent text-muted-foreground hover:text-foreground'
  }`;
};

const AdminOrgDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');

  const org = ORGS.find((o) => o.id === id) ?? ORGS[0];

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Active':     return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case 'Onboarding': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'Suspended':  return "bg-red-500/10 text-red-500 border-red-500/20";
    }
  };

  const card = (value: string, label: string) => (
    <div className="flex-1 bg-card border border-border rounded-lg p-5 text-center transition-colors duration-300">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm mt-1 text-muted-foreground">{label}</p>
    </div>
  );

  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/organisations')}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{org.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(org.status)}`}>
              {org.status}
            </span>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            {org.schoolType} • {org.region}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all bg-secondary text-secondary-foreground border border-border hover:bg-accent"
        >
          <RefreshCw className="w-4 h-4" /> Re-run Classification
        </button>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-4 mb-6">
        {card(`${org.compliance}%`, 'Compliance')}
        {card(String(org.frameworks), 'Frameworks')}
        {card(String(org.users), 'Users')}
        {card('2025-04-07', 'Last Activity')}
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
        <div className="flex border-b border-border">
          {(['profile', 'compliance', 'users', 'audit'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={getTabClass(tab === t)}>
              {t.charAt(0).toUpperCase() + t.slice(1) === 'Audit' ? 'Audit Log' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Organisation Name', value: org.name },
                { label: 'School Type', value: org.schoolType },
                { label: 'Region', value: org.region },
                { label: 'Status', value: org.status },
                { label: 'Organisation ID', value: org.id },
              ].map((field) => (
                <div key={field.label} className="rounded-lg p-4 bg-muted/30 border border-border/50">
                  <p className="text-xs font-medium mb-1 text-muted-foreground/60">{field.label}</p>
                  <p className="text-sm text-foreground">{field.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Compliance Tab */}
          {tab === 'compliance' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Framework', 'Completion', 'Overdue Tasks', 'Evidence Gaps', 'Last Activity'].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complianceFrameworks.map((fw) => (
                  <tr key={fw.name} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                    <td className="py-3 pr-4 text-foreground font-medium">{fw.name}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${fw.completion}%` }} />
                        </div>
                        <span className="text-muted-foreground">{fw.completion}%</span>
                      </div>
                    </td>
                    <td className={`py-3 pr-4 ${fw.overdue > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>{fw.overdue}</td>
                    <td className={`py-3 pr-4 ${fw.evidenceGaps > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>{fw.evidenceGaps}</td>
                    <td className="py-3 text-muted-foreground">{fw.lastActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orgUsers.map((u) => (
                  <tr key={u.email} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                    <td className="py-3 pr-4 text-foreground font-medium">{u.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{u.role}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{u.lastLogin}</td>
                    <td className="py-3">
                      <button className="text-xs px-2.5 py-1 rounded transition-colors bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Audit Log Tab */}
          {tab === 'audit' && (
            <div className="space-y-4">
              {auditEvents.map((ev, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1.5 w-2 h-2 rounded-full shrink-0 bg-primary" />
                  <div>
                    <p className="text-sm text-foreground font-medium">
                      {ev.label} <span className="text-muted-foreground font-normal">— {ev.detail}</span>
                    </p>
                    <p className="text-xs mt-0.5 text-muted-foreground/60">
                      {ev.user} • {ev.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrgDetail;
