import { useState } from 'react';
import { Plus, MoreHorizontal, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = 'Platform Admin' | 'Content Contributor';
type UserStatus = 'Active' | 'Suspended' | 'Invited';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

const ADMIN_USERS: AdminUser[] = [
  { id: 'u-1', name: 'Emmanuel Adedeji', email: 'emmanuel@regtech365.com', role: 'Platform Admin', status: 'Active', lastLogin: '4/8/2025' },
  { id: 'u-2', name: 'Sarah Chen', email: 'sarah@regtech365.com', role: 'Platform Admin', status: 'Active', lastLogin: '4/7/2025' },
  { id: 'u-3', name: 'James Whitfield', email: 'james.expert@edu-compliance.co.uk', role: 'Content Contributor', status: 'Active', lastLogin: '4/6/2025' },
  { id: 'u-4', name: 'Dr. Priya Patel', email: 'dr.patel@safeguarding.org', role: 'Content Contributor', status: 'Active', lastLogin: '4/5/2025' },
  { id: 'u-5', name: 'Michael Torres', email: 'mike@regtech365.com', role: 'Platform Admin', status: 'Suspended', lastLogin: '2/20/2025' },
  { id: 'u-6', name: 'Pending Invite', email: 'newexpert@edu.uk', role: 'Content Contributor', status: 'Invited', lastLogin: 'Never' },
];

const initials = (name: string) =>
  name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

const avatarColor = (name: string) => {
  const colors = [
    "bg-blue-500/10 text-blue-500",
    "bg-emerald-500/10 text-emerald-500",
    "bg-amber-500/10 text-amber-500",
    "bg-purple-500/10 text-purple-500",
    "bg-red-500/10 text-red-500",
  ];
  const i = name.charCodeAt(0) % colors.length;
  return colors[i];
};

const roleBadge = (role: UserRole) => {
  return "bg-blue-500/10 text-blue-500 border-blue-500/20";
};

const statusBadge = (status: UserStatus) => {
  switch (status) {
    case 'Active':    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case 'Suspended': return "bg-red-500/10 text-red-500 border-red-500/20";
    case 'Invited':   return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }
};

const AdminUsers = () => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Platform Admin');

  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Users</h1>
          <p className="text-sm mt-1 text-muted-foreground">Manage admin portal user accounts and roles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-opacity bg-primary text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ADMIN_USERS.map((u) => (
              <tr
                key={u.id}
                className="transition-colors border-b border-border/50 hover:bg-muted/50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(u.name)}`}
                    >
                      {initials(u.name)}
                    </div>
                    <span className="font-medium text-foreground">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleBadge(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(u.status)}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{u.lastLogin}</td>
                <td className="px-5 py-4">
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl p-6 shadow-2xl bg-card border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">Invite Admin User</h2>
                <p className="text-xs mt-0.5 text-muted-foreground">They'll receive a link valid for 48 hours</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="colleague@organisation.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md text-sm outline-none bg-background border border-border text-foreground transition-colors focus-within:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className="w-full h-10 text-sm outline-none bg-background border border-border text-foreground">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-popover-foreground">
                    <SelectItem value="Platform Admin">Platform Admin</SelectItem>
                    <SelectItem value="Content Contributor">Content Contributor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground/60">
                The invite link will expire after 48 hours.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-md text-sm font-semibold transition-opacity bg-primary text-primary-foreground hover:opacity-90"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
