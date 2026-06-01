import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Shield, ClipboardCheck, User, Plus, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UserRole } from '@/types/incident';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolOrganisationService } from '@/services/school/organisationService';
import { toast } from 'sonner';
import { normalizeSchoolRole } from '@/lib/utils';
import { classificationService } from '@/services/school/classificationService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'invite sent' | 'invited' | 'pending';
  invite_status?: string;
}

const getRoleConfig = (role: string) => {
  const normalized = normalizeSchoolRole(role);
  switch (normalized) {
    case 'principal':
      return { 
        label: 'Principal / Admin', 
        icon: Shield, 
        color: 'bg-primary text-primary-foreground',
        description: 'Full access to compliance dashboard, all incidents, and user management'
      };
    case 'officer':
      return { 
        label: 'Officer-in-Charge', 
        icon: ClipboardCheck, 
        color: 'bg-status-under-review text-white',
        description: 'Reviews incidents, adds assessments, and finalizes reports'
      };
    case 'staff':
      return { 
        label: 'Staff Member', 
        icon: User, 
        color: 'bg-status-submitted text-white',
        description: 'Reports incidents and views own submissions'
      };
    default:
      return { 
        label: role, 
        icon: User, 
        color: 'bg-muted text-muted-foreground',
        description: ''
      };
  }
};

const UsersPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [successData, setSuccessData] = useState<{
    email: string;
    name: string;
    role: string;
    inviteLink: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const roleToApiKey = (role: string): string => {
    if (role === 'role_admin' || role === 'admin') return 'admin';
    if (role === 'role_principal' || role === 'principal') return 'principal';
    if (role === 'role_compliance_officer' || role === 'compliance_officer' || role === 'officer') return 'compliance_officer';
    if (role === 'role_staff' || role === 'staff') return 'staff';
    return 'staff';
  };
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'role_staff' as UserRole
  });

  const { data: startupData } = useQuery({
    queryKey: ['startup-data'],
    queryFn: () => classificationService.getStartupData()
  });

  const rolesGroup = startupData?.find(g => g.group === 'school_user_roles');
  const rolesMap = rolesGroup?.data || {
    admin: 'role_admin',
    principal: 'role_principal',
    compliance_officer: 'role_compliance_officer',
    staff: 'role_staff'
  };

  const roleOptions = Object.entries(rolesMap).map(([key, val]) => ({
    key,
    value: val,
    label: key === 'admin' ? 'School Admin' :
           key === 'principal' ? 'Principal / School Head' :
           key === 'compliance_officer' ? 'Officer-in-Charge / Compliance Officer' :
           'Staff Member',
    description: key === 'admin' ? 'Manages users and settings' :
                 key === 'principal' ? 'Full access to dashboards' :
                 key === 'compliance_officer' ? 'Reviews and finalizes reports' :
                 'Reports incidents and views own submissions'
  }));

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['organisation-invitations'],
    queryFn: schoolOrganisationService.getInvitations
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role, name }: { email: string, role: string, name: string }) => {
      const backendRole = roleToApiKey(role);
      return schoolOrganisationService.inviteUser([email], backendRole, name);
    },
    onSuccess: (data) => {
      toast.success('Invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['organisation-invitations'] });
      
      // If we receive the invite token back, show it in a copyable screen
      if (data?.invited_details && data.invited_details.length > 0) {
        const detail = data.invited_details[0];
        const link = `${window.location.origin}/accept-invite?token=${detail.invite_token}`;
        setSuccessData({
          email: detail.email,
          name: formData.name,
          role: formData.role,
          inviteLink: link
        });
      } else {
        setIsOpen(false);
        setFormData({ name: '', email: '', role: 'role_staff' });
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.message || 'Failed to send invitation';
      toast.error(typeof msg === 'string' ? msg : 'Failed to send invitation');
    }
  });

  const handleSendInvite = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email) {
      toast.error('Email is required');
      return;
    }
    inviteMutation.mutate({ email: formData.email, role: formData.role, name: formData.name.trim() });
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Invitation link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSuccessData(null);
      setFormData({ name: '', email: '', role: 'role_staff' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className='flex flex-row justify-between items-center'>
        <div>
            <h1 className="text-2xl font-bold text-foreground">System Users</h1>
          <p className="text-muted-foreground text-sm">
            Users configured in the system
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-xl">
            {successData ? (
              /* ── Success Screen ──────────────────────────────────────── */
              <div className="flex flex-col items-center text-center px-8 pt-8 pb-6 space-y-5">
                {/* Animated check ring */}
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600 animate-in zoom-in-50 duration-300 ring-4 ring-green-100 dark:ring-green-900/30">
                    <Check className="h-7 w-7 stroke-[2.5]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Invitation Sent!
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                    The invitation has been created. Copy the activation link below and share it with the new user.
                  </DialogDescription>
                </div>

                {/* Recipient card */}
                <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-left">
                  {/* Avatar + name row */}
                  <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${getRoleConfig(successData.role).color}`}>
                      {(successData.name || successData.email)
                        .split(' ')
                        .slice(0, 2)
                        .map((n: string) => n[0]?.toUpperCase())
                        .join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {successData.name || successData.email}
                      </p>
                      {successData.name && (
                        <p className="text-xs text-slate-500 truncate">{successData.email}</p>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {getRoleConfig(successData.role).label}
                    </span>
                  </div>

                  {/* Activation link */}
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      Activation Link
                    </p>
                    <div className="flex gap-2 items-center">
                      <Input
                        readOnly
                        value={successData.inviteLink}
                        className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 font-mono text-[11px] select-all flex-1 h-8"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCopyLink(successData.inviteLink)}
                        variant={copied ? "default" : "outline"}
                        className={`gap-1.5 transition-all h-8 min-w-[80px] ${copied ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''}`}
                      >
                        {copied ? (
                          <><Check className="h-3.5 w-3.5" />Copied</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5" />Copy</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-10 font-semibold"
                  onClick={() => handleOpenChange(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              /* ── Invite Form ─────────────────────────────────────────── */
              <>
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Invite New User
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Enter the details of the user you want to invite to the system.
                  </DialogDescription>
                </div>

                {/* Form body */}
                <div className="px-6 py-5 space-y-5">
                  {/* Name + Email side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jane Doe"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jane@school.org"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Live preview strip */}
                  {(formData.name || formData.email) && (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(formData.name || formData.email)
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0]?.toUpperCase())
                          .join('') || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {formData.name || '—'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {formData.email || 'No email yet'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Role picker */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Role
                    </Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(val) => setFormData({ ...formData, role: val as UserRole })}
                      className="space-y-2"
                    >
                      {roleOptions.map((opt) => {
                        const isSelected = formData.role === opt.value;
                        return (
                          <div
                            key={opt.key}
                            onClick={() => setFormData({ ...formData, role: opt.value as UserRole })}
                            className={`flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-slate-900 bg-slate-900 dark:border-slate-100 dark:bg-slate-800'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            <RadioGroupItem
                              value={opt.value}
                              id={opt.key}
                              className={`mt-0.5 flex-shrink-0 ${isSelected ? 'border-white text-white' : ''}`}
                            />
                            <div>
                              <Label
                                htmlFor={opt.key}
                                className={`cursor-pointer font-semibold text-sm block ${
                                  isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                {opt.label}
                              </Label>
                              <span className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                {opt.description}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-2 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => handleOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendInvite}
                    disabled={inviteMutation.isPending}
                    className="min-w-[130px]"
                  >
                    {inviteMutation.isPending ? 'Sending…' : 'Send Invitation'}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Registered Users
            </CardTitle>
            <CardDescription>
              {users.length} users with system access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-8 text-muted-foreground">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="flex justify-center p-8 text-muted-foreground">No users found.</div>
              ) : (
                users.map((user: User) => {
                  const config = getRoleConfig(user.role);
                  const Icon = config.icon;
                  const isActive = user.status === 'active' || user.invite_status === 'accepted';
                  
                  return (
                    <div 
                      key={user.id}
                      className="flex items-start gap-4 p-4 border border-border rounded-lg"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={config.color}>
                          {user.name ? user.name.split(' ').map(n => n[0]).join('') : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium ">{user.name || user.email}</p>
                          <Badge 
                            variant={isActive ? 'default' : 'secondary'} 
                            className={`ml-2 ${isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                          >
                            {isActive ? 'Active' : 'Invite Sent'}
                          </Badge>
                          <Badge variant="outline" className="gap-1  ml-auto">
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

       
      </div>
    </AppLayout>
  );
};

export default UsersPage;
