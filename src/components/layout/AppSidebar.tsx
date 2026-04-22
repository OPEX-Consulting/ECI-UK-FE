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
  CheckSquare,
  BookOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import edusafeLogo from '@/assets/edusafe-logo.jpg';

const getNavItems = (role: string) => {
  const staffItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { title: 'Frameworks', icon: BookOpen, path: '/frameworks' },
    { title: 'Report Incident', icon: AlertTriangle, path: '/report' },
    { title: 'My Reports', icon: FileText, path: '/my-reports' },
  ];

  const officerItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { title: 'Frameworks', icon: BookOpen, path: '/frameworks' },
    { title: 'Review Queue', icon: ClipboardCheck, path: '/review' },
    { title: 'All Incidents', icon: FileText, path: '/incidents' },
  ];

  const principalItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { title: 'Frameworks', icon: BookOpen, path: '/frameworks' },
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
    
export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
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
        <div className="flex items-start flex-col gap-3">
          <img 
            src={edusafeLogo} 
            alt="EduSafe" 
            className="h-10 w-auto rounded"
          />
          <div>
            {/* <h2 className="font-semibold text-sidebar-foreground text-sm">EduSafe</h2> */}
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

      <SidebarFooter className="border-t border-sidebar-border p-4 gap-4">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-sidebar-foreground opacity-60">Theme</span>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-md border border-sidebar-border hover:bg-sidebar-accent transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-sidebar-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-sidebar-foreground" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out</AlertDialogTitle>
              <AlertDialogDescription className='text-sm text-gray-500'>
                Are you sure you want to sign out? 
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Sign out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  );
};
