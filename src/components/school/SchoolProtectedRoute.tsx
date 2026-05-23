import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface SchoolProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protects school-side routes (dashboard, report, etc.).
 * Redirects unauthenticated users to /login.
 * Redirects platform admins (role === 'admin') to /admin/dashboard.
 */
export const SchoolProtectedRoute = ({ children }: SchoolProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Platform admins don't belong on the school dashboard
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};
