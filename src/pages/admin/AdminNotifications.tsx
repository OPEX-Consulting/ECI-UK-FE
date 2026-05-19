import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Search,
  Filter,
  Eye,
  Loader2,
  Sparkles,
  Clipboard,
  Check,
  RefreshCw,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import {
  getNotifications,
  clearAllNotifications,
  getNotificationDetail,
  deleteNotification,
} from "@/services/admin/notificationService";
import type { ApiNotification, NotificationType } from "@/types/notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Custom date formatter helper
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
};

// Rich mock data to populate if the database is empty or connection is offline
const DEFAULT_MOCK_NOTIFICATIONS: ApiNotification[] = [
  {
    id: "notif-1",
    title: "New Obligation Synthesis Required",
    message: "A new framework 'UK DfE Keeping Children Safe in Education 2026' was uploaded. 14 critical obligations have been identified and require AI synthesis.",
    type: "warning",
    read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    meta_data: {
      framework_id: "fw-9932-a",
      framework_title: "UK DfE Keeping Children Safe in Education 2026",
      extracted_obligations_count: 14,
      uploaded_by: "platform_admin",
      urgency: "high"
    }
  },
  {
    id: "notif-2",
    title: "System Audit Log Export Successful",
    message: "The full system audit logs for Q1 2026 have been generated and successfully exported to compliance-vault-s3.",
    type: "success",
    read: false,
    created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    meta_data: {
      export_id: "export-q1-2026",
      destination: "s3://eci-compliance-vault/audit/2026-q1.json",
      records_processed: 8432,
      initiated_by: "super_admin"
    }
  },
  {
    id: "notif-3",
    title: "Organisation Suspended: Birchwood Community School",
    message: "Birchwood Community School has been suspended automatically due to 3 consecutive missed compliance review milestones.",
    type: "error",
    read: true,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    meta_data: {
      org_id: "org-7",
      org_name: "Birchwood Community School",
      reason: "Missed compliance deadline",
      failed_milestones: ["M1_Initial_Setup", "M2_Evidence_Upload", "M3_Review_Queue"]
    }
  },
  {
    id: "notif-4",
    title: "New User Registration",
    message: "Marcus Vance has completed onboarding as the principal of Thornton MAT (Academy trust).",
    type: "info",
    read: true,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    meta_data: {
      user_id: "user-4402",
      name: "Marcus Vance",
      role: "principal",
      organisation: "Thornton MAT"
    }
  },
  {
    id: "notif-5",
    title: "Framework Published Successfully",
    message: "The framework 'Early Years Foundation Stage (EYFS) Statutory Framework' version 3.2 is now live for all academies.",
    type: "success",
    read: true,
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    meta_data: {
      framework_id: "fw-209",
      title: "Early Years Foundation Stage (EYFS) Statutory Framework",
      version: "3.2",
      target_school_types: ["Academy (Single)", "Academy (MAT)", "Free School"]
    }
  }
];

const AdminNotifications = () => {
  const queryClient = useQueryClient();
  
  // Local state for toggling mock mode vs live API
  const [mockMode, setMockMode] = useState<boolean>(() => {
    return localStorage.getItem("eci-admin-mock-mode") === "true";
  });

  // Local notifications state (primarily used in mock mode)
  const [localNotifications, setLocalNotifications] = useState<ApiNotification[]>(() => {
    const stored = localStorage.getItem("eci-admin-mock-notifications");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return DEFAULT_MOCK_NOTIFICATIONS; }
    }
    return DEFAULT_MOCK_NOTIFICATIONS;
  });

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | NotificationType>("all");

  // Selected Notification details sheet state
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<ApiNotification | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync mock notifications back to localStorage
  useEffect(() => {
    localStorage.setItem("eci-admin-mock-notifications", JSON.stringify(localNotifications));
  }, [localNotifications]);

  // Sync mock mode state
  useEffect(() => {
    localStorage.setItem("eci-admin-mock-mode", String(mockMode));
    // Invalidate queries so sidebar pulls the right data
    queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
  }, [mockMode, queryClient]);

  // React Query for Notifications
  const { data: serverNotifications, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminNotifications"],
    queryFn: getNotifications,
    enabled: !mockMode,
    retry: 1,
    meta: {
      onError: (err: any) => {
        console.error("Live notification API failed: ", err);
        toast.error("Failed to connect to backend notifications. Switching to demo mode.");
        setMockMode(true);
      }
    }
  });

  // Compute active list
  const activeNotifications = mockMode ? localNotifications : (serverNotifications || []);

  // Filter lists
  const filteredNotifications = activeNotifications
    .filter((n) => {
      // Fuzzy Search match
      const matchesSearch =
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status match
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unread" && !n.read) ||
        (statusFilter === "read" && n.read);
      
      // Type/Severity match
      const matchesType = typeFilter === "all" || n.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    })
    // Sort by latest first
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Count helper
  const totalUnread = activeNotifications.filter((n) => !n.read).length;

  // Clear All Mutation/Handler
  const handleClearAll = async () => {
    if (mockMode) {
      setLocalNotifications([]);
      toast.success("Cleared all mock notifications successfully!");
      return;
    }

    try {
      await clearAllNotifications();
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
      toast.success("All notifications cleared from the database!");
    } catch (err) {
      toast.error("Failed to clear notifications on live database.");
    }
  };

  // Delete Single Handler
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (mockMode) {
      setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
      if (selectedNotifId === id) {
        setSelectedNotifId(null);
        setDetailData(null);
      }
      toast.success("Notification deleted.");
      return;
    }

    try {
      await deleteNotification(id);
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
      if (selectedNotifId === id) {
        setSelectedNotifId(null);
        setDetailData(null);
      }
      toast.success("Notification deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete notification.");
    }
  };

  // Click single notification handler (fetches detail and marks read)
  const handleOpenDetails = async (id: string) => {
    setSelectedNotifId(id);
    setDetailLoading(true);

    if (mockMode) {
      const found = localNotifications.find((n) => n.id === id);
      if (found) {
        // Mark read locally
        setLocalNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setDetailData({ ...found, read: true });
      }
      setDetailLoading(false);
      return;
    }

    try {
      const data = await getNotificationDetail(id);
      setDetailData(data);
      // Invalidate queries so counts are immediately updated
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch notification details.");
      setSelectedNotifId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Inject fresh mock notifications for demo testing
  const handleSeedNotifications = () => {
    setLocalNotifications(DEFAULT_MOCK_NOTIFICATIONS);
    toast.success("Seeded demo notification console!");
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    if (mockMode) {
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All mock notifications marked as read!");
      return;
    }
    // Note: Live API doesn't have a bulk mark-as-read, but we can simulate or toast.
    toast.info("Bulk read-status relies on detail views. Clearing or reading completes this action.");
  };

  // Copy JSON metadata to clipboard
  const handleCopyMetadata = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Metadata copied to clipboard!");
  };

  // Type visual mappings
  const typeMap: Record<NotificationType, { icon: any; color: string; bg: string; border: string }> = {
    info: {
      icon: Info,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    success: {
      icon: CheckCircle2,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    error: {
      icon: XCircle,
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20"
    },
    system: {
      icon: Bell,
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    }
  };

  return (
    <div className="space-y-6 p-7 transition-colors duration-300 min-h-screen bg-background text-foreground">
      {/* Upper Navigation / Toggle Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-foreground text-xl font-serif flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h1>
          <p className="mt-0.5 text-muted-foreground text-sm">
            Manage system-wide alerts, framework updates, and audit details
          </p>
        </div>

        {/* Demo Mode Toggle Controller */}
        <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-lg border border-border/80 self-start sm:self-auto">
          <span className="text-xs font-semibold px-2 text-muted-foreground uppercase tracking-wider">Mode:</span>
          <button
            onClick={() => setMockMode(false)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              !mockMode
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Live Server
          </button>
          <button
            onClick={() => setMockMode(true)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              mockMode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Interactive Demo
          </button>
        </div>
      </div>

      {/* Statistics and Command Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-4 border border-border rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Unread Alerts</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{totalUnread}</p>
          </div>
          <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-card p-4 border border-border rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Active</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{activeNotifications.length}</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Global actions */}
        <div className="bg-card p-4 border border-border rounded-lg flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="flex-1 text-xs border-border/80 hover:bg-secondary/50"
            disabled={activeNotifications.length === 0}
          >
            Mark all read
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 text-xs"
                disabled={activeNotifications.length === 0}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-popover border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all {activeNotifications.length} notifications. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary text-secondary-foreground border-border">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Control Filtering Console */}
      <Card className="p-4 border-border bg-card/60 transition-colors duration-300">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50 border-border/80 text-sm focus-visible:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-1.5 bg-secondary/20 p-1 rounded-lg border border-border/50">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("unread")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                statusFilter === "unread"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread
              {totalUnread > 0 && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter("read")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === "read"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Read
            </button>
          </div>

          {/* Type Severity Filter */}
          <div className="flex flex-wrap items-center gap-1.5 bg-secondary/20 p-1 rounded-lg border border-border/50">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                typeFilter === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Types
            </button>
            {(["info", "success", "warning", "error", "system"] as NotificationType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all uppercase tracking-wider ${
                  typeFilter === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Force reload if Server Mode */}
          {!mockMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="self-end md:self-auto border border-border/60 hover:bg-secondary/40"
              title="Refresh Live Data"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Main List Rendering Pane */}
      <div className="space-y-3">
        {isLoading && !mockMode ? (
          // Rich Skeleton load loaders
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 bg-card border border-border rounded-xl space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-40 h-4 rounded" />
                </div>
                <Skeleton className="w-16 h-3 rounded" />
              </div>
              <Skeleton className="w-full h-8 rounded" />
            </div>
          ))
        ) : filteredNotifications.length === 0 ? (
          // High-fidelity premium Empty State
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card/40 border border-border border-dashed rounded-xl backdrop-blur-sm transition-all duration-300">
            <div className="p-4 bg-muted/50 rounded-full mb-4 border border-border/80 shadow-inner">
              <Bell className="w-10 h-10 text-muted-foreground/60 animate-bounce" />
            </div>
            <h3 className="font-semibold text-lg font-serif text-foreground">No alerts found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1 mb-6">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "No notifications match your current search queries or type selections."
                : "Your system has no notifications currently. Everything is running smoothly!"}
            </p>

            <div className="flex flex-wrap items-center gap-3 justify-center">
              {(searchTerm || statusFilter !== "all" || typeFilter !== "all") ? (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                  variant="outline"
                  size="sm"
                  className="border-border/80 text-xs"
                >
                  Clear search parameters
                </Button>
              ) : mockMode ? (
                <Button
                  onClick={handleSeedNotifications}
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/95 text-xs shadow-md font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Generate Demo Alerts
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Live database contains 0 notifications. Switch to "Interactive Demo" above to explore dashboard visuals.
                </p>
              )}
            </div>
          </div>
        ) : (
          // Elegant Notification Cards List
          filteredNotifications.map((n) => {
            const visual = typeMap[n.type] || typeMap.info;
            const VisualIcon = visual.icon;

            return (
              <div
                key={n.id}
                onClick={() => handleOpenDetails(n.id)}
                className={`group relative p-4 bg-card hover:bg-sidebar-accent/30 border border-border hover:border-primary/30 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow flex gap-4 items-start ${
                  !n.read ? "border-l-4 border-l-primary" : ""
                }`}
              >
                {/* Visual Icon Badge */}
                <div className={`p-2.5 rounded-lg shrink-0 ${visual.bg} ${visual.color} border ${visual.border}`}>
                  <VisualIcon className="w-4 h-4" />
                </div>

                {/* Main Content Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm truncate font-semibold text-foreground ${
                        !n.read ? "font-bold text-foreground" : "text-foreground/80"
                      }`}>
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Unread"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {/* Inline Hover Action Bar */}
                <div className="flex items-center gap-1 shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full border border-border/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={(e) => handleDelete(n.id, e)}
                    title="Delete Notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* High-Fidelity Details Sheet View Drawer */}
      <Sheet open={selectedNotifId !== null} onOpenChange={(open) => { if (!open) setSelectedNotifId(null); }}>
        <SheetContent className="w-full sm:max-w-md bg-card border-l-border overflow-y-auto space-y-6 flex flex-col justify-between">
          <div>
            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-xs font-semibold">Loading details...</p>
              </div>
            ) : detailData ? (
              <div className="space-y-6">
                <SheetHeader className="text-left space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    {/* Severity Badge */}
                    <Badge
                      className={`uppercase tracking-wider text-[10px] font-bold ${
                        detailData.type === "success"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : detailData.type === "warning"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : detailData.type === "error"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : detailData.type === "system"
                          ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      }`}
                    >
                      {detailData.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(detailData.created_at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </span>
                  </div>

                  <SheetTitle className="font-serif text-lg text-foreground font-semibold leading-tight">
                    {detailData.title}
                  </SheetTitle>
                  <SheetDescription className="text-xs leading-relaxed text-muted-foreground/90 bg-muted/40 p-4 border border-border/80 rounded-lg">
                    {detailData.message}
                  </SheetDescription>
                </SheetHeader>

                {/* Additional Metadata Inspector Pane */}
                {detailData.meta_data && Object.keys(detailData.meta_data).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Payload Metadata
                      </h5>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 rounded border border-border/60"
                        onClick={() => handleCopyMetadata(detailData.meta_data)}
                        title="Copy Payload"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </Button>
                    </div>

                    <div className="bg-secondary/40 border border-border/80 p-3 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed text-foreground/90 max-h-60 shadow-inner">
                      <pre>{JSON.stringify(detailData.meta_data, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm py-10 text-muted-foreground">
                No notification found.
              </p>
            )}
          </div>

          {/* Footer drawer actions */}
          {detailData && (
            <SheetFooter className="border-t border-border pt-4 mt-auto">
              <div className="flex w-full items-center gap-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(detailData.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete Alert
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNotifId(null)}
                  className="flex-1 border-border/80"
                >
                  Dismiss Drawer
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminNotifications;
