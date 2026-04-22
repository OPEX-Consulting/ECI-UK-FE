import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Shield,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Settings,
  MessageSquare,
  Send,
  Paperclip,
  MoreHorizontal,
  Download,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  FileText,
  UploadCloud,
  History,
  Eye,
  X,
  Save,
  Trash2,
  Image,
  FileSpreadsheet,
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
  HARDCODED_USERS,
  IncidentStatus,
} from "@/types/incident";
import {
  getAuditEntriesForIncident,
  saveIncident,
  addAuditEntry,
} from "@/lib/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  UserPlus,
  CheckCircle,
  AlertCircle,
  Lock,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

interface IncidentDetailsModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IncidentDetailsModal = ({
  incident,
  isOpen,
  onOpenChange,
}: IncidentDetailsModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      senderName: "System",
      content: "Incident automatically logged via mobile reporting app.",
      timestamp: "2026-02-06T10:45:00Z",
      isSystem: true,
    },
    {
      id: "m2",
      senderName: "Samuel John",
      senderRole: "Principal",
      content:
        "I have notified the health and safety officer. Please keep us updated on the recovery.",
      timestamp: "2026-02-06T11:30:00Z",
      avatarUrl: "",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState(
    incident?.assignedTo || "",
  );
  const [isSensitive, setIsSensitive] = useState(false);
  const [title, setTitle] = useState(incident?.title || "");
  const [description, setDescription] = useState(incident?.description || "");
  const [status, setStatus] = useState<IncidentStatus>(
    incident?.status || "submitted",
  );
  const [evidenceFiles, setEvidenceFiles] = useState<
    { name: string; size: string; type: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (incident?.id) {
      setAuditEntries(getAuditEntriesForIncident(incident.id));
      setSelectedAssignee(incident.assignedTo || "");
      setTitle(incident.title || "");
      setDescription(incident.description || "");
      setStatus(incident.status || "submitted");
    }
  }, [incident?.id]);

  if (!incident) return null;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      senderName: "You",
      senderRole: "Admin",
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const handleAssigneeChange = (val: string) => {
    if (!incident) return;
    const updatedIncident = { ...incident, assignedTo: val };
    saveIncident(updatedIncident);
    addAuditEntry({
      incidentId: incident.id,
      action: "Reassigned",
      performedBy: "admin", // Should come from auth
      performedByName: "Admin User",
      details: `Incident reassigned to ${val}`,
    });
    setSelectedAssignee(val);
    setAuditEntries(getAuditEntriesForIncident(incident.id));
  };

  const handleStatusChange = (newStatus: IncidentStatus) => {
    if (!incident) return;
    const updatedIncident = { ...incident, status: newStatus };
    saveIncident(updatedIncident);
    addAuditEntry({
      incidentId: incident.id,
      action: "Status Updated",
      performedBy: "admin",
      performedByName: "Admin User",
      details: `Status changed to ${newStatus.replace("-", " ")}`,
    });
    setStatus(newStatus);
    setAuditEntries(getAuditEntriesForIncident(incident.id));
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles).map((file) => ({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        type: file.type,
      }));
      setEvidenceFiles((prev) => [...prev, ...newFiles]);
      toast.success(`${selectedFiles.length} file(s) selected for upload`);

      addAuditEntry({
        incidentId: incident.id,
        action: "Evidence Uploaded",
        performedBy: "admin",
        performedByName: "Admin User",
        details: `Uploaded ${selectedFiles.length} files: ${newFiles.map((f) => f.name).join(", ")}`,
      });
      setAuditEntries(getAuditEntriesForIncident(incident.id));
    }
  };

  const removeEvidence = (index: number) => {
    const fileToRemove = evidenceFiles[index];
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
    addAuditEntry({
      incidentId: incident.id,
      action: "Evidence Removed",
      performedBy: "admin",
      performedByName: "Admin User",
      details: `Removed evidence: ${fileToRemove.name}`,
    });
    setAuditEntries(getAuditEntriesForIncident(incident.id));
    toast.info(`Removed ${fileToRemove.name}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1240px] w-[95vw] h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col md:flex-row">
        {/* Left Column: Details */}
        <div className="flex-1 flex flex-col min-h-0 bg-background border-r border-border">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`capitalize px-3 py-1 rounded-full font-bold text-xs border-blue-100 ${
                    status === "submitted"
                      ? "bg-blue-50 text-blue-700"
                      : status === "under-review"
                        ? "bg-amber-50 text-amber-700"
                        : status === "info-requested"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {status.replace("-", " ")}
                </Badge>
                <span className="text-muted-foreground text-sm font-medium">
                  ID: #{incident.id.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-[#1e3e35] text-white rounded-md px-4 h-9 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
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
                  {format(new Date(incident.incidentDate), "MMM d, yyyy")}
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
                <span className="text-foreground">Health & Safety</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Reported by:{" "}
                <span className="text-foreground">{incident.reporterName}</span>
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
                  {incident.assignedTo || "Not Assigned"}
                </span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
            <div className="px-8 border-b border-border">
              <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
                <TabsTrigger
                  value="details"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-sm font-bold shadow-none"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="audit"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-sm font-bold shadow-none"
                >
                  <History className="w-4 h-4 mr-2" />
                  Incident History
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-sm font-bold shadow-none"
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
                    <h3 className="text-sm font-semibold">Incident Title</h3>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-xl border-border bg-card font-medium"
                      placeholder="Incident Title"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Description</h3>
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
                      className="text-xs font-bold gap-2"
                      onClick={() => {
                        if (!incident) return;
                        const updatedIncident = {
                          ...incident,
                          title,
                          description,
                        };
                        saveIncident(updatedIncident);
                        addAuditEntry({
                          incidentId: incident.id,
                          action: "Details Updated",
                          performedBy: "admin",
                          performedByName: "Admin User",
                          details: "Incident title or description updated",
                        });
                        setAuditEntries(
                          getAuditEntriesForIncident(incident.id),
                        );
                        toast.success("Incident details updated");
                      }}
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </Button>
                  </div>
                </div>

                {/* Evidence */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Evidence</h3>
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
                    className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Upload proof of compliance (Max 10MB)
                      </p>
                    </div>
                  </div>

                  {/* Evidence List */}
                  {evidenceFiles.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {evidenceFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50/50 group/item hover:bg-white hover:border-blue-200 transition-all animate-in slide-in-from-top-2 duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm">
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
                                {file.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-medium">
                                {file.size}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover/item:opacity-100 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEvidence(index);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="audit" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Timeline Activity</h3>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {auditEntries.length} Events
                  </Badge>
                </div>

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-100 before:via-slate-100 before:to-transparent">
                  {auditEntries.length > 0 ? (
                    auditEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="relative flex items-start gap-6 group"
                      >
                        <div className="absolute left-0 mt-1 w-10 h-10 rounded-full border-4 border-background bg-white shadow-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                          {entry.action === "Reassigned" ? (
                            <UserPlus className="w-4 h-4 text-amber-500" />
                          ) : entry.action === "Status Updated" ? (
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
                              {format(
                                new Date(entry.timestamp),
                                "MMM d, h:mm aa",
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {entry.details}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                              <User className="w-2.5 h-2.5 text-slate-500" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">
                              By {entry.performedByName}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed">
                      <History className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No activity recorded yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">
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
                        >
                          <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none shadow-none text-sm">
                            <SelectValue placeholder="Select officer" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border">
                            {HARDCODED_USERS.filter(
                              (u) => u.role === "officer" || u.role === "admin",
                            ).map((u) => (
                              <SelectItem key={u.id} value={u.name}>
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
                        >
                          <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none shadow-none text-sm">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border">
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
        <div className="w-full md:w-[380px] flex flex-col bg-slate-50/50">
          <div className="p-6 border-b border-border flex items-center justify-between bg-white">
            <h2 className="font-semibold font-serif text-foreground flex items-center gap-2">
              Discussion
            </h2>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.senderName === "You" ? "flex-row-reverse" : ""}`}
                >
                  {!m.isSystem && (
                    <Avatar className="w-8 h-8 flex-shrink-0 border border-white shadow-sm">
                      <AvatarImage src={m.avatarUrl} />
                      <AvatarFallback className="bg-[#1e3e35] text-white text-[10px] font-bold">
                        {m.senderName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`space-y-1.5 max-w-[280px] ${m.senderName === "You" ? "items-end" : ""}`}
                  >
                    {!m.isSystem && (
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="text-foreground">{m.senderName}</span>
                        <span className="text-muted-foreground/60">
                          {format(new Date(m.timestamp), "MMM d, h:mm aa")}
                        </span>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        m.isSystem
                          ? "bg-white/80 border border-border italic text-muted-foreground w-full"
                          : m.senderName === "You"
                            ? "bg-[#08a86c] text-white rounded-tr-none"
                            : "bg-white border border-border rounded-tl-none text-foreground"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-6 space-y-4 bg-white border-t border-border">
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
                className="min-h-[100px] rounded-xl bg-slate-50 border-border focus:bg-white focus:ring-2 focus:ring-blue-600/20 text-sm p-4 transition-all resize-none shadow-inner"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  className="h-8 w-8 bg-[#1e3e35] text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
