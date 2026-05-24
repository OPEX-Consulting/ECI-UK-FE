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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'invite sent' | 'invited' | 'pending';
  invite_status?: string;
}

const getRoleConfig = (role: string) => {
  switch (role) {
    case 'principal':
      return { 
        label: 'Principal / Admin', 
        icon: Shield, 
        color: 'bg-primary text-primary-foreground',
        description: 'Full access to compliance dashboard, all incidents, and user management'
      };
    case 'officer':
    case 'compliance_officer':
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
    role: string;
    inviteLink: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as UserRole
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['organisation-invitations'],
    queryFn: schoolOrganisationService.getInvitations
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string, role: string }) => {
      // Map frontend 'officer' role to backend 'compliance_officer' enum
      const backendRole = role === 'officer' ? 'compliance_officer' : role;
      return schoolOrganisationService.inviteUser([email], backendRole);
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
          role: formData.role,
          inviteLink: link
        });
      } else {
        setIsOpen(false);
        setFormData({ name: '', email: '', role: 'staff' });
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.message || 'Failed to send invitation';
      toast.error(typeof msg === 'string' ? msg : 'Failed to send invitation');
    }
  });

  const handleSendInvite = () => {
    if (!formData.email) {
      toast.error('Email is required');
      return;
    }
    inviteMutation.mutate({ email: formData.email, role: formData.role });
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
      setFormData({ name: '', email: '', role: 'staff' });
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
          <DialogContent className="sm:max-w-[425px] md:max-w-[550px] lg:max-w-[650px] transition-all duration-300">
            {successData ? (
              <div className="flex flex-col items-center text-center p-4 space-y-6">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center text-green-600 animate-in zoom-in-50 duration-300">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                
                <div className="space-y-2">
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Invitation Created!
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
                    The user has been added to your organisation. Since this is a local environment, you can copy the activation link below to accept the invite.
                  </DialogDescription>
                </div>

                <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 text-left">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 border-b pb-2 dark:border-slate-800">
                    <span>RECIPIENT EMAIL</span>
                    <span>ROLE</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-950 dark:text-slate-50">
                    <span className="truncate max-w-[240px]">{successData.email}</span>
                    <span className="capitalize">{getRoleConfig(successData.role).label}</span>
                  </div>
                </div>

                <div className="w-full space-y-2 text-left">
                  <Label className="text-xs font-bold text-slate-500">ACTIVATION LINK</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      readOnly 
                      value={successData.inviteLink} 
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono text-xs select-all text-ellipsis overflow-hidden flex-1"
                    />
                    <Button 
                      onClick={() => handleCopyLink(successData.inviteLink)} 
                      variant={copied ? "default" : "outline"}
                      className={`gap-1.5 transition-all min-w-[90px] ${copied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <DialogFooter className="w-full sm:justify-center">
                  <Button className="w-full sm:w-[150px]" onClick={() => handleOpenChange(false)}>
                    Done
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                  <DialogDescription>
                    Enter the details of the user you want to invite to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="col-span-3"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="col-span-3"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">
                      Role
                    </Label>
                    <RadioGroup 
                      value={formData.role} 
                      onValueChange={(val) => setFormData({...formData, role: val as UserRole})}
                      className="col-span-3 flex flex-col sm:flex-row gap-2"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 flex-1">
                        <RadioGroupItem value="staff" id="staff" />
                        <Label htmlFor="staff" className="cursor-pointer">Staff - Reports incidents</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 flex-1">
                        <RadioGroupItem value="officer" id="officer" />
                        <Label htmlFor="officer" className="cursor-pointer">Officer - Reviews incidents</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleSendInvite}
                    disabled={inviteMutation.isPending}
                  >
                    {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
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
