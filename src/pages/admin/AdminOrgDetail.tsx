import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getOrganisationDetail,
  getAuditLogs,
} from "@/services/organisation";

type Tab = "profile" | "compliance" | "users" | "audit";

// ── Helpers ──────────────────────────────────────────────────────────────────

const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const formatStatus = (s: string) => {
  return s
    .split("_")
    .map(capitalize)
    .join(" ");
};

const formatDate = (dateStr: string | null | undefined) => {
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

const formatTimestamp = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const formatAction = (action: string) => {
  return action
    .split("_")
    .map(capitalize)
    .join(" ");
};

const statusBadge = (status: string) => {
  const s = formatStatus(status);
  switch (s) {
    case "Active":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "Onboarding":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "Suspended":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const userStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "suspended":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "invited":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getTabClass = (active: boolean) => {
  return `py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
    active
      ? "border-primary text-primary"
      : "border-transparent text-muted-foreground hover:text-foreground"
  }`;
};

// ── Placeholder compliance data (API not yet available) ─────────────────────
const complianceFrameworks = [
  {
    name: "KCSIE 2024.1",
    completion: 87,
    overdue: 2,
    evidenceGaps: 1,
    lastActivity: "2025-04-07",
  },
  {
    name: "Ofsted EIF v2.1",
    completion: 74,
    overdue: 0,
    evidenceGaps: 3,
    lastActivity: "2025-04-05",
  },
  {
    name: "Health & Safety v1.2",
    completion: 61,
    overdue: 1,
    evidenceGaps: 2,
    lastActivity: "2025-03-20",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

const AdminOrgDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");

  // Fetch organisation detail
  const {
    data: org,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["org-detail", id],
    queryFn: () => getOrganisationDetail(id!),
    enabled: !!id,
  });

  // Fetch audit logs for this organisation
  const { data: auditLogs } = useQuery({
    queryKey: ["audit-logs", "org", id],
    queryFn: () => getAuditLogs(0, 50),
    enabled: !!id && tab === "audit",
  });

  // Filter audit logs for this org
  const orgAuditLogs = useMemo(() => {
    if (!auditLogs || !id) return [];
    return auditLogs.filter((log) => log.organisation_id === id);
  }, [auditLogs, id]);

  const card = (value: string, label: string) => (
    <div className="flex-1 bg-card border border-border rounded-lg p-5 text-center transition-colors duration-300">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm mt-1 text-muted-foreground">{label}</p>
    </div>
  );

  // ── Loading / Error states ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-7 min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">
          Loading organisation details...
        </p>
      </div>
    );
  }

  if (isError || !org) {
    return (
      <div className="p-7 min-h-screen flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-sm font-medium text-foreground">
          Failed to load organisation
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
        </p>
        <button
          onClick={() => navigate("/admin/organisations")}
          className="mt-4 flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Organisations
        </button>
      </div>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────
  const displayStatus = formatStatus(org.status);
  const schoolType = org.type
    ? org.type
        .split("_")
        .map(capitalize)
        .join(" ")
    : "N/A";
  const region = org.school?.region_or_local_authority || "N/A";

  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300">
      {/* Back */}
      <button
        onClick={() => navigate("/admin/organisations")}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{org.name}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(org.status)}`}
            >
              {displayStatus}
            </span>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            {schoolType} • {region}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all bg-secondary text-secondary-foreground border border-border hover:bg-accent">
          <RefreshCw className="w-4 h-4" /> Re-run Classification
        </button>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-4 mb-6">
        {card(`${org.framework_count}`, "Frameworks")}
        {card(`${org.user_count}`, "Users")}
        {card(formatDate(org.last_activity), "Last Activity")}
        {card(formatDate(org.created_at), "Created")}
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
        <div className="flex border-b border-border">
          {(["profile", "compliance", "users", "audit"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={getTabClass(tab === t)}
            >
              {t === "audit" ? "Audit Log" : capitalize(t)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Profile Tab ── */}
          {tab === "profile" && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Organisation Name", value: org.name },
                { label: "School Type", value: schoolType },
                { label: "Region / Local Authority", value: region },
                { label: "Status", value: displayStatus },
                { label: "Organisation ID", value: org.id },
                { label: "Slug", value: org.slug },
                {
                  label: "Country",
                  value: org.school?.country || "N/A",
                },
                {
                  label: "Official Domain",
                  value: org.school?.official_domain || "N/A",
                },
                {
                  label: "Funding / Governance",
                  value: org.school?.funding_governance || "N/A",
                },
                {
                  label: "Age Ranges",
                  value:
                    org.school?.age_ranges?.join(", ") || "N/A",
                },
                {
                  label: "Special Provisions",
                  value:
                    org.school?.special_provisions?.join(", ") || "None",
                },
                {
                  label: "Operational Activities",
                  value:
                    org.school?.operational_activities?.join(", ") || "None",
                },
              ].map((field) => (
                <div
                  key={field.label}
                  className="rounded-lg p-4 bg-muted/30 border border-border/50"
                >
                  <p className="text-xs font-medium mb-1 text-muted-foreground/60">
                    {field.label}
                  </p>
                  <p className="text-sm text-foreground">{field.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Compliance Tab (placeholder — API not available yet) ── */}
          {tab === "compliance" && (
            <div>
              <p className="text-xs text-muted-foreground mb-4 italic">
                Compliance data will be updated when the API becomes available.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "Framework",
                      "Completion",
                      "Overdue Tasks",
                      "Evidence Gaps",
                      "Last Activity",
                    ].map((h) => (
                      <th
                        key={h}
                        className="pb-3 text-left text-xs font-semibold text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {complianceFrameworks.map((fw) => (
                    <tr
                      key={fw.name}
                      className="border-b border-border/50 transition-colors hover:bg-muted/10"
                    >
                      <td className="py-3 pr-4 text-foreground font-medium">
                        {fw.name}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${fw.completion}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground">
                            {fw.completion}%
                          </span>
                        </div>
                      </td>
                      <td
                        className={`py-3 pr-4 ${fw.overdue > 0 ? "text-red-500" : "text-muted-foreground"}`}
                      >
                        {fw.overdue}
                      </td>
                      <td
                        className={`py-3 pr-4 ${fw.evidenceGaps > 0 ? "text-amber-500" : "text-muted-foreground"}`}
                      >
                        {fw.evidenceGaps}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {fw.lastActivity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Users Tab ── */}
          {tab === "users" && (
            <>
              {org.users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No users found for this organisation
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Name", "Email", "Role", "Status", "Last Login"].map(
                        (h) => (
                          <th
                            key={h}
                            className="pb-3 text-left text-xs font-semibold text-muted-foreground"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {org.users.map((u, i) => (
                      <tr
                        key={u.id || i}
                        className="border-b border-border/50 transition-colors hover:bg-muted/10"
                      >
                        <td className="py-3 pr-4 text-foreground font-medium">
                          {u.name || "N/A"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {u.email || "N/A"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {u.role
                            ? u.role
                                .split("_")
                                .map(capitalize)
                                .join(" ")
                            : "N/A"}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${userStatusBadge(u.status || "")}`}
                          >
                            {u.status ? capitalize(u.status) : "N/A"}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {formatDate(u.last_login)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* ── Audit Log Tab ── */}
          {tab === "audit" && (
            <>
              {orgAuditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No audit log entries for this organisation
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orgAuditLogs.map((ev) => (
                    <div key={ev.id} className="flex gap-4">
                      <div className="mt-1.5 w-2 h-2 rounded-full shrink-0 bg-primary" />
                      <div>
                        <p className="text-sm text-foreground font-medium">
                          {formatAction(ev.action)}{" "}
                          <span className="text-muted-foreground font-normal">
                            — {ev.target_name || ""}
                            {ev.details
                              ? Object.entries(ev.details)
                                  .filter(([k]) => k !== "emails")
                                  .map(([, v]) => String(v))
                                  .join(", ")
                              : ""}
                          </span>
                        </p>
                        <p className="text-xs mt-0.5 text-muted-foreground/60">
                          {ev.actor_name} • {formatTimestamp(ev.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrgDetail;
