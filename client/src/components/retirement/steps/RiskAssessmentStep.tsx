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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, Clock, BarChart3, AlertTriangle, Target } from 'lucide-react';

export const RiskAssessmentStep: React.FC = () => {
  const { form } = useMultiStepForm();

  const investmentOptions = [
    { value: 'stocks', label: 'Individual Stocks', description: 'Direct ownership of company shares' },
    { value: 'etfs', label: 'ETFs', description: 'Exchange-traded funds for diversification' },
    { value: 'mutual-funds', label: 'Mutual Funds', description: 'Professionally managed portfolios' },
    { value: 'bonds', label: 'Bonds', description: 'Government and corporate bonds' },
    { value: 'real-estate', label: 'Real Estate', description: 'REITs and real estate investments' },
    { value: 'commodities', label: 'Commodities', description: 'Gold, silver, and other commodities' },
    { value: 'target-date', label: 'Target-Date Funds', description: 'Age-appropriate automatic allocation' },
    { value: 'index-funds', label: 'Index Funds', description: 'Low-cost market tracking funds' },
  ];

  const getRiskProfile = () => {
    const riskTolerance = form.watch('riskTolerance');
    const experience = form.watch('investmentExperience');
    const timeline = form.watch('investmentTimeline');

    if (!riskTolerance) return null;

    const profiles = {
      'conservative': {
        title: 'Conservative Investor',
        description: 'You prefer stability and capital preservation over growth.',
        color: 'green',
        allocation: 'Suggested allocation: 20% stocks, 70% bonds, 10% cash'
      },
      'moderate': {
        title: 'Moderate Investor', 
        description: 'You seek balanced growth with moderate risk.',
        color: 'blue',
        allocation: 'Suggested allocation: 60% stocks, 35% bonds, 5% cash'
      },
      'aggressive': {
        title: 'Aggressive Investor',
        description: 'You are comfortable with high risk for potential high returns.',
        color: 'red',
        allocation: 'Suggested allocation: 85% stocks, 10% bonds, 5% cash'
      }
    };

    return profiles[riskTolerance as keyof typeof profiles];
  };

  const riskProfile = getRiskProfile();

  return (
    <div className="space-y-6">
      {/* Investment Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Investment Experience</span>
          </CardTitle>
          <CardDescription>
            Tell us about your investment background and knowledge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="investmentExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investment Experience Level</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your investment experience" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <div className="flex flex-col items-start">
                        <span>Beginner</span>
                        <span className="text-xs text-gray-500">Little to no investment experience</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex flex-col items-start">
                        <span>Intermediate</span>
                        <span className="text-xs text-gray-500">Some experience with basic investments</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex flex-col items-start">
                        <span>Advanced</span>
                        <span className="text-xs text-gray-500">Extensive investment knowledge and experience</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="expert">
                      <div className="flex flex-col items-start">
                        <span>Expert</span>
                        <span className="text-xs text-gray-500">Professional-level investment expertise</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  This helps us recommend appropriate investment strategies
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Risk Tolerance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Risk Tolerance</span>
          </CardTitle>
          <CardDescription>
            How comfortable are you with investment risk and market volatility?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="riskTolerance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risk Tolerance Level</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your risk tolerance" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="conservative">
                      <div className="flex flex-col items-start">
                        <span>Conservative</span>
                        <span className="text-xs text-gray-500">Prefer stability, low risk of loss</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderate">
                      <div className="flex flex-col items-start">
                        <span>Moderate</span>
                        <span className="text-xs text-gray-500">Balanced approach, some risk acceptable</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="aggressive">
                      <div className="flex flex-col items-start">
                        <span>Aggressive</span>
                        <span className="text-xs text-gray-500">High risk tolerance for potential high returns</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marketVolatilityComfort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Market Volatility Comfort</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="How do you handle market downturns?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="panic-sell">
                      <div className="flex flex-col items-start">
                        <span>Likely to Panic Sell</span>
                        <span className="text-xs text-gray-500">Would sell investments during market drops</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="concerned-monitor">
                      <div className="flex flex-col items-start">
                        <span>Concerned but Hold</span>
                        <span className="text-xs text-gray-500">Worried but would likely hold positions</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="stay-course">
                      <div className="flex flex-col items-start">
                        <span>Stay the Course</span>
                        <span className="text-xs text-gray-500">Continue with long-term strategy</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="buy-opportunities">
                      <div className="flex flex-col items-start">
                        <span>Buy More on Dips</span>
                        <span className="text-xs text-gray-500">See downturns as buying opportunities</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Your reaction to market volatility affects your optimal portfolio
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Investment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Investment Timeline</span>
          </CardTitle>
          <CardDescription>
            Your time horizon affects your investment strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="investmentTimeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investment Time Horizon</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your investment timeline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="short-term">
                      <div className="flex flex-col items-start">
                        <span>Short-term (0-5 years)</span>
                        <span className="text-xs text-gray-500">Need money within 5 years</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium-term">
                      <div className="flex flex-col items-start">
                        <span>Medium-term (5-15 years)</span>
                        <span className="text-xs text-gray-500">Retirement in 5-15 years</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="long-term">
                      <div className="flex flex-col items-start">
                        <span>Long-term (15+ years)</span>
                        <span className="text-xs text-gray-500">More than 15 years to retirement</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Longer timelines generally allow for more aggressive strategies
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Investment Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Investment Preferences</span>
          </CardTitle>
          <CardDescription>
            Which types of investments interest you?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="preferredInvestmentTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Investment Types</FormLabel>
                <FormDescription className="mb-3">
                  Select all investment types you're interested in:
                </FormDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {investmentOptions.map((option) => (
                    <FormItem 
                      key={option.value} 
                      className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-3"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), option.value]);
                            } else {
                              field.onChange(
                                field.value?.filter((value) => value !== option.value)
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none flex-1">
                        <FormLabel className="text-sm font-medium">
                          {option.label}
                        </FormLabel>
                        <FormDescription className="text-xs">
                          {option.description}
                        </FormDescription>
                      </div>
                    </FormItem>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="investmentRebalancingPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio Rebalancing Preference</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="How do you prefer to manage your portfolio?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hands-off">
                      <div className="flex flex-col items-start">
                        <span>Hands-off/Automatic</span>
                        <span className="text-xs text-gray-500">Set it and forget it approach</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="quarterly">
                      <div className="flex flex-col items-start">
                        <span>Quarterly Review</span>
                        <span className="text-xs text-gray-500">Review and rebalance every 3 months</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex flex-col items-start">
                        <span>Active Management</span>
                        <span className="text-xs text-gray-500">Regular monitoring and adjustments</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How involved do you want to be in managing your investments?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Risk Profile Summary */}
      {riskProfile && (
        <Card className={`bg-${riskProfile.color}-50 border-${riskProfile.color}-200`}>
          <CardHeader>
            <CardTitle className={`text-${riskProfile.color}-900 flex items-center space-x-2`}>
              <Shield className="w-5 h-5" />
              <span>Your Investment Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className={`font-semibold text-${riskProfile.color}-900`}>
                  {riskProfile.title}
                </h4>
                <p className={`text-sm text-${riskProfile.color}-800 mt-1`}>
                  {riskProfile.description}
                </p>
              </div>
              
              <div className={`text-sm text-${riskProfile.color}-800`}>
                <strong>Recommended Strategy:</strong>
                <p className="mt-1">{riskProfile.allocation}</p>
              </div>

              {form.watch('preferredInvestmentTypes') && form.watch('preferredInvestmentTypes')!.length > 0 && (
                <div className={`text-sm text-${riskProfile.color}-800`}>
                  <strong>Your Investment Interests:</strong>
                  <p className="mt-1">
                    {form.watch('preferredInvestmentTypes')!
                      .map(type => investmentOptions.find(opt => opt.value === type)?.label)
                      .join(', ')}
                  </p>
                </div>
              )}

              {form.watch('investmentTimeline') && (
                <div className={`text-sm text-${riskProfile.color}-800`}>
                  <strong>Time Horizon:</strong>
                  <p className="mt-1 capitalize">
                    {form.watch('investmentTimeline')?.replace('-', ' ')} perspective
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};