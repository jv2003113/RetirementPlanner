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
import { Wallet, PiggyBank, TrendingUp, Home, Building2 } from 'lucide-react';

export const CurrentAssetsStep: React.FC = () => {
  const { form } = useMultiStepForm();

  const formatCurrency = (value: string) => {
    return value ? `$${parseInt(value).toLocaleString()}` : '$0';
  };

  const calculateTotalAssets = () => {
    const values = [
      'savingsBalance',
      'checkingBalance', 
      'investmentBalance',
      'retirementAccount401k',
      'retirementAccountIRA',
      'retirementAccountRoth',
      'realEstateValue',
      'otherAssetsValue'
    ];
    
    return values.reduce((total, fieldName) => {
      return total + parseInt(form.watch(fieldName as any) || '0');
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Cash & Savings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PiggyBank className="w-5 h-5" />
            <span>Cash & Savings</span>
          </CardTitle>
          <CardDescription>
            Your liquid assets and cash reserves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="savingsBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Savings Account Balance</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="25000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    High-yield savings, money market accounts
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="checkingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Checking Account Balance</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your primary checking account balance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Investment Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Investment & Taxable Accounts</span>
          </CardTitle>
          <CardDescription>
            Non-retirement investment accounts and brokerage accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="investmentBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investment/Brokerage Account Balance</FormLabel>
                <FormControl>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      type="number" 
                      placeholder="50000" 
                      className="pl-10"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Stocks, bonds, mutual funds in taxable accounts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Retirement Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Retirement Accounts</span>
          </CardTitle>
          <CardDescription>
            401(k), 403(b), IRA, Roth IRA, and other retirement accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="retirementAccount401k"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>401(k)/403(b) Balance</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="125000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Current employer plan balance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="retirementAccountIRA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traditional IRA Balance</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="35000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Pre-tax IRA accounts
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="retirementAccountRoth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roth IRA Balance</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="45000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    After-tax Roth accounts
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Real Estate & Other Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span>Real Estate & Other Assets</span>
          </CardTitle>
          <CardDescription>
            Property values and other significant assets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="realEstateValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Real Estate Value</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="350000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Current market value of your home and other properties
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="otherAssetsValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Assets Value</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="25000" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Cars, collectibles, business interests, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assets Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Total Assets Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Cash & Savings:</span>
                  <span className="font-medium">
                    {formatCurrency(String(
                      parseInt(form.watch('savingsBalance') || '0') +
                      parseInt(form.watch('checkingBalance') || '0')
                    ))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Investments:</span>
                  <span className="font-medium">
                    {formatCurrency(form.watch('investmentBalance') || '0')}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Retirement Accounts:</span>
                  <span className="font-medium">
                    {formatCurrency(String(
                      parseInt(form.watch('retirementAccount401k') || '0') +
                      parseInt(form.watch('retirementAccountIRA') || '0') +
                      parseInt(form.watch('retirementAccountRoth') || '0')
                    ))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Real Estate & Other:</span>
                  <span className="font-medium">
                    {formatCurrency(String(
                      parseInt(form.watch('realEstateValue') || '0') +
                      parseInt(form.watch('otherAssetsValue') || '0')
                    ))}
                  </span>
                </div>
              </div>
            </div>
            <hr className="border-blue-300 my-3" />
            <div className="flex justify-between text-lg font-semibold text-blue-900">
              <span>Total Net Assets:</span>
              <span>{formatCurrency(String(calculateTotalAssets()))}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};