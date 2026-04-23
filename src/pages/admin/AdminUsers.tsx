import { useState, useMemo } from "react";
import {
  Plus,
  MoreHorizontal,
  X,
  Loader2,
  AlertCircle,
  Ban,
  ShieldCheck,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, suspendAdminUser, unsuspendAdminUser } from "@/services/organisation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = "Platform Admin" | string;
type UserStatus = "Active" | "Suspended" | "Invited" | string;

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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

const roleBadge = (_role: UserRole) => {
  return "bg-blue-500/10 text-blue-500 border-blue-500/20";
};

const statusBadge = (status: UserStatus) => {
  const s = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  switch (s) {
    case "Active":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "Suspended":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "Invited":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatRole = (role: string) => {
  return role.split("_").map(capitalize).join(" ");
};

const AdminUsers = () => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Platform Admin");

  // Suspend / Unsuspend confirmation state
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState<AdminUser | null>(null);

  const queryClient = useQueryClient();

  const {
    data: apiUsers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => suspendAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSuspendTarget(null);
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: (userId: string) => unsuspendAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setUnsuspendTarget(null);
    },
  });

  const users = useMemo(() => {
    if (!apiUsers) return [];

    return apiUsers.map(
      (u): AdminUser => ({
        id: u.id,
        name: u.name || "User",
        email: u.email,
        role: formatRole(u.role),
        status: capitalize(u.status),
        lastLogin: formatDate(u.last_login),
      }),
    );
  }, [apiUsers]);

  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-serif font-semibold">Admin Users</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Manage admin portal user accounts and roles
          </p>
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">
              Fetching admin users...
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-sm font-medium text-foreground">
              Failed to load admin users
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred."}
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Plus className="w-8 h-8 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              No admin users found
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  "Name",
                  "Email",
                  "Role",
                  "Status",
                  "Last Login",
                  "Actions",
                ].map((h) => (
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
              {users.map((u) => (
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
                      <span className="font-medium text-foreground">
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleBadge(u.role)}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(u.status)}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {u.lastLogin}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {u.status === "Suspended" ? (
                        <button
                          onClick={() => setUnsuspendTarget(u)}
                          title="Unsuspend user"
                          className="text-muted-foreground hover:text-emerald-500 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setSuspendTarget(u)}
                          title="Suspend user"
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Suspend Confirmation Modal ── */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-xl p-6 shadow-2xl bg-card border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <Ban className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold">Suspend User</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Are you sure you want to suspend{" "}
                <span className="font-medium text-foreground">
                  {suspendTarget.name}
                </span>
                ? They will lose access to the admin portal immediately.
              </p>

              {suspendMutation.isError && (
                <div className="mt-3 w-full px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                  {suspendMutation.error instanceof Error
                    ? suspendMutation.error.message
                    : "Failed to suspend user. Please try again."}
                </div>
              )}

              <div className="flex items-center gap-3 mt-6 w-full">
                <button
                  onClick={() => {
                    setSuspendTarget(null);
                    suspendMutation.reset();
                  }}
                  disabled={suspendMutation.isPending}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => suspendMutation.mutate(suspendTarget.id)}
                  disabled={suspendMutation.isPending}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {suspendMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Suspending…
                    </>
                  ) : (
                    "Suspend"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Unsuspend Confirmation Modal ── */}
      {unsuspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-xl p-6 shadow-2xl bg-card border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold">Unsuspend User</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Are you sure you want to unsuspend{" "}
                <span className="font-medium text-foreground">
                  {unsuspendTarget.name}
                </span>
                ? They will regain access to the admin portal.
              </p>

              {unsuspendMutation.isError && (
                <div className="mt-3 w-full px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                  {unsuspendMutation.error instanceof Error
                    ? unsuspendMutation.error.message
                    : "Failed to unsuspend user. Please try again."}
                </div>
              )}

              <div className="flex items-center gap-3 mt-6 w-full">
                <button
                  onClick={() => {
                    setUnsuspendTarget(null);
                    unsuspendMutation.reset();
                  }}
                  disabled={unsuspendMutation.isPending}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => unsuspendMutation.mutate(unsuspendTarget.id)}
                  disabled={unsuspendMutation.isPending}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {unsuspendMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Restoring…
                    </>
                  ) : (
                    "Unsuspend"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl p-6 shadow-2xl bg-card border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">Invite Admin User</h2>
                <p className="text-xs mt-0.5 text-muted-foreground">
                  They'll receive a link valid for 48 hours
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email Address
                </label>
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
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as UserRole)}
                >
                  <SelectTrigger className="w-full h-10 text-sm outline-none bg-background border border-border text-foreground">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-popover-foreground">
                    <SelectItem value="Platform Admin">
                      Platform Admin
                    </SelectItem>
                    <SelectItem value="Content Contributor">
                      Content Contributor
                    </SelectItem>
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
