import { useAuth } from '@/contexts/AuthContext';
import { StaffDashboard } from './dashboards/StaffDashboard';
import { OfficerDashboard } from './dashboards/OfficerDashboard';
import { PrincipalDashboard } from './dashboards/PrincipalDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'staff':
      return <StaffDashboard />;
    case 'officer':
      return <OfficerDashboard />;
    case 'principal':
      return <PrincipalDashboard />;
    default:
      return <StaffDashboard />;
  }
};

export default Dashboard;
