import { HARDCODED_USERS } from '@/types/incident';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Shield, ClipboardCheck, User } from 'lucide-react';

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
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Users</h1>
          <p className="text-muted-foreground">
            Users configured in the system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Registered Users
            </CardTitle>
            <CardDescription>
              {HARDCODED_USERS.length} users with system access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {HARDCODED_USERS.map(user => {
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
                        <p className="font-medium">{user.name}</p>
                        <Badge variant="outline" className="gap-1">
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

        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This is a demo system with hardcoded users. 
              In a production environment, user management would be connected to 
              your organization's identity provider.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default UsersPage;
