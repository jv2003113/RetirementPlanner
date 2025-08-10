import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { MultiStepFormProgress, User } from '@shared/schema';

// Step definitions
export const FORM_STEPS = {
  PERSONAL_INFO: 1,
  INCOME_INFO: 2,
  CURRENT_ASSETS: 3,
  LIABILITIES: 4,
  RETIREMENT_GOALS: 5,
  RISK_ASSESSMENT: 6,
  REVIEW: 7,
} as const;

export type FormStepType = typeof FORM_STEPS[keyof typeof FORM_STEPS];

// Combined form schema for all steps
const multiStepFormSchema = z.object({
  // Step 1: Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  currentAge: z.coerce.number().min(18, "Age must be at least 18").max(100, "Age must be less than 100"),
  targetRetirementAge: z.coerce.number().min(50, "Retirement age must be at least 50").max(100, "Retirement age must be less than 100"),
  currentLocation: z.string().optional(),
  maritalStatus: z.string().optional(),
  dependents: z.coerce.number().min(0, "Dependents cannot be negative").optional(),
  hasSpouse: z.boolean().default(false),
  spouseFirstName: z.string().optional(),
  spouseLastName: z.string().optional(),
  spouseCurrentAge: z.coerce.number().min(18).max(100).optional(),
  spouseTargetRetirementAge: z.coerce.number().min(50).max(100).optional(),

  // Step 2: Income Information  
  currentIncome: z.string().transform((val) => val === "" ? "0" : val),
  expectedFutureIncome: z.string().optional().transform((val) => val === "" ? "0" : val),
  spouseCurrentIncome: z.string().optional().transform((val) => val === "" ? "0" : val),
  spouseExpectedFutureIncome: z.string().optional().transform((val) => val === "" ? "0" : val),
  otherIncomeSource1: z.string().optional(),
  otherIncomeAmount1: z.string().optional(),
  otherIncomeSource2: z.string().optional(),
  otherIncomeAmount2: z.string().optional(),
  expectedIncomeGrowth: z.coerce.number().min(0).max(20).optional(),

  // Step 3: Current Assets
  savingsBalance: z.string().optional(),
  checkingBalance: z.string().optional(),
  investmentBalance: z.string().optional(),
  retirementAccount401k: z.string().optional(),
  retirementAccountIRA: z.string().optional(),
  retirementAccountRoth: z.string().optional(),
  realEstateValue: z.string().optional(),
  otherAssetsValue: z.string().optional(),

  // Step 4: Liabilities
  mortgageBalance: z.string().optional(),
  mortgagePayment: z.string().optional(),
  mortgageRate: z.coerce.number().optional(),
  mortgageYearsLeft: z.coerce.number().optional(),
  creditCardDebt: z.string().optional(),
  studentLoanDebt: z.string().optional(),
  otherDebt: z.string().optional(),
  totalMonthlyDebtPayments: z.string().optional(),

  // Step 5: Retirement Goals & Preferences
  desiredLifestyle: z.string().optional(),
  expectedAnnualExpenses: z.string().optional(),
  healthcareExpectations: z.string().optional(),
  travelPlans: z.string().optional(),
  legacyGoals: z.string().optional(),
  retirementLocation: z.string().optional(),

  // Step 6: Risk Assessment
  investmentExperience: z.string().optional(),
  riskTolerance: z.string().optional(),
  investmentTimeline: z.string().optional(),
  preferredInvestmentTypes: z.array(z.string()).optional(),
  marketVolatilityComfort: z.string().optional(),
  investmentRebalancingPreference: z.string().optional(),
});

export type MultiStepFormData = z.infer<typeof multiStepFormSchema>;

// Step validation schemas
export const stepSchemas = {
  [FORM_STEPS.PERSONAL_INFO]: multiStepFormSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    currentAge: true,
    targetRetirementAge: true,
    currentLocation: true,
    maritalStatus: true,
    dependents: true,
    hasSpouse: true,
    spouseFirstName: true,
    spouseLastName: true,
    spouseCurrentAge: true,
    spouseTargetRetirementAge: true,
  }),
  [FORM_STEPS.INCOME_INFO]: multiStepFormSchema.pick({
    currentIncome: true,
    expectedFutureIncome: true,
    spouseCurrentIncome: true,
    spouseExpectedFutureIncome: true,
    otherIncomeSource1: true,
    otherIncomeAmount1: true,
    otherIncomeSource2: true,
    otherIncomeAmount2: true,
    expectedIncomeGrowth: true,
  }),
  [FORM_STEPS.CURRENT_ASSETS]: multiStepFormSchema.pick({
    savingsBalance: true,
    checkingBalance: true,
    investmentBalance: true,
    retirementAccount401k: true,
    retirementAccountIRA: true,
    retirementAccountRoth: true,
    realEstateValue: true,
    otherAssetsValue: true,
  }),
  [FORM_STEPS.LIABILITIES]: multiStepFormSchema.pick({
    mortgageBalance: true,
    mortgagePayment: true,
    mortgageRate: true,
    mortgageYearsLeft: true,
    creditCardDebt: true,
    studentLoanDebt: true,
    otherDebt: true,
    totalMonthlyDebtPayments: true,
  }),
  [FORM_STEPS.RETIREMENT_GOALS]: multiStepFormSchema.pick({
    desiredLifestyle: true,
    expectedAnnualExpenses: true,
    healthcareExpectations: true,
    travelPlans: true,
    legacyGoals: true,
    retirementLocation: true,
  }),
  [FORM_STEPS.RISK_ASSESSMENT]: multiStepFormSchema.pick({
    investmentExperience: true,
    riskTolerance: true,
    investmentTimeline: true,
    preferredInvestmentTypes: true,
    marketVolatilityComfort: true,
    investmentRebalancingPreference: true,
  }),
  [FORM_STEPS.REVIEW]: multiStepFormSchema,
};

// Context type
interface MultiStepFormContextType {
  currentStep: FormStepType;
  completedSteps: FormStepType[];
  totalSteps: number;
  form: ReturnType<typeof useForm<MultiStepFormData>>;
  isLoading: boolean;
  progress: MultiStepFormProgress | null;
  isWizardMode: boolean;
  goToStep: (step: FormStepType) => void;
  navigateToStep: (step: FormStepType) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoToStep: (step: FormStepType) => boolean;
  isStepCompleted: (step: FormStepType) => boolean;
  validateCurrentStep: () => Promise<boolean>;
  saveProgress: () => Promise<void>;
  submitForm: () => Promise<void>;
  saveCurrentStep: () => Promise<void>;
  getStepTitle: (step: FormStepType) => string;
  getStepDescription: (step: FormStepType) => string;
}

const MultiStepFormContext = createContext<MultiStepFormContextType | null>(null);

export const useMultiStepForm = () => {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error('useMultiStepForm must be used within a MultiStepFormProvider');
  }
  return context;
};

interface MultiStepFormProviderProps {
  children: ReactNode;
  userId: number;
  isWizardMode?: boolean;
}

export const MultiStepFormProvider: React.FC<MultiStepFormProviderProps> = ({ children, userId, isWizardMode = false }) => {
  const [currentStep, setCurrentStep] = useState<FormStepType>(FORM_STEPS.PERSONAL_INFO);
  const [completedSteps, setCompletedSteps] = useState<FormStepType[]>([]);
  const { toast } = useToast();

  const totalSteps = Object.keys(FORM_STEPS).length;

  // Fetch existing user data
  const { data: userData } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  // Fetch form progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery<MultiStepFormProgress | null>({
    queryKey: [`/api/users/${userId}/multi-step-form-progress`],
  });

  // Initialize form
  const form = useForm<MultiStepFormData>({
    resolver: zodResolver(multiStepFormSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      currentAge: 0,
      targetRetirementAge: 65,
      hasSpouse: false,
      currentIncome: '0',
      expectedFutureIncome: '0',
      spouseCurrentIncome: '0',
      spouseExpectedFutureIncome: '0',
      savingsBalance: '0',
      checkingBalance: '0',
      investmentBalance: '0',
      retirementAccount401k: '0',
      retirementAccountIRA: '0',
      retirementAccountRoth: '0',
      realEstateValue: '0',
      otherAssetsValue: '0',
      mortgageBalance: '0',
      mortgagePayment: '0',
      creditCardDebt: '0',
      studentLoanDebt: '0',
      otherDebt: '0',
      totalMonthlyDebtPayments: '0',
      expectedAnnualExpenses: '0',
      preferredInvestmentTypes: [],
    },
  });

  // Load existing data into form
  useEffect(() => {
    if (userData) {
      form.reset({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        currentAge: userData.currentAge || 0,
        targetRetirementAge: userData.targetRetirementAge || 65,
        currentLocation: userData.currentLocation || '',
        maritalStatus: userData.maritalStatus || '',
        dependents: userData.dependents || 0,
        currentIncome: String(userData.currentIncome || '0'),
        expectedFutureIncome: String(userData.expectedFutureIncome || '0'),
        desiredLifestyle: userData.desiredLifestyle || '',
        hasSpouse: userData.hasSpouse || false,
        spouseFirstName: userData.spouseFirstName || '',
        spouseLastName: userData.spouseLastName || '',
        spouseCurrentAge: userData.spouseCurrentAge || undefined,
        spouseTargetRetirementAge: userData.spouseTargetRetirementAge || undefined,
        spouseCurrentIncome: String(userData.spouseCurrentIncome || '0'),
        spouseExpectedFutureIncome: String(userData.spouseExpectedFutureIncome || '0'),
        // Initialize other fields with default values
        otherIncomeSource1: '',
        otherIncomeAmount1: '0',
        otherIncomeSource2: '',
        otherIncomeAmount2: '0',
        expectedIncomeGrowth: 3,
        savingsBalance: '0',
        checkingBalance: '0',
        investmentBalance: '0',
        retirementAccount401k: '0',
        retirementAccountIRA: '0',
        retirementAccountRoth: '0',
        realEstateValue: '0',
        otherAssetsValue: '0',
        mortgageBalance: '0',
        mortgagePayment: '0',
        mortgageRate: 4.5,
        mortgageYearsLeft: 30,
        creditCardDebt: '0',
        studentLoanDebt: '0',
        otherDebt: '0',
        totalMonthlyDebtPayments: '0',
        expectedAnnualExpenses: '0',
        healthcareExpectations: '',
        travelPlans: '',
        legacyGoals: '',
        retirementLocation: '',
        investmentExperience: '',
        riskTolerance: '',
        investmentTimeline: '',
        preferredInvestmentTypes: [],
        marketVolatilityComfort: '',
        investmentRebalancingPreference: '',
      });
    }
  }, [userData, form]);

  // Load progress state - ONLY on initial load, not on every change
  const [hasLoadedInitialProgress, setHasLoadedInitialProgress] = useState(false);
  
  useEffect(() => {
    if (progress && !hasLoadedInitialProgress) {
      // Only load from database once
      setCurrentStep(progress.currentStep as FormStepType);
      setCompletedSteps(progress.completedSteps as FormStepType[]);
      setHasLoadedInitialProgress(true);
      
      // Load saved form data if exists
      if (progress.formData && typeof progress.formData === 'object') {
        const savedFormData = progress.formData as Partial<MultiStepFormData>;
        form.reset({ ...form.getValues(), ...savedFormData });
      }
    }
  }, [progress, form, hasLoadedInitialProgress]);

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (data: Partial<MultiStepFormProgress>) => {
      return await apiRequest('POST', `/api/users/${userId}/multi-step-form-progress`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/multi-step-form-progress`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return await apiRequest('PATCH', `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({
        title: "Success",
        description: "Your retirement plan has been saved successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your retirement plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Utility functions
  const getStepTitle = (step: FormStepType): string => {
    const titles = {
      [FORM_STEPS.PERSONAL_INFO]: "Personal Information",
      [FORM_STEPS.INCOME_INFO]: "Income Information",
      [FORM_STEPS.CURRENT_ASSETS]: "Current Assets",
      [FORM_STEPS.LIABILITIES]: "Liabilities & Debts",
      [FORM_STEPS.RETIREMENT_GOALS]: "Retirement Goals & Lifestyle",
      [FORM_STEPS.RISK_ASSESSMENT]: "Investment Risk Assessment",
      [FORM_STEPS.REVIEW]: isWizardMode ? "Review & Submit Plan" : "Summary",
    };
    return titles[step];
  };

  const getStepDescription = (step: FormStepType): string => {
    const wizardDescriptions = {
      [FORM_STEPS.PERSONAL_INFO]: "Tell us about yourself and your family to get started",
      [FORM_STEPS.INCOME_INFO]: "Share your current and expected future income details",
      [FORM_STEPS.CURRENT_ASSETS]: "Let us know about your savings, investments, and assets",
      [FORM_STEPS.LIABILITIES]: "Tell us about your debts and monthly financial obligations",
      [FORM_STEPS.RETIREMENT_GOALS]: "Describe your retirement dreams and lifestyle expectations",
      [FORM_STEPS.RISK_ASSESSMENT]: "Help us understand your investment preferences and risk tolerance",
      [FORM_STEPS.REVIEW]: "Review all your information before submitting your retirement plan",
    };
    
    const editDescriptions = {
      [FORM_STEPS.PERSONAL_INFO]: "Update your personal and family information",
      [FORM_STEPS.INCOME_INFO]: "Manage your current and expected future income",
      [FORM_STEPS.CURRENT_ASSETS]: "Update your savings, investments, and asset information",
      [FORM_STEPS.LIABILITIES]: "Review and update your debts and monthly obligations",
      [FORM_STEPS.RETIREMENT_GOALS]: "Adjust your retirement goals and lifestyle preferences",
      [FORM_STEPS.RISK_ASSESSMENT]: "Update your investment preferences and risk tolerance",
      [FORM_STEPS.REVIEW]: "Review and verify all your retirement planning information",
    };
    
    const descriptions = isWizardMode ? wizardDescriptions : editDescriptions;
    return descriptions[step];
  };

  const canGoToStep = (step: FormStepType): boolean => {
    // In edit mode (not wizard mode), can go to any step
    if (!isWizardMode) return true;
    
    // In wizard mode, follow the original logic
    // Can always go to step 1
    if (step === FORM_STEPS.PERSONAL_INFO) return true;
    
    // Can go to any previously completed step
    if (completedSteps.includes(step)) return true;
    
    // Can go to the next step if all previous steps are completed
    const previousStep = step - 1;
    return completedSteps.includes(previousStep as FormStepType);
  };

  const isStepCompleted = (step: FormStepType): boolean => {
    return completedSteps.includes(step);
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const stepSchema = stepSchemas[currentStep];
    const currentData = form.getValues();
    
    try {
      stepSchema.parse(currentData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set form errors
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            form.setError(err.path[0] as keyof MultiStepFormData, {
              message: err.message,
            });
          }
        });
      }
      return false;
    }
  };

  const saveProgress = async (): Promise<void> => {
    const formData = form.getValues();
    await saveProgressMutation.mutateAsync({
      userId,
      currentStep,
      completedSteps,
      formData,
      isCompleted: false,
    });
  };

  const goToStep = (step: FormStepType): void => {
    if (canGoToStep(step)) {
      setCurrentStep(step);
    }
  };

  const navigateToStep = (step: FormStepType): void => {
    if (canGoToStep(step)) {
      setCurrentStep(step);
    }
  };

  const nextStep = async (): Promise<void> => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Mark current step as completed
    const newCompletedSteps = Array.from(new Set([...completedSteps, currentStep]));
    setCompletedSteps(newCompletedSteps);

    // Move to next step
    const nextStepNumber = currentStep + 1;
    if (nextStepNumber <= totalSteps) {
      setCurrentStep(nextStepNumber as FormStepType);
    }

    // Save progress
    await saveProgressMutation.mutateAsync({
      userId,
      currentStep: nextStepNumber <= totalSteps ? (nextStepNumber as FormStepType) : currentStep,
      completedSteps: newCompletedSteps,
      formData: form.getValues(),
      isCompleted: false,
    });
  };

  const prevStep = (): void => {
    const prevStepNumber = currentStep - 1;
    if (prevStepNumber >= 1) {
      setCurrentStep(prevStepNumber as FormStepType);
      saveProgress();
    }
  };

  const saveCurrentStep = async (): Promise<void> => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    const formData = form.getValues();
    
    // Convert form data to user update format
    const userUpdateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      currentAge: formData.currentAge,
      targetRetirementAge: formData.targetRetirementAge,
      currentLocation: formData.currentLocation,
      maritalStatus: formData.maritalStatus,
      dependents: formData.dependents,
      currentIncome: formData.currentIncome,
      expectedFutureIncome: formData.expectedFutureIncome,
      desiredLifestyle: formData.desiredLifestyle,
      hasSpouse: formData.hasSpouse,
      spouseFirstName: formData.spouseFirstName,
      spouseLastName: formData.spouseLastName,
      spouseCurrentAge: formData.spouseCurrentAge,
      spouseTargetRetirementAge: formData.spouseTargetRetirementAge,
      spouseCurrentIncome: formData.spouseCurrentIncome,
      spouseExpectedFutureIncome: formData.spouseExpectedFutureIncome,
    };

    // Update user data
    await updateUserMutation.mutateAsync(userUpdateData);
    
    // Mark current step as completed
    const newCompletedSteps = Array.from(new Set([...completedSteps, currentStep]));
    setCompletedSteps(newCompletedSteps);

    // Navigate to review screen after saving (only in edit mode)
    const finalStep = !isWizardMode ? FORM_STEPS.REVIEW : currentStep;
    
    // Save progress
    await saveProgressMutation.mutateAsync({
      userId,
      currentStep: finalStep,
      completedSteps: newCompletedSteps,
      formData,
      isCompleted: false,
    });

    // Set current step to review in edit mode
    if (!isWizardMode) {
      setCurrentStep(FORM_STEPS.REVIEW);
    }
  };

  const submitForm = async (): Promise<void> => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    const formData = form.getValues();
    
    // Convert form data to user update format
    const userUpdateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      currentAge: formData.currentAge,
      targetRetirementAge: formData.targetRetirementAge,
      currentLocation: formData.currentLocation,
      maritalStatus: formData.maritalStatus,
      dependents: formData.dependents,
      currentIncome: formData.currentIncome,
      expectedFutureIncome: formData.expectedFutureIncome,
      desiredLifestyle: formData.desiredLifestyle,
      hasSpouse: formData.hasSpouse,
      spouseFirstName: formData.spouseFirstName,
      spouseLastName: formData.spouseLastName,
      spouseCurrentAge: formData.spouseCurrentAge,
      spouseTargetRetirementAge: formData.spouseTargetRetirementAge,
      spouseCurrentIncome: formData.spouseCurrentIncome,
      spouseExpectedFutureIncome: formData.spouseExpectedFutureIncome,
    };

    // Update user data
    await updateUserMutation.mutateAsync(userUpdateData);

    // Mark form as completed
    await saveProgressMutation.mutateAsync({
      userId,
      currentStep,
      completedSteps: Array.from(new Set([...completedSteps, currentStep])),
      formData,
      isCompleted: true,
    });
  };

  const contextValue: MultiStepFormContextType = {
    currentStep,
    completedSteps,
    totalSteps,
    form,
    isLoading: isLoadingProgress || saveProgressMutation.isPending || updateUserMutation.isPending,
    progress: progress ?? null,
    isWizardMode,
    goToStep,
    navigateToStep,
    nextStep,
    prevStep,
    canGoToStep,
    isStepCompleted,
    validateCurrentStep,
    saveProgress,
    submitForm,
    saveCurrentStep,
    getStepTitle,
    getStepDescription,
  };

  return (
    <MultiStepFormContext.Provider value={contextValue}>
      {children}
    </MultiStepFormContext.Provider>
  );
};