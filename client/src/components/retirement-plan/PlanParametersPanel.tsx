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
  Heart,
  ChevronDown,
  ChevronUp,
  Target,
  DollarSign,
  Shield,
  Home,
  Briefcase,
  PiggyBank,
  Gift
} from "lucide-react";
import type { RetirementPlan } from "@shared/schema";

interface PlanParametersPanelProps {
  plan: RetirementPlan;
  onEdit: () => void;
}

export default function PlanParametersPanel({ plan, onEdit }: PlanParametersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCouplePlan = !!(plan.spouseStartAge && plan.spouseRetirementAge && plan.spouseEndAge);
  
  const getPlanTypeDisplay = (planType: string | null) => {
    switch (planType) {
      case 'P': return 'Primary';
      case 'A': return 'Plan-A';
      case 'B': return 'Plan-B';
      case 'C': return 'Plan-C';
      default: return planType || 'Primary';
    }
  };
  
  const formatRate = (rate: string | null) => {
    if (!rate) return 'N/A';
    return `${parseFloat(rate).toFixed(1)}%`;
  };

  const formatAge = (age: number | null) => {
    if (!age) return 'N/A';
    return age.toString();
  };

  const formatCurrency = (amount: string | null, abbreviated = false) => {
    if (!amount) return '$0';
    const value = parseFloat(amount);
    if (abbreviated && value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (abbreviated && value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getCurrentAge = () => {
    return plan.startAge;
  };

  const getYearsToRetirement = () => {
    return plan.retirementAge - getCurrentAge();
  };

  const getTotalIncome = () => {
    return (
      parseFloat(plan.estimatedSocialSecurityBenefit?.toString() || '0') +
      parseFloat(plan.spouseEstimatedSocialSecurityBenefit?.toString() || '0') +
      parseFloat(plan.pensionIncome?.toString() || '0') +
      parseFloat(plan.spousePensionIncome?.toString() || '0') +
      parseFloat(plan.otherRetirementIncome?.toString() || '0')
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              {getPlanTypeDisplay(plan.planType)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isExpanded ? 'Less' : 'Details'}
            </Button>
            {plan.planType !== 'P' && (
              <Button variant="outline" size="sm" onClick={onEdit} className="flex items-center gap-1">
                <Edit3 className="h-3 w-3" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Compact Summary - Always Visible */}
        <div className="space-y-3">
          {/* Key Information Grid */}
          <div className={`grid gap-3 ${isCouplePlan ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-4'}`}>
            <div className="text-center">
              <div className="text-xs text-gray-500">Retire Age</div>
              <div className="font-semibold text-blue-600">{formatAge(plan.retirementAge)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Life Expectancy</div>
              <div className="font-semibold text-purple-600">{formatAge(plan.endAge)}</div>
            </div>
            {isCouplePlan && (
              <>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Spouse Retire</div>
                  <div className="font-semibold text-pink-600">{formatAge(plan.spouseRetirementAge)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Spouse Life Exp</div>
                  <div className="font-semibold text-pink-600">{formatAge(plan.spouseEndAge)}</div>
                </div>
              </>
            )}
            <div className="text-center">
              <div className="text-xs text-gray-500">Growth Rate</div>
              <div className="font-semibold text-emerald-600">{formatRate(plan.portfolioGrowthRate)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Inflation</div>
              <div className="font-semibold text-yellow-600">{formatRate(plan.inflationRate)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Annual Spending</div>
              <div className="font-semibold text-orange-600">{formatCurrency(plan.desiredAnnualRetirementSpending, true)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Guaranteed Income</div>
              <div className="font-semibold text-blue-600">{formatCurrency(getTotalIncome().toString(), true)}</div>
            </div>
          </div>

        </div>

        {/* Expanded Details - Collapsible */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t border-gray-100 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Age & Timeline Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Age & Timeline
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Current Age:</span>
                    <div className="font-semibold">{formatAge(plan.startAge)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Retirement Age:</span>
                    <div className="font-semibold text-blue-600">{formatAge(plan.retirementAge)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Life Expectancy:</span>
                    <div className="font-semibold text-purple-600">{formatAge(plan.endAge)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Years to Retirement:</span>
                    <div className="font-semibold text-green-600">{getYearsToRetirement()}</div>
                  </div>
                </div>

                {/* Spouse Age Details (if couple plan) */}
                {isCouplePlan && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-600 mb-3 flex items-center gap-1">
                      <Heart className="h-3 w-3 text-pink-500" />
                      Spouse Ages
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Current Age:</span>
                        <div className="font-semibold">{formatAge(plan.spouseStartAge)}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Retirement Age:</span>
                        <div className="font-semibold">{formatAge(plan.spouseRetirementAge)}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Life Expectancy:</span>
                        <div className="font-semibold">{formatAge(plan.spouseEndAge)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Security & Income Sources */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Shield className="h-4 w-4 text-green-500" />
                  Social Security & Income
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">SS Start Age:</span>
                    <div className="font-semibold text-green-600">{formatAge(plan.socialSecurityStartAge)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">SS Benefit (Annual):</span>
                    <div className="font-semibold">{formatCurrency(plan.estimatedSocialSecurityBenefit)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Pension Income:</span>
                    <div className="font-semibold">{formatCurrency(plan.pensionIncome)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Other Income:</span>
                    <div className="font-semibold">{formatCurrency(plan.otherRetirementIncome)}</div>
                  </div>
                </div>

                {/* Spouse Social Security (if couple plan) */}
                {isCouplePlan && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-600 mb-3 flex items-center gap-1">
                      <Heart className="h-3 w-3 text-pink-500" />
                      Spouse Social Security
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">SS Start Age:</span>
                        <div className="font-semibold">{formatAge(plan.spouseSocialSecurityStartAge)}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">SS Benefit (Annual):</span>
                        <div className="font-semibold">{formatCurrency(plan.spouseEstimatedSocialSecurityBenefit)}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Pension Income:</span>
                        <div className="font-semibold">{formatCurrency(plan.spousePensionIncome)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Economic Assumptions & Spending */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  Economics & Spending
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Portfolio Growth:</span>
                    <div className="font-semibold text-green-600">{formatRate(plan.portfolioGrowthRate)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Inflation Rate:</span>
                    <div className="font-semibold text-yellow-600">{formatRate(plan.inflationRate)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Real Growth Rate:</span>
                    <div className="font-semibold text-indigo-600">
                      {(parseFloat(plan.portfolioGrowthRate || '7') - parseFloat(plan.inflationRate || '3')).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Spending Details */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-600 mb-3 flex items-center gap-1">
                    <Home className="h-3 w-3 text-orange-500" />
                    Retirement Spending
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Annual Spending:</span>
                      <div className="font-semibold text-orange-600">{formatCurrency(plan.desiredAnnualRetirementSpending)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">One-time Expenses:</span>
                      <div className="font-semibold">{formatCurrency(plan.majorOneTimeExpenses)}</div>
                    </div>
                    {plan.majorExpensesDescription && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <span className="font-medium">Major Expenses: </span>
                        {plan.majorExpensesDescription}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}