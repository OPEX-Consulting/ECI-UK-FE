import { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Building2,
  Users,
  GraduationCap,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/services/organisation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = "framework" | "organisation" | "user" | "school_type" | string;

const CATEGORIES: string[] = [
  "framework",
  "organisation",
  "user",
  "school_type",
];

const categoryLabel = (cat: string) => {
  switch (cat) {
    case "framework":
      return "Framework";
    case "organisation":
      return "Organisation";
    case "user":
      return "User";
    case "school_type":
      return "School Type";
    default:
      return cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, " ");
  }
};

const categoryBadge = (cat: Category) => {
  switch (cat) {
    case "framework":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "organisation":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "user":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "school_type":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const CategoryIcon = ({ cat }: { cat: Category }) => {
  const s = { width: 16, height: 16 };
  switch (cat) {
    case "framework":
      return <BookOpen style={s} />;
    case "organisation":
      return <Building2 style={s} />;
    case "user":
      return <Users style={s} />;
    case "school_type":
      return <GraduationCap style={s} />;
    default:
      return <FileText style={s} />;
  }
};

const formatAction = (action: string) => {
  return action
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
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

const formatDetails = (
  details: Record<string, any> | null,
  targetName: string | null,
): string => {
  if (targetName) return targetName;
  if (!details) return "";

  // Build a readable detail string from the details object
  const parts: string[] = [];

  // Invited users (array of emails)
  if (details.emails && Array.isArray(details.emails)) {
    parts.push(`Emails: ${details.emails.join(", ")}`);
  }
  // Single email
  if (details.email && typeof details.email === "string") {
    parts.push(details.email);
  }
  // Name field
  if (details.name && typeof details.name === "string") {
    parts.push(details.name);
  }
  // Title / label
  if (details.title && typeof details.title === "string") {
    parts.push(details.title);
  }
  // Role (e.g. "role_compliance_officer" → "Role: Compliance Officer")
  if (details.role && typeof details.role === "string") {
    const roleLabel = details.role
      .replace(/^role_/, "")
      .split("_")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    parts.push(`Role: ${roleLabel}`);
  }
  // Status transition (e.g. {"old_status":"open","new_status":"under-review"})
  if (details.old_status != null && details.new_status != null) {
    const fmt = (s: string) =>
      String(s)
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    parts.push(`${fmt(details.old_status)} → ${fmt(details.new_status)}`);
  } else if (details.status && typeof details.status === "string") {
    const fmt = (s: string) =>
      s.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    parts.push(`Status: ${fmt(details.status)}`);
  }
  // Message preview (e.g. {"message_preview":"Hello"})
  if (details.message_preview && typeof details.message_preview === "string") {
    parts.push(`"${details.message_preview}"`);
  }
  // File uploads (e.g. {"file_name":"report.pdf"})
  if (details.file_name && typeof details.file_name === "string") {
    parts.push(details.file_name);
  }
  if (details.filename && typeof details.filename === "string") {
    parts.push(details.filename);
  }
  // Description / notes
  if (details.description && typeof details.description === "string") {
    parts.push(details.description);
  }
  if (details.notes && typeof details.notes === "string") {
    parts.push(details.notes);
  }
  // Count-based summaries
  if (details.count != null && parts.length === 0) {
    parts.push(`Count: ${details.count}`);
  }

  // Last resort: build a minimal human-readable summary from any remaining
  // primitive values — but never emit raw JSON brackets
  if (parts.length === 0) {
    const readable = Object.entries(details)
      .filter(([, v]) => v != null && typeof v !== "object")
      .map(([k, v]) => {
        const key = k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return `${key}: ${v}`;
      });
    parts.push(...readable);
  }

  // Return empty string for truly empty / meaningless objects (e.g. login {})
  return parts.join(" • ");
};

const AdminAuditLog = () => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const { data: apiLogs, isLoading, isError, error } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => getAuditLogs(0, 100),
  });

  const entries = useMemo(() => {
    if (!apiLogs) return [];

    return apiLogs.map((log) => ({
      id: log.id,
      action: formatAction(log.action),
      category: log.category,
      detail: formatDetails(log.details, log.target_name),
      user: log.actor_name || "Unknown",
      timestamp: formatTimestamp(log.created_at),
    }));
  }, [apiLogs]);

  const filtered = entries.filter((e) => {
    const matchSearch =
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.detail.toLowerCase().includes(search.toLowerCase()) ||
      e.user.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || e.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-serif font-semibold">Audit Log</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Immutable record of all platform actions
        </p>
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
                <SelectItem key={c} value={c}>
                  {categoryLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">
              Loading audit logs...
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-sm font-medium text-foreground">
              Failed to load audit logs
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred."}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="w-8 h-8 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              {entries.length === 0
                ? "No audit log entries yet"
                : "No entries match your search"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
              >
                {/* Icon Avatar */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${categoryBadge(entry.category)}`}
                >
                  <CategoryIcon cat={entry.category} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {entry.action}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium border ${categoryBadge(entry.category)}`}
                    >
                      {categoryLabel(entry.category)}
                    </span>
                  </div>
                  {entry.detail && (
                    <p className="text-sm mt-0.5 text-muted-foreground">
                      {entry.detail}
                    </p>
                  )}
                  <p className="text-xs mt-1 text-muted-foreground/60">
                    {entry.user} • {entry.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLog;
