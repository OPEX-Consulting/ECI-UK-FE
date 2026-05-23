import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useOnboarding } from '@/contexts/OnboardingContext';
import api from '@/lib/api';
import { classificationService, ClassificationSummaryResponse } from '@/services/school/classificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  AlertCircle,
  Shield,
  Building2,
  GraduationCap,
  ListChecks,
  Gauge,
} from 'lucide-react';

interface ActivationResponse {
  message: string;
  dashboard_unlocked: boolean;
  generated: {
    tasks: number;
    training_requirements: string[];
    frameworks: string[];
    risk_weighting: string;
  };
}

const ReviewActivation = () => {
  const { state, nextStep } = useOnboarding();
  const navigate = useNavigate();
  const [isActivating, setIsActivating] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [activationError, setActivationError] = useState('');
  const [activationResult, setActivationResult] = useState<ActivationResponse | null>(null);

  // Fetch the real classification summary from the backend
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useQuery<ClassificationSummaryResponse>({
    queryKey: ['classification-summary'],
    queryFn: () => classificationService.getSummary(),
    retry: 1,
  });

  const handleActivate = async () => {
    setIsActivating(true);
    setActivationError('');

    try {
      const response = await api.post<ActivationResponse>('/school/activate');
      setActivationResult(response.data);
      setIsActivated(true);
      setTimeout(() => {
        nextStep();
        navigate('/dashboard');
      }, 4000);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const parsedDetail = Array.isArray(detail) ? detail[0]?.msg : detail;
      setActivationError(
        parsedDetail || err.response?.data?.message || err.message || 'Failed to activate. Please try again.'
      );
    } finally {
      setIsActivating(false);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // ── Success state ────────────────────────────────────────────────────────
  if (isActivated) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-green-700">
            Account Activated!
          </h1>
          <p className="text-muted-foreground text-lg">
            {activationResult?.message || 'Your compliance environment has been successfully configured.'}
          </p>
        </div>

        {/* Activation summary details */}
        {activationResult?.generated && (
          <Card className="border-green-200 shadow-md">
            <CardContent className="pt-6 space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex justify-center">
                    <ListChecks className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{activationResult.generated.tasks}</p>
                  <p className="text-xs text-muted-foreground">Tasks Created</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{activationResult.generated.frameworks.length}</p>
                  <p className="text-xs text-muted-foreground">Frameworks</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-center">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <p className={`text-sm font-semibold capitalize px-2 py-0.5 rounded-full border inline-block ${getRiskBadgeColor(activationResult.generated.risk_weighting)}`}>
                    {activationResult.generated.risk_weighting}
                  </p>
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                </div>
              </div>

              <Separator />

              {/* Training requirements */}
              {activationResult.generated.training_requirements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Training Requirements Assigned
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activationResult.generated.training_requirements.map((req, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100"
                      >
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground animate-pulse">
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

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
            <span className="font-semibold text-sm uppercase tracking-wider">
              Ready to Activate
            </span>
          </div>
          <CardTitle className="text-2xl">Compliance Profile Summary</CardTitle>
          <CardDescription>
            {summary?.message ||
              "Based on your answers, we've identified the following compliance obligations."}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* ── Loading state ── */}
          {isSummaryLoading && (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                Generating your compliance profile...
              </p>
            </div>
          )}

          {/* ── Error state ── */}
          {isSummaryError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(summaryError as any)?.response?.data?.detail ||
                  'Failed to load classification summary. You can still activate your account.'}
              </AlertDescription>
            </Alert>
          )}

          {/* ── Summary data ── */}
          {summary && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Regulators */}
              {summary.regulators && summary.regulators.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Regulatory Bodies
                  </h3>
                  <ul className="space-y-2">
                    {summary.regulators.map((regulator, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-2.5 rounded border border-blue-100"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        {regulator}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* High Risk Focus Areas */}
              {summary.high_risk_focus_areas &&
                summary.high_risk_focus_areas.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      High Priority Focus Areas
                    </h3>
                    <div className="space-y-2">
                      {summary.high_risk_focus_areas.map((area, i) => (
                        <p
                          key={i}
                          className="text-sm bg-amber-50 p-2.5 rounded border border-amber-100 text-amber-800"
                        >
                          {area}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              {/* Identified Frameworks */}
              {summary.frameworks && summary.frameworks.length > 0 && (
                <div className="space-y-3 md:col-span-2">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Applicable Frameworks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.frameworks.map((fw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-sm bg-slate-50 px-3 py-1.5 rounded-full border"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* ── Organization Details ── */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Organization Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{state.organization.name || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Domain:</span>
                <p className="font-medium">{state.organization.domain || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Country:</span>
                <p className="font-medium">{state.organization.country || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Region:</span>
                <p className="font-medium">{state.organization.region || '—'}</p>
              </div>
            </div>
          </div>

          {/* ── Activation error ── */}
          {activationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{activationError}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50 pt-6">
          <Button
            size="lg"
            className="w-full text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={handleActivate}
            disabled={isActivating || isSummaryLoading}
          >
            {isActivating ? (
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
        By activating, you agree to our Terms of Service and Data Processing
        Agreement tailored for educational institutions.
      </p>
    </div>
  );
};

export default ReviewActivation;
