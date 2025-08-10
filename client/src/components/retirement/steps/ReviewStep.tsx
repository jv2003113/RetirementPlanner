import React from 'react';
import { useMultiStepForm, FORM_STEPS } from '@/contexts/MultiStepFormContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  User, 
  DollarSign, 
  PiggyBank, 
  CreditCard, 
  Target, 
  TrendingUp,
  CheckCircle,
  Edit,
  AlertCircle
} from 'lucide-react';

export const ReviewStep: React.FC = () => {
  const { form, navigateToStep, canGoToStep, isStepCompleted } = useMultiStepForm();
  const formData = form.getValues();

  const formatCurrency = (value: string | number | undefined) => {
    const num = typeof value === 'string' ? parseInt(value) || 0 : (value || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const calculateTotalAssets = () => {
    return (
      parseInt(formData.savingsBalance || '0') +
      parseInt(formData.checkingBalance || '0') +
      parseInt(formData.investmentBalance || '0') +
      parseInt(formData.retirementAccount401k || '0') +
      parseInt(formData.retirementAccountIRA || '0') +
      parseInt(formData.retirementAccountRoth || '0') +
      parseInt(formData.realEstateValue || '0') +
      parseInt(formData.otherAssetsValue || '0')
    );
  };

  const calculateTotalDebt = () => {
    return (
      parseInt(formData.mortgageBalance || '0') +
      parseInt(formData.creditCardDebt || '0') +
      parseInt(formData.studentLoanDebt || '0') +
      parseInt(formData.otherDebt || '0')
    );
  };

  const calculateNetWorth = () => {
    return calculateTotalAssets() - calculateTotalDebt();
  };

  const calculateTotalIncome = () => {
    return (
      parseInt(formData.currentIncome || '0') +
      parseInt(formData.spouseCurrentIncome || '0') +
      parseInt(formData.otherIncomeAmount1 || '0') +
      parseInt(formData.otherIncomeAmount2 || '0')
    );
  };

  const SectionHeader = ({ 
    title, 
    stepNumber, 
    icon: Icon, 
    isComplete, 
    onEdit 
  }: {
    title: string;
    stepNumber: number;
    icon: React.ElementType;
    isComplete: boolean;
    onEdit: () => void;
  }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-600" />
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        disabled={!canGoToStep(stepNumber as any)}
        className="flex items-center space-x-2"
      >
        <Edit className="w-4 h-4" />
        <span>Edit</span>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">Your Retirement Plan Summary</CardTitle>
          <CardDescription className="text-blue-700">
            Review all your information before submitting your retirement plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(calculateNetWorth())}
              </div>
              <div className="text-sm text-blue-700">Current Net Worth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {formData.targetRetirementAge || 'Not Set'}
              </div>
              <div className="text-sm text-blue-700">Target Retirement Age</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(calculateTotalIncome())}
              </div>
              <div className="text-sm text-blue-700">Annual Income</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader
            title="Personal Information"
            stepNumber={FORM_STEPS.PERSONAL_INFO}
            icon={User}
            isComplete={isStepCompleted(FORM_STEPS.PERSONAL_INFO)}
            onEdit={() => navigateToStep(FORM_STEPS.PERSONAL_INFO)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Name:</strong> {formData.firstName} {formData.lastName}
            </div>
            <div>
              <strong>Email:</strong> {formData.email}
            </div>
            <div>
              <strong>Age:</strong> {formData.currentAge} years old
            </div>
            <div>
              <strong>Target Retirement Age:</strong> {formData.targetRetirementAge}
            </div>
            <div>
              <strong>Location:</strong> {formData.currentLocation || 'Not specified'}
            </div>
            <div>
              <strong>Marital Status:</strong> {formData.maritalStatus ? formData.maritalStatus.charAt(0).toUpperCase() + formData.maritalStatus.slice(1) : 'Not specified'}
            </div>
            <div>
              <strong>Dependents:</strong> {formData.dependents || 0}
            </div>
            {formData.hasSpouse && (
              <div>
                <strong>Spouse:</strong> {formData.spouseFirstName} {formData.spouseLastName}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Income Information */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader
            title="Income Information"
            stepNumber={FORM_STEPS.INCOME_INFO}
            icon={DollarSign}
            isComplete={isStepCompleted(FORM_STEPS.INCOME_INFO)}
            onEdit={() => navigateToStep(FORM_STEPS.INCOME_INFO)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Your Current Income:</strong> {formatCurrency(formData.currentIncome)}
            </div>
            <div>
              <strong>Expected Peak Income:</strong> {formatCurrency(formData.expectedFutureIncome)}
            </div>
            {formData.hasSpouse && (
              <>
                <div>
                  <strong>Spouse Current Income:</strong> {formatCurrency(formData.spouseCurrentIncome)}
                </div>
                <div>
                  <strong>Spouse Peak Income:</strong> {formatCurrency(formData.spouseExpectedFutureIncome)}
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <strong>Total Annual Income:</strong> 
              <span className="text-lg font-semibold ml-2 text-green-600">
                {formatCurrency(calculateTotalIncome())}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader
            title="Current Assets"
            stepNumber={FORM_STEPS.CURRENT_ASSETS}
            icon={PiggyBank}
            isComplete={isStepCompleted(FORM_STEPS.CURRENT_ASSETS)}
            onEdit={() => navigateToStep(FORM_STEPS.CURRENT_ASSETS)}
          />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Cash & Savings:</strong> 
                {formatCurrency(parseInt(formData.savingsBalance || '0') + parseInt(formData.checkingBalance || '0'))}
              </div>
              <div>
                <strong>Investments:</strong> {formatCurrency(formData.investmentBalance)}
              </div>
              <div>
                <strong>Retirement Accounts:</strong> 
                {formatCurrency(
                  parseInt(formData.retirementAccount401k || '0') + 
                  parseInt(formData.retirementAccountIRA || '0') + 
                  parseInt(formData.retirementAccountRoth || '0')
                )}
              </div>
              <div>
                <strong>Real Estate & Other:</strong> 
                {formatCurrency(parseInt(formData.realEstateValue || '0') + parseInt(formData.otherAssetsValue || '0'))}
              </div>
            </div>
            <Separator />
            <div className="text-right">
              <strong className="text-lg text-green-600">
                Total Assets: {formatCurrency(calculateTotalAssets())}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liabilities */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader
            title="Liabilities"
            stepNumber={FORM_STEPS.LIABILITIES}
            icon={CreditCard}
            isComplete={isStepCompleted(FORM_STEPS.LIABILITIES)}
            onEdit={() => navigateToStep(FORM_STEPS.LIABILITIES)}
          />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Mortgage:</strong> {formatCurrency(formData.mortgageBalance)}
              </div>
              <div>
                <strong>Credit Cards:</strong> {formatCurrency(formData.creditCardDebt)}
              </div>
              <div>
                <strong>Student Loans:</strong> {formatCurrency(formData.studentLoanDebt)}
              </div>
              <div>
                <strong>Other Debt:</strong> {formatCurrency(formData.otherDebt)}
              </div>
            </div>
            <div className="text-sm">
              <strong>Monthly Debt Payments:</strong> {formatCurrency(formData.totalMonthlyDebtPayments)}
            </div>
            <Separator />
            <div className="text-right">
              <strong className="text-lg text-red-600">
                Total Debt: {formatCurrency(calculateTotalDebt())}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retirement Goals */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader
            title="Retirement Goals"
            stepNumber={FORM_STEPS.RETIREMENT_GOALS}
            icon={Target}
            isComplete={isStepCompleted(FORM_STEPS.RETIREMENT_GOALS)}
            onEdit={() => navigateToStep(FORM_STEPS.RETIREMENT_GOALS)}
          />
          <div className="space-y-3 text-sm">
            <div>
              <strong>Desired Lifestyle:</strong> 
              <Badge variant="secondary" className="ml-2 capitalize">
                {formData.desiredLifestyle || 'Not specified'}
              </Badge>
            </div>
            <div>
              <strong>Expected Annual Expenses:</strong> {formatCurrency(formData.expectedAnnualExpenses)}
            </div>
            <div>
              <strong>Healthcare Expectations:</strong> 
              <span className="ml-2 capitalize">
                {formData.healthcareExpectations?.replace('-', ' ') || 'Not specified'}
              </span>
            </div>
            <div>
              <strong>Retirement Location:</strong> {formData.retirementLocation || 'Not specified'}
            </div>
            {formData.travelPlans && (
              <div>
                <strong>Travel Plans:</strong>
                <p className="mt-1 text-gray-700 pl-4 border-l-2 border-gray-200">
                  {formData.travelPlans}
                </p>
              </div>
            )}
            {formData.legacyGoals && (
              <div>
                <strong>Legacy Goals:</strong>
                <p className="mt-1 text-gray-700 pl-4 border-l-2 border-gray-200">
                  {formData.legacyGoals}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader
            title="Risk Assessment"
            stepNumber={FORM_STEPS.RISK_ASSESSMENT}
            icon={TrendingUp}
            isComplete={isStepCompleted(FORM_STEPS.RISK_ASSESSMENT)}
            onEdit={() => navigateToStep(FORM_STEPS.RISK_ASSESSMENT)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Investment Experience:</strong>
              <Badge variant="outline" className="ml-2 capitalize">
                {formData.investmentExperience || 'Not specified'}
              </Badge>
            </div>
            <div>
              <strong>Risk Tolerance:</strong>
              <Badge variant="outline" className="ml-2 capitalize">
                {formData.riskTolerance || 'Not specified'}
              </Badge>
            </div>
            <div>
              <strong>Investment Timeline:</strong>
              <span className="ml-2 capitalize">
                {formData.investmentTimeline?.replace('-', ' ') || 'Not specified'}
              </span>
            </div>
            <div>
              <strong>Market Volatility Comfort:</strong>
              <span className="ml-2 capitalize">
                {formData.marketVolatilityComfort?.replace('-', ' ') || 'Not specified'}
              </span>
            </div>
            {formData.preferredInvestmentTypes && formData.preferredInvestmentTypes.length > 0 && (
              <div className="md:col-span-2">
                <strong>Investment Preferences:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.preferredInvestmentTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="capitalize">
                      {type.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Ready to Submit</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-green-900">
                  {formatCurrency(calculateNetWorth())}
                </div>
                <div className="text-sm text-green-700">Net Worth</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-900">
                  {formData.targetRetirementAge ? 
                    Math.max(0, formData.targetRetirementAge - (formData.currentAge || 0)) : 0} years
                </div>
                <div className="text-sm text-green-700">Until Retirement</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-900">
                  {formatCurrency(formData.expectedAnnualExpenses)}
                </div>
                <div className="text-sm text-green-700">Annual Retirement Goal</div>
              </div>
            </div>
            
            <div className="text-center text-green-800 bg-green-100 p-4 rounded-lg">
              <p className="text-sm">
                Your retirement plan is ready! Click "Submit Plan" to save your information 
                and get personalized recommendations for achieving your retirement goals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};