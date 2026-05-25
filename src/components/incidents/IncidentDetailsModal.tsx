import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Calendar,
  User,
  AlertTriangle,
  Settings,
  Send,
  CheckCircle2,
  FileText,
  UploadCloud,
  History,
  Eye,
  Save,
  Trash2,
  Image,
  FileSpreadsheet,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Incident,
  Message,
  AuditEntry,
  IncidentStatus,
} from "@/types/incident";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schoolIncidentService } from "@/services/school/incidentService";
import { schoolOrganisationService } from "@/services/school/organisationService";
import { useAuth } from "@/contexts/AuthContext";

/** Coerces any value to a safe string for JSX rendering */
const safeStr = (val: any, fallback = ""): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    try { return JSON.stringify(val); } catch { return fallback; }
  }
  return fallback;
};

const safeFormatDate = (dateStr: any, formatStr: string, fallback = "N/A") => {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch (e) {
    return fallback;
  }
};

interface IncidentDetailsModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IncidentDetailsModal = ({
  incident: initialIncident,
  isOpen,
  onOpenChange,
}: IncidentDetailsModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch fresh details of the incident from backend API
  const { data: incident = initialIncident, refetch } = useQuery({
    queryKey: ["incident", initialIncident?.id],
    queryFn: () => schoolIncidentService.getIncidentDetail(initialIncident!.id),
    enabled: !!initialIncident?.id && isOpen,
    initialData: initialIncident || undefined,
  });

  // 2. Fetch users in school organisation for assignment dropdown
  const { data: orgUsers = [] } = useQuery<{ id: string; name: string; role?: string }[]>({
    queryKey: ["org-users"],
    queryFn: schoolOrganisationService.getUsers,
    enabled: !!user && isOpen,
  });

  // Local state for form fields, synced via useEffect
  const [newMessage, setNewMessage] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IncidentStatus>("submitted");

  useEffect(() => {
    if (incident) {
      setSelectedAssignee(incident.assignedTo || "");
      setTitle(incident.title || "");
      setDescription(incident.description || "");
      setStatus(incident.status || "submitted");
    }
  }, [incident]);

  // ── ALL MUTATIONS must be declared before any conditional return ──
  const editDetailsMutation = useMutation({
    mutationFn: (data: { title: string; description: string }) =>
      schoolIncidentService.editIncident(incident.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", incident.id] });
      toast.success("Incident details updated successfully");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.message || "Failed to update incident details";
      toast.error(typeof msg === "string" ? msg : "Failed to update incident details");
    },
  });

  const assignOfficerMutation = useMutation({
    mutationFn: (officerId: string) =>
      schoolIncidentService.assignOfficer(incident.id, officerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", incident.id] });
      toast.success("Incident assigned successfully");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.message || "Failed to assign officer";
      toast.error(typeof msg === "string" ? msg : "Failed to assign officer");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      schoolIncidentService.updateStatus(incident.id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", incident.id] });
      toast.success("Incident status updated successfully");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.message || "Failed to update status";
      toast.error(typeof msg === "string" ? msg : "Failed to update status");
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: (file: File) =>
      schoolIncidentService.uploadDocument(incident.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident", incident.id] });
      toast.success("Document uploaded successfully");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.message || "Failed to upload document";
      toast.error(typeof msg === "string" ? msg : "Failed to upload document");
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: (message: string) =>
      schoolIncidentService.addDiscussionMessage(incident.id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident", incident.id] });
      setNewMessage("");
      toast.success("Message sent");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.message || "Failed to send message";
      toast.error(typeof msg === "string" ? msg : "Failed to send message");
    },
  });

  // Action handlers
  const handleSaveChanges = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    editDetailsMutation.mutate({
      title: title.trim(),
      description: description.trim(),
    });
  };

  const handleAssigneeChange = (officerId: string) => {
    assignOfficerMutation.mutate(officerId);
  };

  const handleStatusChange = (newStatus: IncidentStatus) => {
    updateStatusMutation.mutate(newStatus);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    addMessageMutation.mutate(newMessage.trim());
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach((file) => {
        uploadDocumentMutation.mutate(file);
      });
    }
  };

  // Early return AFTER all hooks
  if (!incident) return null;

  // Helper: Retrieve formatted name for display
  const getAssigneeName = (assignedToId?: string) => {
    if (!assignedToId) return "Not Assigned";
    const foundUser = orgUsers.find((u) => u.id === assignedToId);
    return foundUser ? foundUser.name : "Not Assigned";
  };

  const getReporterName = (reporterId?: string) => {
    if (!reporterId) return incident.reporterName || "Staff Member";
    const foundUser = orgUsers.find((u) => u.id === reporterId);
    return foundUser ? foundUser.name : (incident.reporterName || "Staff Member");
  };

  // Robustly map discussion messages
  const messages: Message[] = (incident.discussion || []).map((m: any) => ({
    id: m.id || m.message_id || String(Math.random()),
    senderName: m.senderName || m.sender_name || m.sender?.name || (m.reported_by_staff_id === user?.id ? "You" : "Staff Member"),
    senderRole: m.senderRole || m.sender_role || m.sender?.role || "Staff",
    content: m.content || m.message || "",
    timestamp: m.timestamp || m.created_at || new Date().toISOString(),
    isSystem: m.isSystem || m.is_system || false,
  }));

  // Robustly map documents (evidence)
  const evidenceFiles = (incident.documents || []).map((d: any, idx: number) => ({
    id: d.id || idx,
    name: d.name || d.file_name || d.filename || "file",
    size: d.size || d.file_size || (d.size_bytes ? `${(d.size_bytes / (1024 * 1024)).toFixed(2)} MB` : "Unknown size"),
    type: d.type || d.file_type || d.content_type || "",
  }));

  // Robustly map audit entries (history)
  const auditEntries: AuditEntry[] = (incident.history || []).map((h: any) => ({
    id: h.id || String(Math.random()),
    incidentId: incident.id,
    action: h.action || h.event_type || "Event",
    performedBy: h.performedBy || h.user_id || "",
    performedByName: h.performedByName || h.user_name || "User",
    timestamp: h.timestamp || h.created_at || new Date().toISOString(),
    details: h.details || h.description || "",
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1240px] w-[95vw] h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col md:flex-row bg-background">
        {/* Left Column: Details */}
        <div className="flex-1 flex flex-col min-h-0 bg-background border-r border-border">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`capitalize px-3 py-1 rounded-full font-bold text-xs border-primary/10 ${
                    status === "submitted"
                      ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                      : status === "under-review"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        : status === "info-requested"
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  {status.replace("-", " ")}
                </Badge>
                <span className="text-muted-foreground text-sm font-medium">
                  ID: #{incident.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("finalized")}
                  disabled={status === "finalized" || updateStatusMutation.isPending}
                  className="bg-[#1e3e35] text-white rounded-md px-4 h-9 flex items-center gap-2 hover:bg-[#152c26]"
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Resolve Incident
                </Button>
              </div>
            </div>

            <h1 className="text-xl font-serif font-semibold tracking-tight text-foreground line-clamp-2">
              {incident.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date:{" "}
                <span className="text-foreground">
                  {safeFormatDate(incident.incidentDate, "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    status === "finalized"
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }`}
                />
                <span className="text-foreground capitalize">
                  {status.replace("-", " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="text-foreground capitalize">{(incident.type || "").replace("-", " ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Reported by:{" "}
                <span className="text-foreground">{getReporterName(incident.reporterId)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Assigned to:{" "}
                <span
                  className={
                    incident.assignedTo
                      ? "text-foreground"
                      : "text-muted-foreground italic"
                  }
                >
                  {getAssigneeName(incident.assignedTo)}
                </span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
            <div className="px-8 border-b border-border">
              <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
                <TabsTrigger
                  value="details"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 py-4 text-sm font-bold shadow-none"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="audit"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 py-4 text-sm font-bold shadow-none"
                >
                  <History className="w-4 h-4 mr-2" />
                  Incident History
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 py-4 text-sm font-bold shadow-none"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-8">
              <TabsContent value="details" className="mt-0 space-y-8">
                {/* Description and Title Edit */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Incident Title</h3>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-xl border-border bg-card font-medium"
                      placeholder="Incident Title"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Description</h3>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl border-border bg-card min-h-[120px] text-sm text-foreground/80 leading-relaxed"
                      placeholder="Describe the incident..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={editDetailsMutation.isPending}
                      className="text-xs font-bold gap-2"
                      onClick={handleSaveChanges}
                    >
                      {editDetailsMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>

                {/* Evidence */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">Evidence</h3>
                      <Badge
                        variant="destructive"
                        className="text-[9px] uppercase font-bold py-0 h-4"
                      >
                        Required
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">
                      Supported: PDF, DOCX, XLSX, Images
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept=".pdf,.docx,.xlsx,.xls,.csv,image/*"
                  />
                  <div
                    onClick={handleFileClick}
                    className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      {uploadDocumentMutation.isPending ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-foreground">
                        {uploadDocumentMutation.isPending ? "Uploading evidence..." : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Upload proof of compliance (Max 10MB)
                      </p>
                    </div>
                  </div>

                  {/* Evidence List */}
                  {evidenceFiles.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {evidenceFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 group/item hover:bg-card hover:border-primary/20 transition-all animate-in slide-in-from-top-2 duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shadow-sm">
                              {file.type.includes("image") ? (
                                <Image className="w-4 h-4 text-blue-500" />
                              ) : file.name.includes("xls") ||
                                file.name.includes("csv") ? (
                                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-foreground line-clamp-1">
                                {safeStr(file.name, "Unnamed file")}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-medium">
                                {safeStr(file.size, "Unknown size")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="audit" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Timeline Activity</h3>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {auditEntries.length} Events
                  </Badge>
                </div>

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/10 before:via-muted before:to-transparent">
                  {auditEntries.length > 0 ? (
                    auditEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="relative flex items-start gap-6 group"
                      >
                        <div className="absolute left-0 mt-1 w-10 h-10 rounded-full border-4 border-background bg-white shadow-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                          {entry.action === "Reassigned" || entry.action.includes("assign") ? (
                            <UserPlus className="w-4 h-4 text-amber-500" />
                          ) : entry.action === "Status Updated" || entry.action.includes("status") ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="pl-14 space-y-1.5 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-foreground">
                              {entry.action}
                            </h4>
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                              {safeFormatDate(entry.timestamp, "MMM d, h:mm aa")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {safeStr(entry.details)}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-2.5 h-2.5 text-muted-foreground" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">
                              By {entry.performedByName}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed">
                      <History className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No activity recorded yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Management & Controls
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Reassign */}
                      <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-blue-600" />
                          <Label className="text-xs font-bold text-foreground">
                            Assign Officer
                          </Label>
                        </div>
                        <Select
                          value={selectedAssignee}
                          onValueChange={handleAssigneeChange}
                          disabled={assignOfficerMutation.isPending}
                        >
                          <SelectTrigger className="h-10 rounded-xl bg-muted/50 border-none shadow-none text-sm text-foreground">
                            {assignOfficerMutation.isPending ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Assigning...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Select officer" />
                            )}
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground">
                            {orgUsers
                              .filter(
                                (u) =>
                                  u.role === "officer" ||
                                  u.role === "admin" ||
                                  u.role === "role_compliance_officer" ||
                                  u.role === "role_admin"
                              )
                              .map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Status Change */}
                      <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <Label className="text-xs font-bold text-foreground">
                            Update Status
                          </Label>
                        </div>
                        <Select
                          value={status}
                          onValueChange={handleStatusChange}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className="h-10 rounded-xl bg-muted/50 border-none shadow-none text-sm text-foreground">
                            {updateStatusMutation.isPending ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Updating...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Update status" />
                            )}
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground">
                            <SelectItem value="submitted">Open</SelectItem>
                            <SelectItem value="under-review">
                              Action in Progress
                            </SelectItem>
                            <SelectItem value="info-requested">
                              Information Requested
                            </SelectItem>
                            <SelectItem value="finalized">
                              Resolved / Closed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Right Column: Discussion */}
        <div className="w-full md:w-[380px] flex flex-col bg-muted/10 md:border-l border-border">
          <div className="p-6 border-b border-border flex items-center justify-between bg-card">
            <h2 className="font-semibold font-serif text-foreground flex items-center gap-2">
              Discussion
            </h2>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.senderName === "You" || m.senderName === user?.name ? "flex-row-reverse" : ""}`}
                >
                  {!m.isSystem && (
                    <Avatar className="w-8 h-8 flex-shrink-0 border-2 border-background shadow-sm">
                      <AvatarImage src={m.avatarUrl} />
                      <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                        {m.senderName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`space-y-1.5 max-w-[280px] ${m.senderName === "You" || m.senderName === user?.name ? "items-end" : ""}`}
                  >
                    {!m.isSystem && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-foreground">
                        <span>{m.senderName}</span>
                        <span className="text-muted-foreground/60">
                          {safeFormatDate(m.timestamp, "MMM d, h:mm aa")}
                        </span>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        m.isSystem
                          ? "bg-muted/50 border border-border italic text-muted-foreground w-full"
                          : m.senderName === "You" || m.senderName === user?.name
                            ? "bg-[#08a86c] text-white rounded-tr-none"
                            : "bg-card border border-border rounded-tl-none text-foreground"
                      }`}
                    >
                      {safeStr(m.content)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-6 space-y-4 bg-card border-t border-border">
            <div className="relative group">
              <Textarea
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={addMessageMutation.isPending}
                className="min-h-[100px] rounded-xl bg-muted/50 border-border focus:bg-background focus:ring-2 focus:ring-primary/20 text-sm p-4 transition-all resize-none shadow-inner text-foreground"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || addMessageMutation.isPending}
                  className="h-8 w-8 bg-[#1e3e35] hover:bg-[#152c26] text-white"
                >
                  {addMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
