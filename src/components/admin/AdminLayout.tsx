import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      <AdminSidebar />
      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-56 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
};
