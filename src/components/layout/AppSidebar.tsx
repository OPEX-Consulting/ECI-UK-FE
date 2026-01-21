import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  BarChart3,
  LogOut,
  AlertTriangle,
  Users,
} from 'lucide-react';
import edusafeLogo from '@/assets/edusafe-logo.jpg';

const getNavItems = (role: string) => {
  const staffItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Report Incident', icon: AlertTriangle, path: '/report' },
    { title: 'My Reports', icon: FileText, path: '/my-reports' },
  ];

  const officerItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Review Queue', icon: ClipboardCheck, path: '/review' },
    { title: 'All Incidents', icon: FileText, path: '/incidents' },
  ];

  const principalItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Compliance', icon: BarChart3, path: '/compliance' },
    { title: 'All Incidents', icon: FileText, path: '/incidents' },
    { title: 'Users', icon: Users, path: '/users' },
  ];

  switch (role) {
    case 'staff':
      return staffItems;
    case 'officer':
      return officerItems;
    case 'principal':
      return principalItems;
    default:
      return staffItems;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'staff':
      return 'Staff Member';
    case 'officer':
      return 'Officer-in-Charge';
    case 'principal':
      return 'Principal / Admin';
    default:
      return role;
  }
};

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <img 
            src={edusafeLogo} 
            alt="EduSafe" 
            className="h-10 w-auto rounded"
          />
          <div>
            <h2 className="font-semibold text-sidebar-foreground text-sm">EduSafe</h2>
            <p className="text-xs text-sidebar-foreground/70">Compliance Intelligence</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    className="cursor-pointer"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {getRoleLabel(user.role)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
