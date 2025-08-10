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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plane, Heart, Home, Stethoscope, MapPin } from 'lucide-react';

export const RetirementGoalsStep: React.FC = () => {
  const { form } = useMultiStepForm();

  const formatCurrency = (value: string) => {
    return value ? `$${parseInt(value).toLocaleString()}` : '$0';
  };

  const calculateMonthlyFromAnnual = (annualAmount: string) => {
    const annual = parseInt(annualAmount || '0');
    return Math.round(annual / 12);
  };

  return (
    <div className="space-y-6">
      {/* Lifestyle Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Retirement Lifestyle Goals</span>
          </CardTitle>
          <CardDescription>
            Define your ideal retirement lifestyle and spending expectations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="desiredLifestyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desired Retirement Lifestyle *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your desired lifestyle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="frugal">
                      <div className="flex flex-col items-start">
                        <span>Frugal</span>
                        <span className="text-xs text-gray-500">Basic needs, minimal discretionary spending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="comfortable">
                      <div className="flex flex-col items-start">
                        <span>Comfortable</span>
                        <span className="text-xs text-gray-500">Maintain current lifestyle, some luxuries</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="luxurious">
                      <div className="flex flex-col items-start">
                        <span>Luxurious</span>
                        <span className="text-xs text-gray-500">Premium lifestyle, extensive travel and activities</span>
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
            name="expectedAnnualExpenses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Annual Retirement Expenses</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      type="number" 
                      placeholder="75000" 
                      className="pl-10"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  How much do you expect to spend annually in retirement?
                  {field.value && (
                    <span className="block mt-1 text-blue-600 font-medium">
                      ≈ {formatCurrency(String(calculateMonthlyFromAnnual(field.value)))} per month
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Healthcare Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5" />
            <span>Healthcare Planning</span>
          </CardTitle>
          <CardDescription>
            Plan for healthcare costs and considerations in retirement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="healthcareExpectations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Healthcare Expectations</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your healthcare expectations" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="basic">
                      <div className="flex flex-col items-start">
                        <span>Basic Healthcare</span>
                        <span className="text-xs text-gray-500">Medicare + supplements, average health</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="comprehensive">
                      <div className="flex flex-col items-start">
                        <span>Comprehensive Coverage</span>
                        <span className="text-xs text-gray-500">Premium plans, regular check-ups</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="premium">
                      <div className="flex flex-col items-start">
                        <span>Premium Healthcare</span>
                        <span className="text-xs text-gray-500">Concierge medicine, extensive coverage</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="long-term-care">
                      <div className="flex flex-col items-start">
                        <span>Long-term Care Planning</span>
                        <span className="text-xs text-gray-500">Expecting significant healthcare needs</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Consider your health history and expected healthcare needs
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Travel & Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plane className="w-5 h-5" />
            <span>Travel & Activity Plans</span>
          </CardTitle>
          <CardDescription>
            Your retirement travel dreams and activity preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="travelPlans"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Travel Plans</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your retirement travel plans... (e.g., annual international trips, RV touring, visiting family, etc.)"
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  What kind of travel and activities do you envision in retirement?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Retirement Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Retirement Location</span>
          </CardTitle>
          <CardDescription>
            Where do you plan to live during retirement?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="retirementLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Planned Retirement Location</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Stay in current home, Move to Florida, Downsize locally, etc."
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Consider cost of living, taxes, and proximity to family
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Legacy Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Legacy & Estate Planning</span>
          </CardTitle>
          <CardDescription>
            Your goals for leaving assets to family or charity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="legacyGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legacy Goals</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your legacy goals... (e.g., leave estate to children, charitable giving, educational funds for grandchildren, etc.)"
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  What do you want to accomplish with your wealth beyond retirement?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Goals Summary */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Your Retirement Vision</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {form.watch('desiredLifestyle') && (
              <div>
                <span className="font-medium text-purple-900">Lifestyle: </span>
                <span className="capitalize">{form.watch('desiredLifestyle')} lifestyle</span>
              </div>
            )}
            
            {form.watch('expectedAnnualExpenses') && (
              <div>
                <span className="font-medium text-purple-900">Annual Budget: </span>
                <span>{formatCurrency(form.watch('expectedAnnualExpenses') || '0')} per year</span>
                <span className="text-purple-700 ml-2">
                  ({formatCurrency(String(calculateMonthlyFromAnnual(form.watch('expectedAnnualExpenses') || '0')))} per month)
                </span>
              </div>
            )}

            {form.watch('healthcareExpectations') && (
              <div>
                <span className="font-medium text-purple-900">Healthcare: </span>
                <span className="capitalize">{form.watch('healthcareExpectations')?.replace('-', ' ')} coverage</span>
              </div>
            )}

            {form.watch('retirementLocation') && (
              <div>
                <span className="font-medium text-purple-900">Location: </span>
                <span>{form.watch('retirementLocation')}</span>
              </div>
            )}

            {form.watch('travelPlans') && (
              <div>
                <span className="font-medium text-purple-900">Travel Plans: </span>
                <span className="text-purple-800">{form.watch('travelPlans')}</span>
              </div>
            )}

            {form.watch('legacyGoals') && (
              <div>
                <span className="font-medium text-purple-900">Legacy Goals: </span>
                <span className="text-purple-800">{form.watch('legacyGoals')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};