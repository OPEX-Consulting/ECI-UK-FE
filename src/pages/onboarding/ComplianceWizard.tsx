import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { classificationService, buildStepPayload } from '@/services/school/classificationService';
import { toHumanReadableError } from '@/lib/errorMessages';

const UI_LABELS: Record<string, string> = {
  la_maintained: "Local Authority Maintained",
  academy_trust: "Multi-Academy Trust (MAT)",
  single_academy: "Single Academy Trust",
  proprietor: "Independent Proprietor",
  early_years: "Early Years (0\u20135)",
  primary: "Primary (5\u201311)",
  secondary: "Secondary (11\u201316)",
  sixth_form: "Sixth Form (16\u201318)",
  sen: "SEN Provision",
  boarding: "Residential / Boarding",
  pupil_referral: "Pupil Referral / AP",
  international: "International Students",
  ey_attached: "Early Years Attached",
  transport: "School Transport",
  remote_learning: "Online / Remote Learning",
  cctv: "CCTV in Use",
  placements: "Work Placements",
  biometrics: "Biometric Systems",
  data_heavy: "Data Heavy Systems",
};

const STEPS = [
  { id: 'schoolType', title: 'School Type', description: 'What type of educational institution are you?' },
  { id: 'fundingType', title: 'Funding & Governance', description: 'How is your institution funded and governed?' },
  { id: 'ageRanges', title: 'Age Ranges', description: 'What age groups do you serve?' },
  { id: 'specialProvisions', title: 'Special Provision', description: 'Do you offer any specialized provision?' },
  { id: 'operationalActivities', title: 'Operational Activities', description: 'Select all operational activities that apply.' },
];

const ComplianceWizard = () => {
  const { state, updateCompliance, nextStep, prevStep } = useOnboarding();
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Guard: redirect to organisation setup if not completed
  useEffect(() => {
    if (!state.organization.name) {
      navigate('/onboarding/organization', { replace: true });
    }
  }, []);

  // Fetch school types dynamically from database using the school-facing endpoint
  const { data: apiSchoolTypes, isLoading: isLoadingSchoolTypes } = useQuery({
    queryKey: ['school-types'],
    queryFn: () => classificationService.getSchoolTypes(0, 100),
    retry: 1, // Let it retry once since this is a public/school endpoint now
  });
  console.log("apiSchoolTypes:", apiSchoolTypes);

  // Fetch startup mappings dynamically
  const { data: startupData, isLoading: isLoadingStartup } = useQuery({
    queryKey: ['startup-data'],
    queryFn: () => classificationService.getStartupData(0, 100),
    retry: 1,
  });
  console.log("startupData from API:", JSON.stringify(startupData, null, 2));

  // Local state for current step inputs (synced with context on navigation)
  const [schoolType, setSchoolType] = useState(state.compliance.schoolType);
  const [fundingType, setFundingType] = useState(state.compliance.fundingType);
  const [ageRanges, setAgeRanges] = useState<string[]>(state.compliance.ageRanges);
  const [specialProvisions, setSpecialProvisions] = useState<string[]>(state.compliance.specialProvisions);
  const [operationalActivities, setOperationalActivities] = useState<string[]>(state.compliance.operationalActivities);

  // Synchronize state.compliance.schoolType if it was set elsewhere
  useEffect(() => {
    if (state.compliance.schoolType && !schoolType) {
      setSchoolType(state.compliance.schoolType);
    }
  }, [state.compliance.schoolType]);

  // If schoolType state is empty and apiSchoolTypes is loaded, automatically set first active school type
  useEffect(() => {
    if (!schoolType && apiSchoolTypes && apiSchoolTypes.length > 0) {
      const activeTypes = apiSchoolTypes.filter(st => st.status.toLowerCase() === 'active');
      if (activeTypes.length > 0) {
        setSchoolType(activeTypes[0].id);
      }
    }
  }, [apiSchoolTypes, schoolType]);

  const activeStep = STEPS[activeStepIndex];

  const handleNext = async () => {
    setError('');

    const currentStepId = activeStep.id;

    // Save current step data to context
    updateCompliance({
      schoolType,
      fundingType,
      ageRanges,
      specialProvisions,
      operationalActivities,
    });

    setIsLoading(true);

    try {
      console.log("--- Step", activeStepIndex + 1, "---");
      console.log("Selected values:", {
        schoolType,
        fundingType,
        ageRanges,
        specialProvisions,
        operationalActivities,
      });
      const payload = buildStepPayload(currentStepId, {
        schoolType,
        fundingType,
        ageRanges,
        specialProvisions,
        operationalActivities,
      }, startupData);
      console.log("Payload being sent:", JSON.stringify(payload, null, 2));

      // POST this step to the API (step is 1-indexed)
      await classificationService.saveStep({
        step: activeStepIndex + 1,
        payload,
      });

      if (activeStepIndex < STEPS.length - 1) {
        setActiveStepIndex(prev => prev + 1);
      } else {
        // All steps done — move to Review/Activate
        nextStep();
        navigate('/onboarding/review');
      }
    } catch (err: any) {
      console.error("Step save error:", JSON.stringify(err.response?.data, null, 2), err.response?.status);
      setError(toHumanReadableError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    } else {
      prevStep(); // Go back to Org Setup
      navigate('/onboarding/organization');
    }
  };

  // Helper to toggle array items
  const toggleItem = (item: string, currentList: string[], setter: (list: string[]) => void) => {
    if (currentList.includes(item)) {
      setter(currentList.filter(i => i !== item));
    } else {
      setter([...currentList, item]);
    }
  };

  const renderStepContent = () => {
    switch (activeStep.id) {
      case 'schoolType':
        if (isLoadingSchoolTypes) {
          return (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Loading available school classifications...</p>
            </div>
          );
        }

        const activeTypes = (apiSchoolTypes || []).filter(
          (st) => st.status.toLowerCase() === "active"
        );

        const options = activeTypes.length > 0
          ? activeTypes.map((st) => ({
              value: st.id,
              label: st.name,
              desc: st.description,
            }))
          : [
              {
                value: "bb15c2af-ecd7-4330-826c-5e888f4c8401",
                label: "Academy / Free School",
                desc: "State-funded but independent of local authority",
              },
            ];

        return (
          <RadioGroup value={schoolType} onValueChange={setSchoolType} className="space-y-3">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "rounded-md border p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                  schoolType === option.value && "border-primary bg-accent/40"
                )}
                onClick={() => setSchoolType(option.value)}
              >
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex-1 cursor-pointer">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        );

      case 'fundingType': {
        if (isLoadingStartup) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
        const groupData = startupData?.find(g => g.group === 'funding_governance')?.data || {};
        const fundingOptions = Object.keys(groupData).map(k => ({ value: k, label: UI_LABELS[k] || k }));
        return (
          <RadioGroup value={fundingType} onValueChange={setFundingType} className="space-y-3">
            {fundingOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                  fundingType === option.value && "border-primary bg-accent/40"
                )}
                onClick={() => setFundingType(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 font-medium cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      }

      case 'ageRanges': {
        if (isLoadingStartup) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
        const groupData = startupData?.find(g => g.group === 'age_ranges')?.data || {};
        const ageOptions = Object.keys(groupData).map(k => ({ value: k, label: UI_LABELS[k] || k }));
        return (
          <div className="space-y-3">
            {ageOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer transition-colors",
                  ageRanges.includes(option.value) && "border-primary bg-accent/40"
                )}
                onClick={() => toggleItem(option.value, ageRanges, setAgeRanges)}
              >
                <Checkbox
                  id={option.value}
                  checked={ageRanges.includes(option.value)}
                  onCheckedChange={() => {}} // Controlled by outer div onClick
                />
                <div className="space-y-1 leading-none select-none">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'specialProvisions': {
        if (isLoadingStartup) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
        const groupData = startupData?.find(g => g.group === 'special_provisions')?.data || {};
        const specialOptions = Object.keys(groupData).map(k => ({ value: k, label: UI_LABELS[k] || k }));
        return (
          <div className="space-y-3">
            {specialOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer transition-colors",
                  specialProvisions.includes(option.value) && "border-primary bg-accent/40"
                )}
                onClick={() => toggleItem(option.value, specialProvisions, setSpecialProvisions)}
              >
                <Checkbox
                  id={option.value}
                  checked={specialProvisions.includes(option.value)}
                  onCheckedChange={() => {}} // Controlled by outer div onClick
                />
                <div className="space-y-1 leading-none select-none">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'operationalActivities': {
        if (isLoadingStartup) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
        const groupData = startupData?.find(g => g.group === 'operational_activities')?.data || {};
        const opOptions = Object.keys(groupData).map(k => ({ value: k, label: UI_LABELS[k] || k }));
        return (
          <div className="space-y-3">
            {opOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer transition-colors",
                  operationalActivities.includes(option.value) && "border-primary bg-accent/40"
                )}
                onClick={() => toggleItem(option.value, operationalActivities, setOperationalActivities)}
              >
                <Checkbox
                  id={option.value}
                  checked={operationalActivities.includes(option.value)}
                  onCheckedChange={() => {}} // Controlled by outer div onClick
                />
                <div className="space-y-1 leading-none select-none">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep.id) {
      case 'schoolType':
        return !!schoolType;
      case 'fundingType':
        return !!fundingType;
      case 'ageRanges':
        return ageRanges.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Compliance Classification</h1>
        <p className="text-muted-foreground">
          Help us tailor the compliance framework to your institution.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {activeStepIndex + 1} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
              Required
            </span>
          </div>
          <CardTitle>{activeStep.title}</CardTitle>
          <CardDescription>
            {activeStep.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={isLoading}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={!isStepValid() || isLoading || (activeStep.id === 'schoolType' && isLoadingSchoolTypes)}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {activeStepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Visual Step Indicator */}
      <div className="flex justify-center gap-2">
        {STEPS.map((_, index) => (
          <div 
            key={index} 
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              index === activeStepIndex ? "bg-primary" : "bg-slate-200"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default ComplianceWizard;
