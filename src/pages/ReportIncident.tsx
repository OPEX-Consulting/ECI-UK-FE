import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { generateId } from "@/lib/storage";
import {
  IncidentType,
  Incident,
  HARDCODED_USERS,
} from "@/types/incident";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Users,
  Heart,
  AlertTriangle,
  Loader2,
  Plus,
  Calendar,
  User as UserIcon,
  ChevronRight,
  Database,
  Flame,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_INCIDENTS } from "@/data/mock-incidents";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { IncidentDetailsModal } from "@/components/incidents/IncidentDetailsModal";

const incidentTypes: {
  type: IncidentType;
  label: string;
  icon: any;
  description: string;
  color: string;
}[] = [
  {
    type: "safeguarding",
    label: "Safeguarding",
    icon: Shield,
    description: "Child protection concerns, abuse, neglect",
    color: "text-amber-500",
  },
  {
    type: "behavioral",
    label: "Behavioral",
    icon: Users,
    description: "Bullying, fights, disruptive behavior",
    color: "text-blue-500",
  },
  {
    type: "health-safety",
    label: "Health & Safety",
    icon: Heart,
    description: "Injuries, accidents, medical emergencies",
    color: "text-rose-500",
  },
  {
    type: "data-protection",
    label: "Data Protection",
    icon: Database,
    description: "Data breaches, GDPR concerns",
    color: "text-rose-500",
  },
  {
    type: "fire-safety",
    label: "Fire Safety",
    icon: Flame,
    description: "Fire hazards, equipment failure",
    color: "text-emerald-500",
  },
];

const ReportIncident = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);

  const [formData, setFormData] = useState({
    type: "" as IncidentType | "",
    title: "",
    studentName: "",
    incidentDate: "",
    incidentTime: "",
    description: "",
    immediateAction: "",
    reportedBy: "",
    isUrgent: false,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under-review":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-medium px-3 py-1 text-[11px]"
          >
            Action in Progress
          </Badge>
        );
      case "submitted":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 font-medium px-3 py-1 text-[11px]"
          >
            Open
          </Badge>
        );
      case "finalized":
        return (
          <Badge
            variant="secondary"
            className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20 font-medium px-3 py-1 text-[11px]"
          >
            Closed
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="font-medium px-3 py-1 text-[11px]"
          >
            {status}
          </Badge>
        );
    }
  };

  const getIncidentIcon = (type: IncidentType, isUrgent: boolean) => {
    const iconBase =
      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0";
    if (isUrgent) {
      return (
        <div className={`${iconBase} bg-rose-500/10 border border-rose-500/20`}>
          <AlertCircle className="w-5 h-5 text-rose-500" />
        </div>
      );
    }

    switch (type) {
      case "safeguarding":
        return (
          <div className={`${iconBase} bg-amber-500/10 border border-amber-500/20`}>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
        );
      case "fire-safety":
        return (
          <div
            className={`${iconBase} bg-emerald-500/10 border border-emerald-500/20`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        );
      default:
        return (
          <div className={`${iconBase} bg-rose-500/10 border border-rose-500/20`}>
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
        );
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!user) return;

    if (!formData.type) return toast.error("Please select an incident type");
    if (!formData.studentName.trim())
      return toast.error("Please enter the student name");
    if (!formData.incidentDate)
      return toast.error("Please enter the incident date");
    if (!formData.reportedBy)
      return toast.error("Please select who is reporting this incident");
    if (!formData.description.trim())
      return toast.error("Please describe the incident");

    setIsSubmitting(true);
    const incidentId = generateId();
    const now = new Date().toISOString();

    const newIncident: Incident = {
      id: incidentId,
      title: formData.title.trim(),
      type: formData.type as IncidentType,
      status: asDraft ? "under-review" : "submitted",
      studentName: formData.studentName.trim(),
      location: "Main Site",
      incidentDate: formData.incidentDate,
      incidentTime: formData.incidentTime || "00:00",
      description: formData.description.trim(),
      immediateAction: formData.immediateAction.trim(),
      isUrgent: formData.isUrgent,
      reporterId: user.id,
      reporterName: formData.reportedBy || user.name,
      createdAt: now,
      updatedAt: now,
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setIsModalOpen(false);
    toast.success(asDraft ? "Draft saved" : "Incident submitted for review");
    setIsSubmitting(false);

    // Reset form
    setFormData({
      type: "",
      title: "",
      studentName: "",
      incidentDate: "",
      incidentTime: "",
      description: "",
      immediateAction: "",
      reportedBy: "",
      isUrgent: false,
    });
  };

  return (
    <AppLayout>
      <div className=" space-y-8 pb-20 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif tracking-tight text-foreground">
              Incident Reports
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Log, track and resolve incidents with full audit trail
            </p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1e3e35] hover:opacity-90 text-white rounded-md px-6 text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
              <div className="p-8 space-y-8">
                <DialogHeader className="p-0">
                  <DialogTitle className="text-xl font-serif ">
                    Report New Incident
                  </DialogTitle>
                  <DialogDescription className="text-sm font-light text-muted-foreground">
                    Document an incident that occurred at the school. All
                    reports are timestamped and audited.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">
                  {/* Incident Type Grid */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Category *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(val) =>
                        setFormData({ ...formData, type: val as IncidentType })
                      }
                    >
                      <SelectTrigger className="w-full h-12 rounded-2xl border-2 border-border bg-card px-4 text-sm font-bold shadow-sm hover:border-primary/50 transition-all focus:ring-primary/20">
                        <SelectValue placeholder="Select incident category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border shadow-xl p-1 bg-popover text-popover-foreground">
                        {incidentTypes.map((t) => (
                          <SelectItem
                            key={t.type}
                            value={t.type}
                            className="rounded-xl py-3 focus:bg-accent cursor-pointer"
                          >
                            <span className="font-bold">
                              {t.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Form Details */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="font-bold">
                        Incident Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="rounded-xl border-border bg-muted/50 focus:bg-background"
                        placeholder="Briefly describe the incident (e.g. Minor fracture in Gym)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="studentName" className="font-bold">
                        Student Name / Party Involved *
                      </Label>
                      <Input
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        className="rounded-xl border-border bg-muted/50 focus:bg-background"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reportedBy" className="font-bold">
                        Reported By *
                      </Label>
                      <Select
                        value={formData.reportedBy}
                        onValueChange={(val) =>
                          setFormData({ ...formData, reportedBy: val })
                        }
                      >
                        <SelectTrigger
                          id="reportedBy"
                          className="rounded-xl border-border bg-muted/50 focus:bg-background"
                        >
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                          {HARDCODED_USERS.map((u) => (
                            <SelectItem key={u.id} value={u.name}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incidentDate" className="font-bold">
                        Date *
                      </Label>
                      <Input
                        id="incidentDate"
                        name="incidentDate"
                        type="date"
                        value={formData.incidentDate}
                        onChange={handleInputChange}
                        className="rounded-xl border-border bg-muted/50 focus:bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incidentTime" className="font-bold">
                        Time
                      </Label>
                      <Input
                        id="incidentTime"
                        name="incidentTime"
                        type="time"
                        value={formData.incidentTime}
                        onChange={handleInputChange}
                        className="rounded-xl border-border bg-muted/50 focus:bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-bold">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="rounded-xl border-border bg-muted/50 focus:bg-background min-h-[120px]"
                      placeholder="Please provide as much detail as possible..."
                    />
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-12 font-bold"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 rounded-xl h-12 font-bold bg-primary shadow-lg shadow-primary/20"
                      onClick={() => handleSubmit(false)}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Submit Report"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* List of Incidents */}
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card
              key={incident.id}
              className="group rounded-none bg-card border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-xl overflow-hidden cursor-pointer"
              onClick={() => {
                setSelectedIncident(incident);
                setIsDetailsModalOpen(true);
              }}
            >
              <CardContent className="px-6 py-4 rounded-none">
                <div className="flex items-center gap-6">
                  {/* Icon */}
                  {getIncidentIcon(incident.type, incident.isUrgent)}

                  {/* Main Content */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {incident.description.split(".")[0]}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 font-medium">
                      {incident.description
                        .split(".")
                        .slice(1)
                        .join(".")
                        .trim() || incident.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80">
                        <span className="capitalize">
                          {incident.type.replace("-", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(incident.incidentDate), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80">
                        <UserIcon className="w-3.5 h-3.5" />
                        Reported by {incident.reporterName}
                      </div>
                    </div>
                  </div>

                  {/* Right Side Info */}
                  <div className="hidden md:flex flex-col items-end gap-3 flex-shrink-0">
                    {getStatusBadge(incident.status)}
                    <Avatar className="w-8 h-8 border-2 border-background shadow-sm">
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                        {incident.reporterName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <IncidentDetailsModal
          incident={selectedIncident}
          isOpen={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
        />
      </div>
    </AppLayout>
  );
};

export default ReportIncident;
