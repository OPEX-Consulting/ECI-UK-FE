import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'schoolType', title: 'School Type', description: 'What type of educational institution are you?' },
  { id: 'fundingType', title: 'Funding & Governance', description: 'How is your institution funded and governed?' },
  { id: 'ageRanges', title: 'Age Ranges', description: 'What age groups do you serve?' },
  { id: 'specialProvisions', title: 'Special Provision', description: 'Do you offer any specialized provision?' },
  { id: 'operationalActivities', title: 'Operational Activities', description: 'Select all operational activities that apply.' },
];

const STANDARD_SCHOOL_TYPES = ['maintained', 'academy', 'independent', 'special', 'alternative'];

const ComplianceWizard = () => {
  const { state, updateCompliance, nextStep, prevStep } = useOnboarding();
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state handles "other" values correctly
  const initialSchoolType = state.compliance.schoolType;
  const isOtherType = initialSchoolType && !STANDARD_SCHOOL_TYPES.includes(initialSchoolType);

  // Local state for current step inputs (synced with context on navigation)
  const [schoolType, setSchoolType] = useState(isOtherType ? 'other' : initialSchoolType);
  const [otherSchoolType, setOtherSchoolType] = useState(isOtherType ? initialSchoolType : '');
  
  const [fundingType, setFundingType] = useState(state.compliance.fundingType);
  const [ageRanges, setAgeRanges] = useState<string[]>(state.compliance.ageRanges);
  const [specialProvisions, setSpecialProvisions] = useState<string[]>(state.compliance.specialProvisions);
  const [operationalActivities, setOperationalActivities] = useState<string[]>(state.compliance.operationalActivities);

  const activeStep = STEPS[activeStepIndex];

  const handleNext = () => {
    // Save current step data to context
    updateCompliance({
      schoolType: schoolType === 'other' ? otherSchoolType : schoolType,
      fundingType,
      ageRanges,
      specialProvisions,
      operationalActivities,
    });

    if (activeStepIndex < STEPS.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    } else {
      // Completed wizard
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        nextStep(); // Move to Review/Activate
        navigate('/onboarding/review');
      }, 500);
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
        return (
          <RadioGroup value={schoolType} onValueChange={setSchoolType} className="space-y-3">
            {[
              { value: 'maintained', label: 'State-funded (Maintained)', desc: 'Funded by local authority' },
              { value: 'academy', label: 'Academy / Free School', desc: 'State-funded but independent of local authority' },
              { value: 'independent', label: 'Independent (Private)', desc: 'Fee-paying schools' },
              { value: 'special', label: 'Special School', desc: 'For students with special educational needs' },
              { value: 'alternative', label: 'Alternative Provision', desc: 'Education outside of school settings' },
              { value: 'other', label: 'Other', desc: 'None of the above' }
            ].map((option) => (
              <div key={option.value} className=" rounded-md border p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors" onClick={() => setSchoolType(option.value)}>
                <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1 cursor-pointer">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">{option.label}</Label>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                </div>
                {/* Render Input if 'Other' is selected */}
                {option.value === 'other' && schoolType === 'other' && (
                    <div className="mt-3 pl-7" onClick={(e) => e.stopPropagation()}>
                        <Label htmlFor="other-type" className="sr-only">Specify School Type</Label>
                        <Input 
                            id="other-type"
                            placeholder="Please specify..." 
                            value={otherSchoolType}
                            onChange={(e) => setOtherSchoolType(e.target.value)}
                            className="bg-background"
                            autoFocus
                        />
                    </div>
                )}
              </div>
            ))}
          </RadioGroup>
        );
      case 'fundingType':
        return (
          <RadioGroup value={fundingType} onValueChange={setFundingType} className="space-y-3">
            {[
              { value: 'la_maintained', label: 'Local Authority Maintained' },
              { value: 'academy_trust', label: 'Multi-Academy Trust (MAT)' },
              { value: 'single_academy', label: 'Single Academy Trust' },
              { value: 'proprietor', label: 'Independent Proprietor body' },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors" onClick={() => setFundingType(option.value)}>
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 font-medium cursor-pointer">{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'ageRanges':
        return (
          <div className="space-y-3">
            {[
              { value: 'early_years', label: 'Early Years (0–5)' },
              { value: 'primary', label: 'Primary (5–11)' },
              { value: 'secondary', label: 'Secondary (11–16)' },
              { value: 'sixth_form', label: 'Sixth Form (16–18)' },
            ].map((option) => (
              <div key={option.value} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <Checkbox 
                  id={option.value} 
                  checked={ageRanges.includes(option.value)}
                  onCheckedChange={() => toggleItem(option.value, ageRanges, setAgeRanges)}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">{option.label}</Label>
                </div>
              </div>
            ))}
          </div>
        );
      case 'specialProvisions':
        return (
          <div className="space-y-3">
            {[
              { value: 'sen', label: 'SEN Provision' },
              { value: 'boarding', label: 'Residential / Boarding' },
              { value: 'pupil_referral', label: 'Pupil Referral / AP' },
              { value: 'international', label: 'International Students' },
              { value: 'ey_attached', label: 'Early Years Attached Provision' },
            ].map((option) => (
              <div key={option.value} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <Checkbox 
                  id={option.value}
                  checked={specialProvisions.includes(option.value)}
                  onCheckedChange={() => toggleItem(option.value, specialProvisions, setSpecialProvisions)}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">{option.label}</Label>
                </div>
              </div>
            ))}
          </div>
        );
      case 'operationalActivities':
        return (
          <div className="space-y-3">
            {[
              { value: 'transport', label: 'School Transport' },
              { value: 'remote_learning', label: 'Online / Remote Learning' },
              { value: 'cctv', label: 'CCTV in Use' },
              { value: 'placements', label: 'Work Placements' },
              { value: 'biometrics', label: 'Biometric Systems' },
            ].map((option) => (
              <div key={option.value} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <Checkbox 
                  id={option.value}
                  checked={operationalActivities.includes(option.value)}
                  onCheckedChange={() => toggleItem(option.value, operationalActivities, setOperationalActivities)}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">{option.label}</Label>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep.id) {
      case 'schoolType': 
        if (schoolType === 'other') return !!otherSchoolType && otherSchoolType.trim().length > 0;
        return !!schoolType;
      case 'fundingType': return !!fundingType;
      case 'ageRanges': return ageRanges.length > 0;
      // Others are optional or multi-select without mandatory requirement in PRD, but let's assume at least one is NOT required for special/ops
      default: return true;
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
        <CardContent className="min-h-[300px]">
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={!isStepValid() || isLoading}>
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
