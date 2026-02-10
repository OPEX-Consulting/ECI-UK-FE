import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, ShieldCheck, AlertTriangle, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ReviewActivation = () => {
  const { state, nextStep } = useOnboarding();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const handleActivate = () => {
    setIsLoading(true);
    // Simulate activation process
    setTimeout(() => {
      setIsLoading(false);
      setIsActivated(true);
      // After showing success state for a moment, redirect
      setTimeout(() => {
          nextStep(); // Ideally verify flow is done
          navigate('/dashboard'); 
      }, 2000);
    }, 2000);
  };

  if (isActivated) {
    return (
      <div className="text-center space-y-6 animate-in zoom-in duration-500">
        <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Account Activated!</h1>
        <p className="text-muted-foreground text-lg">
          Your compliance environment has been successfully configured.
        </p>
        <p className="text-sm text-muted-foreground">
            Redirecting to dashboard...
        </p>
      </div>
    );
  }

  // Derive insights from compliance state
  const getDetectedFrameworks = () => {
    const frameworks = ['KCSIE 2024', 'Health & Safety at Work Act'];
    if (state.compliance.schoolType === 'independent') frameworks.push('ISSR (Independent School Standards)');
    if (state.compliance.schoolType === 'academy') frameworks.push('Academy Trust Handbook');
    if (state.compliance.ageRanges.includes('early_years')) frameworks.push('EYFS Framework');
    if (state.compliance.specialProvisions.includes('boarding')) frameworks.push('NMS for Boarding Schools');
    return frameworks;
  };

  const frameworks = getDetectedFrameworks();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Review & Activate</h1>
        <p className="text-muted-foreground">
          Review your compliance profile before activating your account.
        </p>
      </div>

      <Card className="border-green-200 shadow-md">
        <CardHeader className="bg-green-50/50 pb-4">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-semibold text-sm uppercase tracking-wider">Ready to Activate</span>
          </div>
          <CardTitle className="text-2xl">Compliance Profile Summary</CardTitle>
          <CardDescription>
            Based on your answers, we've identified the following compliance obligations.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
            
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Applicable Frameworks
                    </h3>
                    <ul className="space-y-2">
                        {frameworks.map((fw, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 p-2 rounded border">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                {fw}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        High Priority Areas
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="bg-amber-50 p-2 rounded border border-amber-100 text-amber-800">
                            Safeguarding & Child Protection
                        </p>
                         <p className="bg-amber-50 p-2 rounded border border-amber-100 text-amber-800">
                            Health & Safety Compliance
                        </p>
                        {state.compliance.specialProvisions.includes('boarding') && (
                             <p className="bg-amber-50 p-2 rounded border border-amber-100 text-amber-800">
                                Boarding Standards
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-2">
                <h3 className="font-semibold text-sm">Organization Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-medium">{state.organization.name}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Domain:</span>
                        <p className="font-medium">{state.organization.domain}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{state.compliance.schoolType?.replace('_', ' ')}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Region:</span>
                        <p className="font-medium">{state.organization.country} {state.organization.region ? `- ${state.organization.region}` : ''}</p>
                    </div>
                </div>
            </div>

        </CardContent>
        <CardFooter className="bg-slate-50 pt-6">
          <Button size="lg" className="w-full text-lg shadow-lg hover:shadow-xl transition-all" onClick={handleActivate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Configuring Environment...
              </>
            ) : (
              'Activate Compliance Environment'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
        By activating, you agree to our Terms of Service and Data Processing Agreement tailored for educational institutions.
      </p>
    </div>
  );
};

export default ReviewActivation;
