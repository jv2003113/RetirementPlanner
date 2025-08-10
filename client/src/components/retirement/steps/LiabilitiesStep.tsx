import React from 'react';
import { useMultiStepForm } from '@/contexts/MultiStepFormContext';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, CreditCard, GraduationCap, AlertTriangle } from 'lucide-react';

export const LiabilitiesStep: React.FC = () => {
  const { form } = useMultiStepForm();

  const formatCurrency = (value: string) => {
    return value ? `$${parseInt(value).toLocaleString()}` : '$0';
  };

  const calculateTotalDebt = () => {
    const values = [
      'mortgageBalance',
      'creditCardDebt',
      'studentLoanDebt',
      'otherDebt'
    ];
    
    return values.reduce((total, fieldName) => {
      return total + parseInt(form.watch(fieldName as any) || '0');
    }, 0);
  };

  const calculateDebtToIncomeRatio = () => {
    const totalMonthlyPayments = parseInt(form.watch('totalMonthlyDebtPayments') || '0');
    const currentIncome = parseInt(form.watch('currentIncome') || '0');
    const spouseIncome = parseInt(form.watch('spouseCurrentIncome') || '0');
    const totalAnnualIncome = currentIncome + spouseIncome;
    const totalMonthlyIncome = totalAnnualIncome / 12;
    
    if (totalMonthlyIncome === 0) return 0;
    return Math.round((totalMonthlyPayments / totalMonthlyIncome) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Mortgage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span>Mortgage & Home Loans</span>
          </CardTitle>
          <CardDescription>
            Information about your primary residence and other property loans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mortgageBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remaining Mortgage Balance</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="250000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Current outstanding balance on your mortgage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mortgagePayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Mortgage Payment</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="1800" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Principal, interest, taxes, insurance (PITI)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mortgageRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mortgage Interest Rate</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="4.5" 
                        step="0.1"
                        min="0"
                        max="20"
                        {...field} 
                      />
                      <span className="absolute right-3 top-3 text-gray-400">%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Current interest rate on your mortgage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mortgageYearsLeft"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years Remaining</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="25" 
                        min="0"
                        max="50"
                        {...field} 
                      />
                      <span className="absolute right-3 top-3 text-gray-400">years</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Years left to pay off the mortgage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Consumer Debt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Consumer Debt</span>
          </CardTitle>
          <CardDescription>
            Credit cards, personal loans, and other consumer debt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="creditCardDebt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credit Card Debt</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      type="number" 
                      placeholder="8500" 
                      className="pl-10"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Total outstanding balance on all credit cards
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Student Loans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5" />
            <span>Student Loans</span>
          </CardTitle>
          <CardDescription>
            Education loans for you and your spouse/partner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="studentLoanDebt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student Loan Balance</FormLabel>
                <FormControl>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      type="number" 
                      placeholder="35000" 
                      className="pl-10"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Total remaining student loan debt for both spouses
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Other Debt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Other Debt</span>
          </CardTitle>
          <CardDescription>
            Auto loans, personal loans, and other debts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="otherDebt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Debt Balance</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="15000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Auto loans, personal loans, family loans, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="totalMonthlyDebtPayments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Monthly Debt Payments</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="2500" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Sum of all monthly debt payments (including mortgage)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Debt Summary */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">Debt Summary & Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Total Debt Breakdown */}
            <div className="space-y-2">
              <h4 className="font-medium text-red-900">Total Debt Breakdown</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Mortgage:</span>
                    <span className="font-medium">
                      {formatCurrency(form.watch('mortgageBalance') || '0')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credit Cards:</span>
                    <span className="font-medium">
                      {formatCurrency(form.watch('creditCardDebt') || '0')}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Student Loans:</span>
                    <span className="font-medium">
                      {formatCurrency(form.watch('studentLoanDebt') || '0')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Debt:</span>
                    <span className="font-medium">
                      {formatCurrency(form.watch('otherDebt') || '0')}
                    </span>
                  </div>
                </div>
              </div>
              <hr className="border-red-300 my-2" />
              <div className="flex justify-between text-lg font-semibold text-red-900">
                <span>Total Debt:</span>
                <span>{formatCurrency(String(calculateTotalDebt()))}</span>
              </div>
            </div>

            {/* Debt-to-Income Ratio */}
            <div className="space-y-2">
              <h4 className="font-medium text-red-900">Debt-to-Income Analysis</h4>
              <div className="flex justify-between text-sm">
                <span>Monthly Debt Payments:</span>
                <span className="font-medium">
                  {formatCurrency(form.watch('totalMonthlyDebtPayments') || '0')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Debt-to-Income Ratio:</span>
                <span className={`font-medium ${
                  calculateDebtToIncomeRatio() > 36 ? 'text-red-600' : 
                  calculateDebtToIncomeRatio() > 28 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {calculateDebtToIncomeRatio()}%
                </span>
              </div>
              {calculateDebtToIncomeRatio() > 0 && (
                <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
                  {calculateDebtToIncomeRatio() > 36 ? (
                    <>⚠️ High debt-to-income ratio. Consider debt reduction strategies.</>
                  ) : calculateDebtToIncomeRatio() > 28 ? (
                    <>⚡ Moderate debt-to-income ratio. Room for improvement.</>
                  ) : (
                    <>✅ Good debt-to-income ratio. You're in good shape!</>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};