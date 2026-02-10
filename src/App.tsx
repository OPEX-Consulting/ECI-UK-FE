import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import TaskManager from "@/pages/TaskManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TaskProvider>
        <OnboardingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                
                {/* Onboarding Routes */}
                <Route path="/onboarding" element={<OnboardingLayout />}>
                  <Route index element={<SignUp />} />
                  <Route path="signup" element={<SignUp />} />
                  <Route path="verify" element={<EmailVerification />} />
                  <Route path="organization" element={<OrganizationSetup />} />
                  <Route path="compliance" element={<ComplianceWizard />} />
                  <Route path="review" element={<ReviewActivation />} />
                </Route>

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<TaskManager />} />
                <Route path="/report" element={<ReportIncident />} />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/incident/:id" element={<IncidentDetail />} />
                <Route path="/review" element={<ReviewQueue />} />
                <Route path="/review/:id" element={<ReviewIncident />} />
                <Route path="/incidents" element={<AllIncidents />} />
                <Route path="/compliance" element={<ComplianceDashboard />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </OnboardingProvider>
      </TaskProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
