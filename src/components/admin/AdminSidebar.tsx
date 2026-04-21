import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import {
  LayoutDashboard,
  BookOpen,
  Building2,
  School,
  Users,
  ScrollText,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

const adminNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { title: 'Frameworks', icon: BookOpen, path: '/admin/frameworks' },
  { title: 'Organisations', icon: Building2, path: '/admin/organisations' },
  { title: 'School Types', icon: School, path: '/admin/school-types' },
  { title: 'Admin Users', icon: Users, path: '/admin/users' },
  { title: 'Audit Log', icon: ScrollText, path: '/admin/audit-log' },
];

export const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 flex flex-col w-56 bg-sidebar border-r border-sidebar-border transition-colors duration-300"
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
        <p className="text-sidebar-foreground font-bold text-sm leading-tight">ECI Admin</p>
        <p className="text-xs mt-0.5 opacity-60 text-sidebar-foreground">
          Platform Operations Console
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
   
        <ul className="space-y-0.5">
          {adminNavItems.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground opacity-70 hover:opacity-100 hover:bg-sidebar-accent/50'
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'inherit'}`}
                  />
                  <span>{item.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle & User */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-4">
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
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback
              className="text-xs font-semibold bg-primary/20 text-primary"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate leading-tight">{user.name}</p>
            <p className="text-xs truncate text-sidebar-foreground opacity-50">
              Platform Admin
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                title="Sign out"
                className="shrink-0 p-1.5 rounded text-sidebar-foreground opacity-50 hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-popover border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Are you sure you want to sign out?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  You will need to enter your credentials again to access the admin console.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary text-secondary-foreground border-border">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleLogout}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </aside>
  );
};
