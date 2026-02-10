import { Outlet } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import edusafeLogo from '@/assets/edusafe-logo.jpg';

const OnboardingLayout = () => {
  const { state } = useOnboarding();
  
  // Calculate progress based on steps
  // Total steps:
  // 1: Signup
  // 2: Verification
  // 3: Organization
  // 4: Classification
  // 5: Review/Activate
  const progress = (state.currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link to="/">
            <img 
              src={edusafeLogo} 
              alt="EduSafe Compliance" 
              className="h-8 w-auto rounded"
            />
          </Link>
          <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">
            | Onboarding
          </span>
        </div>
        <div className="flex items-center gap-4">
           {/* Step Indicator */}
           <div className="text-sm font-medium text-slate-600">
            Step {state.currentStep} of 5
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-200">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-500">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} EduSafe Compliance Intelligence. All rights reserved.
      </footer>
    </div>
  );
};

export default OnboardingLayout;
