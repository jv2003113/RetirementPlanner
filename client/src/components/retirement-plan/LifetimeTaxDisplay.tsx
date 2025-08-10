import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Receipt, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Calculator 
} from "lucide-react";
import type { AnnualSnapshot } from "@shared/schema";

interface LifetimeTaxDisplayProps {
  totalLifetimeTax: string;
  planDetails?: {
    snapshots: AnnualSnapshot[];
  } | null;
}

export default function LifetimeTaxDisplay({ totalLifetimeTax, planDetails }: LifetimeTaxDisplayProps) {
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Calculate tax metrics from snapshots
  const calculateTaxMetrics = () => {
    if (!planDetails?.snapshots || planDetails.snapshots.length === 0) {
      return {
        totalLifetime: parseFloat(totalLifetimeTax),
        averageAnnual: 0,
        peakYear: 0,
        peakAmount: 0,
        workingYearsTax: 0,
        retirementYearsTax: 0,
        effectiveRate: 0
      };
    }

    const snapshots = planDetails.snapshots;
    let totalTax = 0;
    let peakAmount = 0;
    let peakYear = 0;
    let workingYearsTax = 0;
    let retirementYearsTax = 0;
    let totalIncome = 0;
    
    // Assume retirement age is around 65 (you'd get this from plan details)
    const retirementAge = 65;

    snapshots.forEach(snapshot => {
      const yearTax = parseFloat(snapshot.taxesPaid || '0');
      const yearIncome = parseFloat(snapshot.grossIncome || '0');
      
      totalTax += yearTax;
      totalIncome += yearIncome;
      
      if (yearTax > peakAmount) {
        peakAmount = yearTax;
        peakYear = snapshot.year;
      }
      
      if (snapshot.age < retirementAge) {
        workingYearsTax += yearTax;
      } else {
        retirementYearsTax += yearTax;
      }
    });

    return {
      totalLifetime: totalTax,
      averageAnnual: snapshots.length > 0 ? totalTax / snapshots.length : 0,
      peakYear,
      peakAmount,
      workingYearsTax,
      retirementYearsTax,
      effectiveRate: totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0
    };
  };

  const taxMetrics = calculateTaxMetrics();
  
  // Tax efficiency assessment
  const getTaxEfficiencyRating = (effectiveRate: number) => {
    if (effectiveRate < 15) return { rating: 'Excellent', color: 'green', icon: CheckCircle };
    if (effectiveRate < 20) return { rating: 'Good', color: 'blue', icon: CheckCircle };
    if (effectiveRate < 25) return { rating: 'Average', color: 'yellow', icon: AlertCircle };
    return { rating: 'High', color: 'red', icon: AlertCircle };
  };

  const efficiency = getTaxEfficiencyRating(taxMetrics.effectiveRate);
  const EfficiencyIcon = efficiency.icon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Lifetime Tax Burden</CardTitle>
        <Receipt className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Lifetime Tax */}
          <div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(taxMetrics.totalLifetime)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={
                  efficiency.color === 'green' ? 'border-green-500 text-green-700' :
                  efficiency.color === 'blue' ? 'border-blue-500 text-blue-700' :
                  efficiency.color === 'yellow' ? 'border-yellow-500 text-yellow-700' :
                  'border-red-500 text-red-700'
                }
              >
                <EfficiencyIcon className="w-3 h-3 mr-1" />
                {efficiency.rating} Efficiency
              </Badge>
              <span className="text-xs text-muted-foreground">
                {taxMetrics.effectiveRate.toFixed(1)}% effective rate
              </span>
            </div>
          </div>

          {/* Tax Breakdown */}
          {planDetails?.snapshots && planDetails.snapshots.length > 0 && (
            <div className="space-y-3">
              {/* Working vs Retirement Tax Split */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Working Years</span>
                  <span className="font-medium">{formatCurrency(taxMetrics.workingYearsTax)}</span>
                </div>
                <Progress 
                  value={taxMetrics.totalLifetime > 0 ? (taxMetrics.workingYearsTax / taxMetrics.totalLifetime) * 100 : 0}
                  className="h-2 mb-1"
                />
                
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Retirement Years</span>
                  <span className="font-medium">{formatCurrency(taxMetrics.retirementYearsTax)}</span>
                </div>
                <Progress 
                  value={taxMetrics.totalLifetime > 0 ? (taxMetrics.retirementYearsTax / taxMetrics.totalLifetime) * 100 : 0}
                  className="h-2"
                />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-gray-500">Average Annual</p>
                  <p className="text-sm font-semibold">{formatCurrency(taxMetrics.averageAnnual)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Peak Year</p>
                  <p className="text-sm font-semibold">
                    {taxMetrics.peakYear > 0 ? `${formatCurrency(taxMetrics.peakAmount)} (${taxMetrics.peakYear})` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tax Optimization Insights */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Calculator className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Tax Optimization Opportunity</p>
                <p className="text-blue-700 text-xs">
                  {taxMetrics.effectiveRate < 15 
                    ? "Your tax strategy appears well-optimized. Consider maximizing Roth conversions during low-income years."
                    : taxMetrics.effectiveRate < 25 
                      ? "Consider tax-loss harvesting and Roth IRA conversions to reduce future tax burden."
                      : "High tax burden detected. Review tax-advantaged account contributions and withdrawal strategies."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}