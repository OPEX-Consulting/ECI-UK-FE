import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types based on PRD
export interface OrganizationDetails {
  name: string;
  domain: string;
  country: string;
  region?: string;
}

export interface ComplianceProfile {
  schoolType: string;
  fundingType: string;
  ageRanges: string[];
  specialProvisions: string[];
  operationalActivities: string[];
}

interface OnboardingState {
  currentStep: number;
  email: string;
  isEmailVerified: boolean;
  organization: OrganizationDetails;
  compliance: ComplianceProfile;
}

interface OnboardingContextType {
  state: OnboardingState;
  updateEmail: (email: string) => void;
  verifyEmail: () => void;
  updateOrganization: (details: OrganizationDetails) => void;
  updateCompliance: (profile: Partial<ComplianceProfile>) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  resetOnboarding: () => void;
}

const defaultState: OnboardingState = {
  currentStep: 1,
  email: '',
  isEmailVerified: false,
  organization: {
    name: '',
    domain: '',
    country: 'UK',
  },
  compliance: {
    schoolType: '',
    fundingType: '',
    ageRanges: [],
    specialProvisions: [],
    operationalActivities: [],
  },
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<OnboardingState>(defaultState);

  const updateEmail = (email: string) => {
    setState(prev => ({ ...prev, email }));
  };

  const verifyEmail = () => {
    setState(prev => ({ ...prev, isEmailVerified: true }));
  };

  const updateOrganization = (details: OrganizationDetails) => {
    setState(prev => ({ ...prev, organization: details }));
  };

  const updateCompliance = (profile: Partial<ComplianceProfile>) => {
    setState(prev => ({
      ...prev,
      compliance: { ...prev.compliance, ...profile }
    }));
  };

  const nextStep = () => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
  };

  const setStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const resetOnboarding = () => {
    setState(defaultState);
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        updateEmail,
        verifyEmail,
        updateOrganization,
        updateCompliance,
        nextStep,
        prevStep,
        setStep,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
