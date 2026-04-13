import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportIncident from "./pages/ReportIncident";
import MyReports from "./pages/MyReports";
import IncidentDetail from "./pages/IncidentDetail";
import ReviewIncident from "./pages/ReviewIncident";
import ReviewQueue from "./pages/ReviewQueue";
import AllIncidents from "./pages/AllIncidents";
import ComplianceDashboard from "./pages/ComplianceDashboard";
import UsersPage from "./pages/UsersPage";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

import { OnboardingProvider } from "@/contexts/OnboardingContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import SignUp from "@/pages/onboarding/SignUp";
import EmailVerification from "@/pages/onboarding/EmailVerification";
import OrganizationSetup from "@/pages/onboarding/OrganizationSetup";
import ComplianceWizard from "@/pages/onboarding/ComplianceWizard";
import ReviewActivation from "@/pages/onboarding/ReviewActivation";

import { TaskProvider } from "@/contexts/TaskContext";
import { FrameworkProvider } from "@/contexts/FrameworkContext";
import TaskManager from "@/pages/TaskManager";
import Frameworks from "@/pages/Frameworks";

import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

// Admin
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminFrameworks from "@/pages/admin/AdminFrameworks";
import AdminNewFramework from "@/pages/admin/AdminNewFramework";
import AdminOrganisations from "@/pages/admin/AdminOrganisations";
import AdminOrgDetail from "@/pages/admin/AdminOrgDetail";
import AdminSchoolTypes from "@/pages/admin/AdminSchoolTypes";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAuditLog from "@/pages/admin/AdminAuditLog";
import AdminLogin from "@/pages/admin/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="eci-admin-theme">
      <AuthProvider>
        <TaskProvider>
          <FrameworkProvider>
            <OnboardingProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Onboarding Routes */}
                    <Route path="/onboarding" element={<OnboardingLayout />}>
                      <Route index element={<SignUp />} />
                      <Route path="signup" element={<SignUp />} />
                      <Route path="verify" element={<EmailVerification />} />
                      <Route
                        path="organization"
                        element={<OrganizationSetup />}
                      />
                      <Route path="compliance" element={<ComplianceWizard />} />
                      <Route path="review" element={<ReviewActivation />} />
                    </Route>

                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<TaskManager />} />
                    <Route path="/frameworks" element={<Frameworks />} />
                    <Route
                      path="/frameworks/:frameworkId/tasks"
                      element={<TaskManager />}
                    />
                    <Route path="/report" element={<ReportIncident />} />
                    <Route path="/my-reports" element={<MyReports />} />
                    <Route path="/incident/:id" element={<IncidentDetail />} />
                    <Route path="/review" element={<ReviewQueue />} />
                    <Route path="/review/:id" element={<ReviewIncident />} />
                    <Route path="/incidents" element={<AllIncidents />} />
                    <Route
                      path="/compliance"
                      element={<ComplianceDashboard />}
                    />
                    <Route path="/users" element={<UsersPage />} />

                    {/* Admin Routes — protected, role=admin only */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminDashboard />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/frameworks"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminFrameworks />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/frameworks/new"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminNewFramework />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/organisations"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminOrganisations />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/organisations/:id"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminOrgDetail />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/school-types"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminSchoolTypes />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminUsers />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/audit-log"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminAuditLog />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </OnboardingProvider>
          </FrameworkProvider>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
