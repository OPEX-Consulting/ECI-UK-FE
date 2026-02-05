import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Shield, ClipboardCheck, User, Plus } from 'lucide-react';
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'invite sent';
}

const HARDCODED_USERS: User[] = [
  {
    id: 'user-1',
    email: 'samuel.john@opexconsult.co.uk',
    name: 'Samuel John',
    role: 'principal',
    status: 'active',
  },
  {
    id: 'user-2',
    email: 'john96samuel@gmail.com',
    name: 'John Samuel',
    role: 'staff',
    status: 'active',
  },
  {
    id: 'user-3',
    email: 'sammyjay708@gmail.com',
    name: 'Sammy Jay',
    role: 'officer',
    status: 'active',
  },
];

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
  const [users, setUsers] = useState<User[]>(HARDCODED_USERS);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as UserRole
  });

  const handleSendInvite = () => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'invite sent'
    };
    
    setUsers([...users, newUser]);
    setIsOpen(false);
    setFormData({ name: '', email: '', role: 'staff' });
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
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] lg:max-w-[700px]">
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
                  className="col-span-3 flex flex-row gap-2"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-md">
                    <RadioGroupItem value="staff" id="staff" />
                    <Label htmlFor="staff">Staff - Reports incidents</Label>
                  </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-md">
                    <RadioGroupItem value="officer" id="officer" />
                    <Label htmlFor="officer">Officer - Reviews incidents</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSendInvite}>Send Invitation</Button>
            </DialogFooter>
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
              {users.map(user => {
                const config = getRoleConfig(user.role);
                const Icon = config.icon;
                
                return (
                  <div 
                    key={user.id}
                    className="flex items-start gap-4 p-4 border border-border rounded-lg"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={config.color}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium ">{user.name}</p>
                        <Badge 
                          variant={user.status === 'active' ? 'default' : 'secondary'} 
                          className={`ml-2 ${user.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                        >
                          {user.status === 'active' ? 'Active' : 'Invite Sent'}
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
              })}
            </div>
          </CardContent>
        </Card>

       
      </div>
    </AppLayout>
  );
};

export default UsersPage;
