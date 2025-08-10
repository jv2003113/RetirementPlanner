import React from 'react';
import { MultiStepFormProvider, useMultiStepForm, FORM_STEPS } from '@/contexts/MultiStepFormContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Form } from '@/components/ui/form';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Save, User, DollarSign, Receipt, PiggyBank, CreditCard, Target, TrendingUp, FileText } from 'lucide-react';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { IncomeInfoStep } from './steps/IncomeInfoStep';
import { CurrentExpensesStep } from './steps/CurrentExpensesStep';
import { CurrentAssetsStep } from './steps/CurrentAssetsStep';
import { LiabilitiesStep } from './steps/LiabilitiesStep';
import { RetirementGoalsStep } from './steps/RetirementGoalsStep';
import { RiskAssessmentStep } from './steps/RiskAssessmentStep';
import { ReviewStep } from './steps/ReviewStep';

// Progress indicator component
const StepIndicator: React.FC = () => {
  const { currentStep, completedSteps, totalSteps, navigateToStep, canGoToStep, getStepTitle, isWizardMode } = useMultiStepForm();
  
  const steps = [
    { number: FORM_STEPS.PERSONAL_INFO, title: 'Personal', icon: User, colors: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', ring: 'ring-blue-200' } },
    { number: FORM_STEPS.INCOME_INFO, title: 'Income', icon: DollarSign, colors: { bg: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-600', ring: 'ring-green-200' } },
    { number: FORM_STEPS.CURRENT_EXPENSES, title: 'Expenses', icon: Receipt, colors: { bg: 'bg-amber-600', hover: 'hover:bg-amber-700', text: 'text-amber-600', ring: 'ring-amber-200' } },
    { number: FORM_STEPS.CURRENT_ASSETS, title: 'Assets', icon: PiggyBank, colors: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', text: 'text-purple-600', ring: 'ring-purple-200' } },
    { number: FORM_STEPS.LIABILITIES, title: 'Liabilities', icon: CreditCard, colors: { bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600', ring: 'ring-red-200' } },
    { number: FORM_STEPS.RETIREMENT_GOALS, title: 'Goals', icon: Target, colors: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', text: 'text-orange-600', ring: 'ring-orange-200' } },
    { number: FORM_STEPS.RISK_ASSESSMENT, title: 'Risk', icon: TrendingUp, colors: { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-indigo-600', ring: 'ring-indigo-200' } },
    { number: FORM_STEPS.REVIEW, title: 'Summary', icon: FileText, colors: { bg: 'bg-gray-600', hover: 'hover:bg-gray-700', text: 'text-gray-600', ring: 'ring-gray-200' } },
  ];

  const progressPercentage = isWizardMode 
    ? (completedSteps.length / totalSteps) * 100
    : 100; // In edit mode, show full progress

  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;
          const canClick = canGoToStep(step.number);
          const StepIcon = step.icon;

          return (
            <div key={step.number} className="flex flex-col items-center">
              {/* Step circle */}
              <button
                type="button"
                onClick={() => canClick && navigateToStep(step.number)}
                disabled={!canClick}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-all duration-200
                  ${isCurrent 
                    ? `${step.colors.bg} text-white ring-4 ${step.colors.ring} shadow-lg scale-110 transform` 
                    : isCompleted 
                      ? `${step.colors.bg} text-white ${step.colors.hover} scale-100 opacity-40` 
                      : canClick
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 scale-100 opacity-35'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed scale-100 opacity-30'
                  }
                `}
              >
                <StepIcon className="w-5 h-5" />
              </button>

              {/* Step title */}
              <span className={`
                text-xs text-center font-medium transition-all duration-200
                ${isCurrent 
                  ? `${step.colors.text} font-bold text-sm transform scale-105`
                  : isCompleted 
                    ? `${step.colors.text} font-medium opacity-40`
                    : 'text-gray-500 font-normal opacity-35'
                }
              `}>
                {step.title}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  absolute h-0.5 w-full mt-5 -z-10
                  ${isCompleted ? step.colors.bg.replace('bg-', 'bg-') : 'bg-gray-200'}
                `} style={{ 
                  left: '50%', 
                  width: `calc(100% / ${steps.length - 1})`,
                  transform: 'translateX(-50%)'
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Navigation buttons component
const NavigationButtons: React.FC = () => {
  const { 
    currentStep, 
    prevStep, 
    nextStep, 
    saveProgress, 
    submitForm,
    saveCurrentStep,
    isLoading,
    totalSteps,
    isWizardMode
  } = useMultiStepForm();

  const isFirstStep = currentStep === FORM_STEPS.PERSONAL_INFO;
  const isLastStep = currentStep === FORM_STEPS.REVIEW;

  // For edit mode (existing users), show save button for each step (except summary)
  if (!isWizardMode) {
    // Don't show any buttons on the summary step
    if (currentStep === FORM_STEPS.REVIEW) {
      return null;
    }
    
    return (
      <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={saveCurrentStep}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>
    );
  }

  // For wizard mode (new users), show navigation controls
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      {/* Previous button */}
      <Button
        type="button"
        variant="outline"
        onClick={prevStep}
        disabled={isFirstStep || isLoading}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Previous</span>
      </Button>

      <div className="flex space-x-3">
        {/* Save & Continue Later button */}
        <Button
          type="button"
          variant="ghost"
          onClick={saveProgress}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save & Continue Later</span>
        </Button>

        {/* Next/Submit button */}
        {isLastStep ? (
          <Button
            type="button"
            onClick={submitForm}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <span>{isLoading ? 'Submitting...' : 'Submit Plan'}</span>
            <CheckCircle className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={nextStep}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Step content renderer
const StepContent: React.FC = () => {
  const { currentStep, getStepTitle, getStepDescription } = useMultiStepForm();

  const renderStep = () => {
    switch (currentStep) {
      case FORM_STEPS.PERSONAL_INFO:
        return <PersonalInfoStep />;
      case FORM_STEPS.INCOME_INFO:
        return <IncomeInfoStep />;
      case FORM_STEPS.CURRENT_EXPENSES:
        return <CurrentExpensesStep />;
      case FORM_STEPS.CURRENT_ASSETS:
        return <CurrentAssetsStep />;
      case FORM_STEPS.LIABILITIES:
        return <LiabilitiesStep />;
      case FORM_STEPS.RETIREMENT_GOALS:
        return <RetirementGoalsStep />;
      case FORM_STEPS.RISK_ASSESSMENT:
        return <RiskAssessmentStep />;
      case FORM_STEPS.REVIEW:
        return <ReviewStep />;
      default:
        return <PersonalInfoStep />;
    }
  };

  return (
    <Card className="min-h-[600px]">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-900">
          {getStepTitle(currentStep)}
        </CardTitle>
        <p className="text-gray-600 mt-1">
          {getStepDescription(currentStep)}
        </p>
      </CardHeader>
      <CardContent className="pb-8">
        {renderStep()}
        <NavigationButtons />
      </CardContent>
    </Card>
  );
};

// Main form component content
const MultiStepFormContent: React.FC = () => {
  const { form } = useMultiStepForm();
  
  return (
    <Form {...form}>
      <form>
        <div className="max-w-4xl mx-auto">
          <StepIndicator />
          <StepContent />
        </div>
      </form>
    </Form>
  );
};

// Main component with provider
interface MultiStepRetirementFormProps {
  userId: number;
  isWizardMode?: boolean;
}

const MultiStepRetirementForm: React.FC<MultiStepRetirementFormProps> = ({ userId, isWizardMode = false }) => {
  return (
    <MultiStepFormProvider userId={userId} isWizardMode={isWizardMode}>
      <div className="py-6">
        <MultiStepFormContent />
      </div>
    </MultiStepFormProvider>
  );
};

export default MultiStepRetirementForm;