import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Edit3, 
  User, 
  Users, 
  Calendar, 
  TrendingUp, 
  Percent,
  Clock,
  Heart
} from "lucide-react";
import type { RetirementPlan } from "@shared/schema";

interface PlanParametersPanelProps {
  plan: RetirementPlan;
  onEdit: () => void;
}

export default function PlanParametersPanel({ plan, onEdit }: PlanParametersPanelProps) {
  const isCouplePlan = !!(plan.spouseStartAge && plan.spouseRetirementAge && plan.spouseEndAge);
  
  const formatRate = (rate: string | null) => {
    if (!rate) return 'N/A';
    return `${parseFloat(rate).toFixed(1)}%`;
  };

  const formatAge = (age: number | null) => {
    if (!age) return 'N/A';
    return age.toString();
  };

  const getCurrentAge = () => {
    const currentYear = new Date().getFullYear();
    // This is a simplified calculation - in real app you'd track the plan start year
    return plan.startAge;
  };

  const getYearsToRetirement = () => {
    return plan.retirementAge - getCurrentAge();
  };

  const getPlanDuration = () => {
    return plan.endAge - plan.startAge;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">{plan.planName}</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              {isCouplePlan ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {isCouplePlan ? 'Couple Plan' : 'Single Plan'}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {plan.planType}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit} className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Edit Parameters
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Age & Timeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4 text-blue-500" />
              Age & Timeline
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Current Age:</span>
                <div className="font-semibold">{formatAge(plan.startAge)}</div>
              </div>
              <div>
                <span className="text-gray-500">Retirement Age:</span>
                <div className="font-semibold">{formatAge(plan.retirementAge)}</div>
              </div>
              <div>
                <span className="text-gray-500">Plan End Age:</span>
                <div className="font-semibold">{formatAge(plan.endAge)}</div>
              </div>
              <div>
                <span className="text-gray-500">Years to Retirement:</span>
                <div className="font-semibold text-blue-600">{getYearsToRetirement()}</div>
              </div>
            </div>

            {/* Spouse Ages (if couple plan) */}
            {isCouplePlan && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Spouse
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Current Age:</span>
                    <div className="font-semibold">{formatAge(plan.spouseStartAge)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Retirement:</span>
                    <div className="font-semibold">{formatAge(plan.spouseRetirementAge)}</div>
                  </div>
                  <div className="colspan-2">
                    <span className="text-gray-500">Plan End Age:</span>
                    <div className="font-semibold">{formatAge(plan.spouseEndAge)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Economic Assumptions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Economic Assumptions
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Inflation Rate:</span>
                <div className="font-semibold text-yellow-600">
                  {formatRate(plan.inflationRate)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Portfolio Growth:</span>
                <div className="font-semibold text-green-600">
                  {formatRate(plan.portfolioGrowthRate)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Bond Growth:</span>
                <div className="font-semibold text-blue-600">
                  {formatRate(plan.bondGrowthRate)}
                </div>
              </div>
            </div>

            {/* Real Growth Rate Calculation */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-600 mb-2">Real Growth Rate</div>
              <div className="text-sm">
                <span className="text-gray-500">After Inflation:</span>
                <div className="font-semibold text-indigo-600">
                  {(parseFloat(plan.portfolioGrowthRate || '7') - parseFloat(plan.inflationRate || '3')).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Plan Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4 text-purple-500" />
              Plan Summary
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Plan Duration:</span>
                <div className="font-semibold">{getPlanDuration()} years</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Working Years:</span>
                <div className="font-semibold text-blue-600">{plan.retirementAge - plan.startAge}</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Retirement Years:</span>
                <div className="font-semibold text-green-600">{plan.endAge - plan.retirementAge}</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Initial Net Worth:</span>
                <div className="font-semibold">
                  ${parseFloat(plan.initialNetWorth || '0').toLocaleString()}
                </div>
              </div>
            </div>

            {/* Creation Date */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Created: {new Date(plan.createdAt || '').toLocaleDateString()}
              </div>
              {plan.updatedAt && plan.updatedAt !== plan.createdAt && (
                <div className="text-xs text-gray-500">
                  Updated: {new Date(plan.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}