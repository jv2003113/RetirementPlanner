import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";

interface RothConversionCashFlowProps {
  userId: number;
}

const RothConversionCashFlow = ({ userId }: RothConversionCashFlowProps) => {
  const { data: plans } = useQuery({
    queryKey: [`/api/users/${userId}/roth-conversion-plans`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate cash flow impact from Roth conversions
  const calculateCashFlowImpact = () => {
    if (!plans || (plans as any[]).length === 0) return [];

    const activePlans = (plans as any[]).filter((plan: any) => plan.isActive);
    if (activePlans.length === 0) return [];

    // Get the most recent active plan
    const latestPlan = activePlans[0];
    
    // Fetch scenarios for this plan
    const { data: scenarios } = useQuery({
      queryKey: [`/api/roth-conversion-plans/${latestPlan.id}`],
      queryFn: getQueryFn({ on401: "returnNull" }),
    });

    if (!scenarios || !(scenarios as any).scenarios) return [];

    // Calculate cash flow impact for each year
    return (scenarios as any).scenarios.map((scenario: any) => ({
      year: scenario.year,
      age: scenario.age,
      conversionAmount: scenario.conversionAmount,
      taxCost: scenario.taxCost,
      netConversion: scenario.conversionAmount - scenario.taxCost,
      traditionalBalance: scenario.traditionalBalance,
      rothBalance: scenario.rothBalance,
      totalNetWorth: scenario.netWorth,
    }));
  };

  const cashFlowData = calculateCashFlowImpact();

  if (!plans || (plans as any[]).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Roth Conversion Cash Flow Impact
          </CardTitle>
          <CardDescription>
            No active Roth conversion plans found. Create a plan to see cash flow impact.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const activePlans = (plans as any[]).filter((plan: any) => plan.isActive);
  const latestPlan = activePlans[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Roth Conversion Cash Flow Impact
        </CardTitle>
        <CardDescription>
          How your Roth conversion strategy affects your cash flow and tax burden over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Total Conversion Amount</h3>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(latestPlan.conversionAmount)}
            </div>
            <p className="text-sm text-blue-700">
              Over {latestPlan.yearsToConvert} years
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-900">Total Tax Cost</h3>
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(
                cashFlowData.reduce((total: number, year: any) => total + year.taxCost, 0)
              )}
            </div>
            <p className="text-sm text-red-700">
              Tax rate: {formatPercentage(latestPlan.currentTaxRate)}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Net Conversion</h3>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(
                cashFlowData.reduce((total: number, year: any) => total + year.netConversion, 0)
              )}
            </div>
            <p className="text-sm text-green-700">
              After-tax amount
            </p>
          </div>
        </div>

        {cashFlowData.length > 0 && (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="conversionAmount"
                  name="Conversion Amount"
                  stroke="#1E88E5"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="taxCost"
                  name="Tax Cost"
                  stroke="#F44336"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="netConversion"
                  name="Net Conversion"
                  stroke="#43A047"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <h3 className="font-medium">Cash Flow Impact Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">During Conversion Years:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Additional tax burden of {formatCurrency(
                  cashFlowData.reduce((total: number, year: any) => total + year.taxCost, 0) / latestPlan.yearsToConvert
                )} per year</li>
                <li>Reduced traditional IRA balance</li>
                <li>Increased Roth IRA balance (tax-free growth)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">In Retirement:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Tax-free withdrawals from Roth IRA</li>
                <li>Reduced RMDs from traditional IRA</li>
                <li>Lower overall tax burden</li>
                <li>More flexible withdrawal strategy</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RothConversionCashFlow; 