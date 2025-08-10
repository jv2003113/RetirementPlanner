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
import { DollarSign, TrendingUp, PlusCircle, Briefcase } from 'lucide-react';

export const IncomeInfoStep: React.FC = () => {
  const { form } = useMultiStepForm();
  const hasSpouse = form.watch('hasSpouse');

  const formatCurrency = (value: string) => {
    return value ? `$${parseInt(value).toLocaleString()}` : '$0';
  };

  return (
    <div className="space-y-6">
      {/* Primary Income */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Your Current Income</span>
          </CardTitle>
          <CardDescription>
            Tell us about your current and expected future income
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="currentIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Annual Income *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="75000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your gross annual salary or income before taxes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expectedFutureIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Peak Income</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="100000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Highest income you expect to earn in your career
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="expectedIncomeGrowth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Annual Income Growth</FormLabel>
                <FormControl>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      type="number" 
                      placeholder="3" 
                      min="0"
                      max="20"
                      step="0.1"
                      className="pl-10"
                      {...field} 
                    />
                    <span className="absolute right-3 top-3 text-gray-400">%</span>
                  </div>
                </FormControl>
                <FormDescription>
                  Average annual percentage increase you expect in your income
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Spouse Income */}
      {hasSpouse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5" />
              <span>Spouse/Partner Income</span>
            </CardTitle>
            <CardDescription>
              Include your spouse or partner's income information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="spouseCurrentIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spouse Current Annual Income</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          type="number" 
                          placeholder="65000" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your spouse's gross annual income before taxes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="spouseExpectedFutureIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spouse Expected Peak Income</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          type="number" 
                          placeholder="85000" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Highest income your spouse expects to earn
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Income Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5" />
            <span>Additional Income Sources</span>
          </CardTitle>
          <CardDescription>
            Include any other regular income sources you have
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="otherIncomeSource1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Income Source 1</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Rental Property, Side Business" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="otherIncomeAmount1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          type="number" 
                          placeholder="12000" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="otherIncomeSource2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Income Source 2</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Freelancing, Investments" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="otherIncomeAmount2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          type="number" 
                          placeholder="8000" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Income Summary */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Income Summary</h4>
            <div className="space-y-1 text-sm text-green-800">
              <div className="flex justify-between">
                <span>Your Current Income:</span>
                <span className="font-medium">
                  {formatCurrency(form.watch('currentIncome') || '0')}
                </span>
              </div>
              {hasSpouse && (
                <div className="flex justify-between">
                  <span>Spouse Current Income:</span>
                  <span className="font-medium">
                    {formatCurrency(form.watch('spouseCurrentIncome') || '0')}
                  </span>
                </div>
              )}
              {form.watch('otherIncomeAmount1') && (
                <div className="flex justify-between">
                  <span>Other Income 1:</span>
                  <span className="font-medium">
                    {formatCurrency(form.watch('otherIncomeAmount1') || '0')}
                  </span>
                </div>
              )}
              {form.watch('otherIncomeAmount2') && (
                <div className="flex justify-between">
                  <span>Other Income 2:</span>
                  <span className="font-medium">
                    {formatCurrency(form.watch('otherIncomeAmount2') || '0')}
                  </span>
                </div>
              )}
              <hr className="border-green-300 my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Annual Income:</span>
                <span>
                  {formatCurrency(String(
                    parseInt(form.watch('currentIncome') || '0') +
                    parseInt(form.watch('spouseCurrentIncome') || '0') +
                    parseInt(form.watch('otherIncomeAmount1') || '0') +
                    parseInt(form.watch('otherIncomeAmount2') || '0')
                  ))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};