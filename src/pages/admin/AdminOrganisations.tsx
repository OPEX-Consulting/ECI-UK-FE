import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Search, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getOrganisations } from "@/services/organisation";
import {
  Organisation,
  OrgStatus,
} from "@/types/organisation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORGS as MOCK_ORGS } from "@/mocks/organisations";

// ─── UI Helpers ───────────────────────────────────────────────────────────────

const statusBadge = (status: OrgStatus) => {
  switch (status) {
    case "Active":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "Onboarding":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "Suspended":
      return "bg-red-500/10 text-red-500 border-red-500/20";
  }
};

const ComplianceBar = ({ value }: { value: number }) => (
  <div className="flex items-center gap-2">
    <div className="w-20 h-1.5 rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          background:
            value >= 70
              ? "hsl(var(--primary))"
              : value >= 30
                ? "#f59e0b"
                : "hsl(var(--muted-foreground)/0.4)",
        }}
      />
    </div>
    <span className="text-xs text-muted-foreground">{value}%</span>
  </div>
);

const ORG_TYPES = [
  "Academy (Single)",
  "Faith School",
  "Free School",
  "Independent",
  "Academy (MAT)",
  "Special School",
  "State-funded (Maintained)",
];

const AdminOrganisations = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: apiOrgs, isLoading, isError, error } = useQuery({
    queryKey: ["organisations"],
    queryFn: () => getOrganisations(0, 100),
  });

  const organisations = useMemo(() => {
    if (!apiOrgs) return [];
    
    // Map API data to UI model
    return apiOrgs.map(apiOrg => {
      // Normalize status: e.g., "active" -> "Active"
      const status = (apiOrg.status.charAt(0).toUpperCase() + apiOrg.status.slice(1)) as OrgStatus;
      
      return {
        id: apiOrg.id,
        name: apiOrg.name,
        schoolType: apiOrg.type,
        status,
        region: apiOrg.metadata?.region || "N/A",
        compliance: apiOrg.metadata?.compliance_score || 0,
        frameworks: apiOrg.assigned_frameworks?.length || 0,
        users: apiOrg.metadata?.total_users || 0,
      };
    });
  }, [apiOrgs]);

  const filtered = organisations.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.region.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchType = typeFilter === "all" || o.schoolType === typeFilter;
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
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-b-[10px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Fetching organisations...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-b-[10px] text-center px-4">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-sm font-medium text-foreground">Failed to load organisations</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {error instanceof Error ? error.message : "An unexpected error occurred while fetching the organisation list."}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-b-[10px]">
            <Search className="w-8 h-8 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No organisations found matching your criteria</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  "Organisation",
                  "School Type",
                  "Status",
                  "Region",
                  "Compliance",
                  "Frameworks",
                  // "Users",
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
              {filtered.map((org) => (
                <tr
                  key={org.id}
                  className="transition-colors border-b border-border/50 hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/admin/organisations/${org.id}`)}
                >
                  <td className="px-5 py-4 font-medium text-foreground">
                    {org.name}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {org.schoolType}
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(org.status)}`}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {org.region}
                  </td>
                  <td className="px-5 py-4">
                    <ComplianceBar value={org.compliance} />
                  </td>
                  <td className="px-5 py-4 text-center text-muted-foreground">
                    {org.frameworks}
                  </td>
                  {/* <td className="px-5 py-4 text-center text-muted-foreground">
                    {org.users}
                  </td> */}
                  <td className="px-5 py-4">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrganisations;