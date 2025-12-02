import React, { useState } from 'react';
import { useMultiStepForm, FORM_STEPS } from '@/contexts/MultiStepFormContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { RetirementPlan } from '@shared/schema';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { 
  User, 
  DollarSign, 
  Receipt,
  PiggyBank, 
  CreditCard, 
  Target, 
  TrendingUp,
  CheckCircle,
  Edit,
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useLocation } from 'wouter';

export const ReviewStep: React.FC = () => {
  const { form, navigateToStep, canGoToStep, isStepCompleted } = useMultiStepForm();
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  // Get form data only when needed to avoid validation errors
  const getFormData = React.useCallback(() => {
    try {
      return form.getValues();
    } catch (error) {
      console.error('Error getting form values:', error);
      return {};
    }
  }, [form]);

  // For display purposes, get the current form values (not defaultValues)
  // Using watch() to make it reactive to form changes
  const formData = form.watch();
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();

  // Fetch existing retirement plans to determine button text and behavior
  const { data: existingPlans = [], isLoading: plansLoading } = useQuery<RetirementPlan[]>({
    queryKey: ["retirement-plans"],
    queryFn: async () => {
      const response = await fetch("/api/retirement-plans");
      if (!response.ok) throw new Error("Failed to fetch retirement plans");
      return response.json();
    },
  });

  // Check if there's already a primary plan
  const existingPrimaryPlan = existingPlans.find(plan => plan.planType === 'P');
  const hasExistingPlans = existingPlans.length > 0;

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

  const calculateTotalExpenses = () => {
    const expenses = formData.expenses || [];
    return expenses.reduce((sum: number, expense: any) => {
      const amount = parseFloat(expense.amount) || 0;
      return sum + amount;
    }, 0);
  };

  // Colors for pie charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316', '#84CC16', '#6366F1', '#64748B'];

  // Prepare Assets pie chart data
  const prepareAssetsChartData = () => {
    const assets = [
      { name: 'Cash & Savings', value: parseInt(formData.savingsBalance || '0') + parseInt(formData.checkingBalance || '0') },
      { name: 'Investments', value: parseInt(formData.investmentBalance || '0') },
      { name: '401(k)', value: parseInt(formData.retirementAccount401k || '0') },
      { name: 'IRA', value: parseInt(formData.retirementAccountIRA || '0') },
      { name: 'Roth IRA', value: parseInt(formData.retirementAccountRoth || '0') },
      { name: 'Real Estate', value: parseInt(formData.realEstateValue || '0') },
      { name: 'Other Assets', value: parseInt(formData.otherAssetsValue || '0') },
    ];
    return assets.filter(asset => asset.value > 0);
  };

  // Prepare Liabilities pie chart data
  const prepareLiabilitiesChartData = () => {
    const liabilities = [
      { name: 'Mortgage', value: parseInt(formData.mortgageBalance || '0') },
      { name: 'Credit Cards', value: parseInt(formData.creditCardDebt || '0') },
      { name: 'Student Loans', value: parseInt(formData.studentLoanDebt || '0') },
      { name: 'Other Debt', value: parseInt(formData.otherDebt || '0') },
    ];
    return liabilities.filter(liability => liability.value > 0);
  };

  // Prepare Expenses pie chart data
  const prepareExpensesChartData = () => {
    const expenses = formData.expenses || [];
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach((expense: any) => {
      if (expense.category && expense.amount && parseFloat(expense.amount) > 0) {
        const categoryLabel = expense.category.charAt(0).toUpperCase() + expense.category.slice(1).replace('_', ' ');
        categoryTotals[categoryLabel] = (categoryTotals[categoryLabel] || 0) + parseFloat(expense.amount);
      }
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
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

      {/* Current Expenses */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader
            title="Current Expenses"
            stepNumber={FORM_STEPS.CURRENT_EXPENSES}
            icon={Receipt}
            isComplete={isStepCompleted(FORM_STEPS.CURRENT_EXPENSES)}
            onEdit={() => navigateToStep(FORM_STEPS.CURRENT_EXPENSES)}
          />
          <div className="space-y-4">
            {(() => {
              const expensesChartData = prepareExpensesChartData();
              return expensesChartData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {expensesChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {expensesChartData.map((item, index) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-8">
                  No expenses entered yet
                </div>
              );
            })()}
            <Separator />
            <div className="text-right">
              <strong className="text-lg text-amber-600">
                Total Monthly Expenses: {formatCurrency(calculateTotalExpenses())}
              </strong>
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
          <div className="space-y-4">
            {(() => {
              const assetsChartData = prepareAssetsChartData();
              return assetsChartData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetsChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {assetsChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {assetsChartData.map((item, index) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-8">
                  No assets entered yet
                </div>
              );
            })()}
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
          <div className="space-y-4">
            {(() => {
              const liabilitiesChartData = prepareLiabilitiesChartData();
              return liabilitiesChartData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={liabilitiesChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {liabilitiesChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {liabilitiesChartData.map((item, index) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-8">
                  No liabilities entered yet
                </div>
              );
            })()}
            {formData.totalMonthlyDebtPayments && parseInt(formData.totalMonthlyDebtPayments) > 0 && (
              <div className="text-sm text-center p-3 bg-red-50 rounded-lg">
                <strong>Monthly Debt Payments:</strong> {formatCurrency(formData.totalMonthlyDebtPayments)}
              </div>
            )}
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
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Your retirement plan is complete!</span>
              </div>
              <p className="text-sm">
                All your information has been saved automatically as you progressed through each step. 
                You can edit any section by clicking on the step indicators above or navigating to specific pages.
              </p>
            </div>
            
            {/* Generate Retirement Plan Button - Always visible */}
            <div className="mt-6 pt-4 border-t border-green-200">
                <Button
                  onClick={handleGenerateRetirementPlan}
                  disabled={isGeneratingPlan || plansLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
                  size="lg"
                >
                  {isGeneratingPlan ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {hasExistingPlans ? 'Updating Your Retirement Plan...' : 'Generating Your Retirement Plan...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {hasExistingPlans ? 'Update Retirement Plan' : 'Generate Retirement Plan'}
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-green-700 mt-2">
                  {hasExistingPlans 
                    ? 'This will update your existing retirement plan with your latest information'
                    : 'This will create a comprehensive retirement plan with financial projections and timeline'
                  }
                </p>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Function to generate or update retirement plan
  async function handleGenerateRetirementPlan() {
    try {
      setIsGeneratingPlan(true);

      // Get current form data when button is clicked
      const currentFormData = getFormData();
      console.log('Starting plan generation with form data:', currentFormData);
      console.log('Current age:', currentFormData.currentAge);
      console.log('Target retirement age:', currentFormData.targetRetirementAge);
      console.log('Assets - Savings:', currentFormData.savingsBalance);
      console.log('Assets - 401k:', currentFormData.retirementAccount401k);
      
      // Clean form data to ensure it's JSON serializable
      const cleanFormData = {};
      for (const [key, value] of Object.entries(currentFormData)) {
        // Only include primitive values and arrays of primitives
        if (value !== undefined && value !== null) {
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            cleanFormData[key] = value;
          } else if (Array.isArray(value)) {
            // Clean arrays to only include serializable items
            cleanFormData[key] = value.filter(item => 
              item !== null && item !== undefined && 
              (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' || 
               (typeof item === 'object' && item.constructor === Object))
            );
          } else if (typeof value === 'object' && value.constructor === Object) {
            // Include plain objects
            cleanFormData[key] = value;
          }
        }
      }
      
      console.log('Cleaned form data:', cleanFormData);
      
      // Call the new generate API endpoint
      const requestBody = {
        formData: cleanFormData // Send cleaned form data
      };
      
      console.log('Request body:', requestBody);
      
      let stringifiedBody;
      try {
        stringifiedBody = JSON.stringify(requestBody);
        console.log('Successfully stringified body');
      } catch (jsonError) {
        console.error('JSON stringify error:', jsonError);
        throw new Error('Failed to serialize form data');
      }
      
      const response = await fetch('/api/retirement-plans/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: stringifiedBody,
      });
      
      console.log(`🔄 Frontend: API call to /api/retirement-plans/generate completed with status ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        const errorMessage = errorData.details || errorData.message || `HTTP ${response.status}: Failed to generate retirement plan`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('📦 Frontend: API response data:', result);
      
      // Wait a moment for backend generation to complete
      console.log('⏳ Frontend: Waiting 2 seconds for data to be ready...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['retirement-plans'] });
      
      toast({
        title: hasExistingPlans ? "Retirement Plan Updated!" : "Retirement Plan Generated!",
        description: result.message || (hasExistingPlans 
          ? "Your retirement plan has been updated with your latest information."
          : "Your comprehensive retirement plan has been created successfully."),
      });

      // Navigate to the retirement plan page with the new plan ID
      const newPlanId = result.plan?.id;
      console.log(`🚀 Frontend: Navigating to retirement plan page with plan ID ${newPlanId} at ${new Date().toISOString()}`);
      
      if (newPlanId) {
        setLocation(`/retirement-plan?planId=${newPlanId}`);
      } else {
        setLocation('/retirement-plan');
      }
      
    } catch (error) {
      console.error('Error generating retirement plan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : (hasExistingPlans 
          ? "Failed to update retirement plan. Please try again."
          : "Failed to generate retirement plan. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  }
};