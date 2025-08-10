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
import { AlertCircle, Plus, User, Users, TrendingUp, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreatePlanFormProps {
  onCancel: () => void;
  onSuccess: (planId: number) => void;
}

interface PlanFormData {
  planName: string;
  planType: 'single' | 'couple';
  
  // Primary person
  startAge: number;
  retirementAge: number;
  endAge: number;
  
  // Spouse (if applicable)
  spouseStartAge?: number;
  spouseRetirementAge?: number;
  spouseEndAge?: number;
  
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
    startAge: user?.currentAge || 30,
    retirementAge: user?.targetRetirementAge || 65,
    endAge: 95,
    inflationRate: 3.0,
    portfolioGrowthRate: 7.0,
    bondGrowthRate: 4.0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createPlanMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const response = await fetch('/api/retirement-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: data.planName,
          planType: 'comprehensive',
          startAge: data.startAge,
          retirementAge: data.retirementAge,
          endAge: data.endAge,
          spouseStartAge: data.planType === 'couple' ? data.spouseStartAge : null,
          spouseRetirementAge: data.planType === 'couple' ? data.spouseRetirementAge : null,
          spouseEndAge: data.planType === 'couple' ? data.spouseEndAge : null,
          inflationRate: data.inflationRate.toString(),
          portfolioGrowthRate: data.portfolioGrowthRate.toString(),
          bondGrowthRate: data.bondGrowthRate.toString(),
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
      newErrors.endAge = 'End age must be after retirement age';
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
                  <Label htmlFor="endAge">Plan End Age *</Label>
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
                      <Label htmlFor="spouseEndAge">Spouse End Age</Label>
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

            {/* Economic Assumptions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Economic Assumptions</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                
                <div>
                  <Label htmlFor="bondGrowthRate">Bond Growth Rate (%)</Label>
                  <Input
                    id="bondGrowthRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
                    value={formData.bondGrowthRate}
                    onChange={(e) => updateFormData('bondGrowthRate', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Typical: 3.0% - 5.0%</p>
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