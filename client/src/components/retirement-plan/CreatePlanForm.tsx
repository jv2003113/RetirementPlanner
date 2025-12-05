import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, User, Users, TrendingUp, Calendar, Shield, DollarSign, Home, PiggyBank, Briefcase } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreatePlanFormProps {
  onCancel: () => void;
  onSuccess: (planId: number) => void;
}

interface PlanFormData {
  planName: string;
  planType: 'single' | 'couple';
  planVariant: 'A' | 'B' | 'C';

  // Primary person
  startAge: number;
  retirementAge: number;
  endAge: number;

  // Spouse (if applicable)
  spouseStartAge?: number;
  spouseRetirementAge?: number;
  spouseEndAge?: number;

  // Social Security
  socialSecurityStartAge: number;
  estimatedSocialSecurityBenefit: number;
  spouseSocialSecurityStartAge?: number;
  spouseEstimatedSocialSecurityBenefit?: number;

  // Income Sources
  pensionIncome: number;
  spousePensionIncome?: number;
  otherRetirementIncome: number;

  // Spending
  desiredAnnualRetirementSpending: number;
  majorOneTimeExpenses: number;
  majorExpensesDescription?: string;

  // Economic assumptions
  inflationRate: number;
  portfolioGrowthRate: number;
  bondGrowthRate: number;
}

export default function CreatePlanForm({ onCancel, onSuccess }: CreatePlanFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PlanFormData>({
    planName: '',
    planType: 'single',
    planVariant: 'A',
    startAge: user?.currentAge || 30,
    retirementAge: user?.targetRetirementAge || 65,
    endAge: 95,
    inflationRate: 3.0,
    portfolioGrowthRate: 7.0,
    bondGrowthRate: 4.0,
    socialSecurityStartAge: 67,
    estimatedSocialSecurityBenefit: 30000,
    pensionIncome: 0,
    otherRetirementIncome: 0,
    desiredAnnualRetirementSpending: 80000,
    majorOneTimeExpenses: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createPlanMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const response = await fetch('/api/retirement-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: data.planName,
          planType: data.planVariant,
          startAge: data.startAge,
          retirementAge: data.retirementAge,
          endAge: data.endAge,
          spouseStartAge: data.planType === 'couple' ? data.spouseStartAge : null,
          spouseRetirementAge: data.planType === 'couple' ? data.spouseRetirementAge : null,
          spouseEndAge: data.planType === 'couple' ? data.spouseEndAge : null,
          inflationRate: data.inflationRate.toString(),
          portfolioGrowthRate: data.portfolioGrowthRate.toString(),
          bondGrowthRate: data.bondGrowthRate.toString(),
          socialSecurityStartAge: data.socialSecurityStartAge,
          estimatedSocialSecurityBenefit: data.estimatedSocialSecurityBenefit.toString(),
          spouseSocialSecurityStartAge: data.planType === 'couple' ? data.spouseSocialSecurityStartAge : null,
          spouseEstimatedSocialSecurityBenefit: data.planType === 'couple' ? data.spouseEstimatedSocialSecurityBenefit?.toString() : null,
          pensionIncome: data.pensionIncome.toString(),
          spousePensionIncome: data.planType === 'couple' ? data.spousePensionIncome?.toString() : null,
          otherRetirementIncome: data.otherRetirementIncome.toString(),
          desiredAnnualRetirementSpending: data.desiredAnnualRetirementSpending.toString(),
          majorOneTimeExpenses: data.majorOneTimeExpenses.toString(),
          majorExpensesDescription: data.majorExpensesDescription,
          initialNetWorth: "0", // Will be calculated
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create plan');
      }

      return response.json();
    },
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: ['retirement-plans'] });
      onSuccess(newPlan.id);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.planName.trim()) {
      newErrors.planName = 'Plan name is required';
    }

    if (formData.startAge >= formData.retirementAge) {
      newErrors.retirementAge = 'Retirement age must be after start age';
    }

    if (formData.retirementAge >= formData.endAge) {
      newErrors.endAge = 'Life expectancy must be after retirement age';
    }

    if (formData.planType === 'couple') {
      if (!formData.spouseStartAge || !formData.spouseRetirementAge || !formData.spouseEndAge) {
        newErrors.spouse = 'All spouse ages are required for couple plans';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createPlanMutation.mutate(formData);
    }
  };

  const updateFormData = (field: keyof PlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Retirement Plan
          </CardTitle>
          <CardDescription>
            Configure the key parameters for your retirement scenario analysis
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Basics */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  value={formData.planName}
                  onChange={(e) => updateFormData('planName', e.target.value)}
                  placeholder="e.g., Conservative Plan, Early Retirement, etc."
                  className={errors.planName ? 'border-red-500' : ''}
                />
                {errors.planName && (
                  <p className="text-sm text-red-600 mt-1">{errors.planName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="planType">Plan Type</Label>
                <Select value={formData.planType} onValueChange={(value: 'single' | 'couple') => updateFormData('planType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Single Person
                      </div>
                    </SelectItem>
                    <SelectItem value="couple">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Married Couple
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="planVariant">Plan Variant</Label>
                <Select value={formData.planVariant} onValueChange={(value: 'A' | 'B' | 'C') => updateFormData('planVariant', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Plan-A</SelectItem>
                    <SelectItem value="B">Plan-B</SelectItem>
                    <SelectItem value="C">Plan-C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Age Parameters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Age Parameters</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startAge">Current Age *</Label>
                  <Input
                    id="startAge"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.startAge}
                    onChange={(e) => updateFormData('startAge', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="retirementAge">Retirement Age *</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    min="50"
                    max="100"
                    value={formData.retirementAge}
                    onChange={(e) => updateFormData('retirementAge', parseInt(e.target.value))}
                    className={errors.retirementAge ? 'border-red-500' : ''}
                  />
                  {errors.retirementAge && (
                    <p className="text-sm text-red-600 mt-1">{errors.retirementAge}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endAge">Life Expectancy *</Label>
                  <Input
                    id="endAge"
                    type="number"
                    min="70"
                    max="120"
                    value={formData.endAge}
                    onChange={(e) => updateFormData('endAge', parseInt(e.target.value))}
                    className={errors.endAge ? 'border-red-500' : ''}
                  />
                  {errors.endAge && (
                    <p className="text-sm text-red-600 mt-1">{errors.endAge}</p>
                  )}
                </div>
              </div>

              {/* Spouse Parameters */}
              {formData.planType === 'couple' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Spouse Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="spouseStartAge">Spouse Current Age</Label>
                      <Input
                        id="spouseStartAge"
                        type="number"
                        min="18"
                        max="100"
                        value={formData.spouseStartAge || ''}
                        onChange={(e) => updateFormData('spouseStartAge', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="spouseRetirementAge">Spouse Retirement Age</Label>
                      <Input
                        id="spouseRetirementAge"
                        type="number"
                        min="50"
                        max="100"
                        value={formData.spouseRetirementAge || ''}
                        onChange={(e) => updateFormData('spouseRetirementAge', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="spouseEndAge">Spouse Life Expectancy</Label>
                      <Input
                        id="spouseEndAge"
                        type="number"
                        min="70"
                        max="120"
                        value={formData.spouseEndAge || ''}
                        onChange={(e) => updateFormData('spouseEndAge', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  {errors.spouse && (
                    <Alert className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.spouse}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Social Security Parameters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Social Security</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="socialSecurityStartAge">Social Security Start Age *</Label>
                  <Input
                    id="socialSecurityStartAge"
                    type="number"
                    min="62"
                    max="70"
                    value={formData.socialSecurityStartAge}
                    onChange={(e) => updateFormData('socialSecurityStartAge', parseInt(e.target.value))}
                    className={errors.socialSecurityStartAge ? 'border-red-500' : ''}
                  />
                  {errors.socialSecurityStartAge && (
                    <p className="text-sm text-red-600 mt-1">{errors.socialSecurityStartAge}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Age 62-70</p>
                </div>

                <div>
                  <Label htmlFor="estimatedSocialSecurityBenefit">Annual SS Benefit *</Label>
                  <Input
                    id="estimatedSocialSecurityBenefit"
                    type="number"
                    min="0"
                    value={formData.estimatedSocialSecurityBenefit}
                    onChange={(e) => updateFormData('estimatedSocialSecurityBenefit', parseInt(e.target.value))}
                    placeholder="30000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Annual Social Security benefit</p>
                </div>
              </div>

              {/* Spouse Social Security (if couple plan) */}
              {formData.planType === 'couple' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Spouse Social Security
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="spouseSocialSecurityStartAge">Spouse SS Start Age</Label>
                      <Input
                        id="spouseSocialSecurityStartAge"
                        type="number"
                        min="62"
                        max="70"
                        value={formData.spouseSocialSecurityStartAge || ''}
                        onChange={(e) => updateFormData('spouseSocialSecurityStartAge', parseInt(e.target.value))}
                        className={errors.spouseSocialSecurityStartAge ? 'border-red-500' : ''}
                      />
                      {errors.spouseSocialSecurityStartAge && (
                        <p className="text-sm text-red-600 mt-1">{errors.spouseSocialSecurityStartAge}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="spouseEstimatedSocialSecurityBenefit">Spouse Annual SS Benefit</Label>
                      <Input
                        id="spouseEstimatedSocialSecurityBenefit"
                        type="number"
                        min="0"
                        value={formData.spouseEstimatedSocialSecurityBenefit || ''}
                        onChange={(e) => updateFormData('spouseEstimatedSocialSecurityBenefit', parseInt(e.target.value))}
                        placeholder="25000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Retirement Income Sources */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Retirement Income Sources</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pensionIncome">Annual Pension Income</Label>
                  <Input
                    id="pensionIncome"
                    type="number"
                    min="0"
                    value={formData.pensionIncome}
                    onChange={(e) => updateFormData('pensionIncome', parseInt(e.target.value))}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your annual pension income</p>
                </div>

                {formData.planType === 'couple' && (
                  <div>
                    <Label htmlFor="spousePensionIncome">Spouse Pension Income</Label>
                    <Input
                      id="spousePensionIncome"
                      type="number"
                      min="0"
                      value={formData.spousePensionIncome || ''}
                      onChange={(e) => updateFormData('spousePensionIncome', parseInt(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Spouse annual pension</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="otherRetirementIncome">Other Retirement Income</Label>
                  <Input
                    id="otherRetirementIncome"
                    type="number"
                    min="0"
                    value={formData.otherRetirementIncome}
                    onChange={(e) => updateFormData('otherRetirementIncome', parseInt(e.target.value))}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Rental, part-time work, etc.</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Retirement Spending */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Retirement Spending</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="desiredAnnualRetirementSpending">Annual Retirement Spending *</Label>
                  <Input
                    id="desiredAnnualRetirementSpending"
                    type="number"
                    min="1"
                    value={formData.desiredAnnualRetirementSpending}
                    onChange={(e) => updateFormData('desiredAnnualRetirementSpending', parseInt(e.target.value))}
                    className={errors.desiredAnnualRetirementSpending ? 'border-red-500' : ''}
                    placeholder="80000"
                  />
                  {errors.desiredAnnualRetirementSpending && (
                    <p className="text-sm text-red-600 mt-1">{errors.desiredAnnualRetirementSpending}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Your target annual spending in retirement</p>
                </div>

                <div>
                  <Label htmlFor="majorOneTimeExpenses">Major One-Time Expenses</Label>
                  <Input
                    id="majorOneTimeExpenses"
                    type="number"
                    min="0"
                    value={formData.majorOneTimeExpenses}
                    onChange={(e) => updateFormData('majorOneTimeExpenses', parseInt(e.target.value))}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">New home, large trips, etc.</p>
                </div>
              </div>

              <div>
                <Label htmlFor="majorExpensesDescription">Major Expenses Description</Label>
                <Input
                  id="majorExpensesDescription"
                  value={formData.majorExpensesDescription || ''}
                  onChange={(e) => updateFormData('majorExpensesDescription', e.target.value)}
                  placeholder="e.g., New home purchase, world travel, family support"
                />
                <p className="text-xs text-gray-500 mt-1">Optional description of your major expenses</p>
              </div>
            </div>

            <Separator />

            {/* Economic Assumptions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Economic Assumptions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inflationRate">Inflation Rate (%)</Label>
                  <Input
                    id="inflationRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={formData.inflationRate}
                    onChange={(e) => updateFormData('inflationRate', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Typical: 2.0% - 4.0%</p>
                </div>

                <div>
                  <Label htmlFor="portfolioGrowthRate">Portfolio Growth Rate (%)</Label>
                  <Input
                    id="portfolioGrowthRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="25"
                    value={formData.portfolioGrowthRate}
                    onChange={(e) => updateFormData('portfolioGrowthRate', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Typical: 6.0% - 8.0%</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPlanMutation.isPending}
                className="min-w-32"
              >
                {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
              </Button>
            </div>

            {createPlanMutation.error && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to create plan. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}