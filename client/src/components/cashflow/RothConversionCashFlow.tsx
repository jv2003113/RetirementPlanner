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
import { TrendingUp, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RothConversionCashFlowProps {
  userId: number;
}

interface Scenario {
  year: number;
  age: number;
  conversionAmount: number;
  taxCost: number;
  traditionalBalance: number;
  rothBalance: number;
  netWorth: number;
}

interface ScenariosResponse {
  plan: any;
  scenarios: Scenario[];
}

const RothConversionCashFlow = ({ userId }: RothConversionCashFlowProps) => {
  const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: [`/api/users/${userId}/roth-conversion-plans`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Get the most recent active plan
  const activePlans = plans && Array.isArray(plans) ? plans.filter((plan: any) => plan.isActive) : [];
  const latestPlan = activePlans.length > 0 
    ? activePlans.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] 
    : null;

  console.log('All plans:', plans);
  console.log('Active plans:', activePlans);
  console.log('Latest plan:', latestPlan);

  // Fetch scenarios for the latest plan
  const { data: scenarios, isLoading: scenariosLoading, error: scenariosError, refetch: refetchScenarios } = useQuery({
    queryKey: [`/api/roth-conversion-plans/${latestPlan?.id}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!latestPlan?.id, // Only run this query if we have a plan ID
    staleTime: 0, // Always consider this data stale to force fresh fetch
  });

  const formatCurrency = (value: number) => {
    if (!value || isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number | string) => {
    if (!value) return '0.0%';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0.0%';
    return `${numValue.toFixed(1)}%`;
  };

  // Calculate cash flow impact from Roth conversions
  const calculateCashFlowImpact = () => {
    const scenariosData = scenarios as ScenariosResponse | null;
    console.log('Scenarios data:', scenariosData);
    console.log('Latest plan:', latestPlan);
    
    if (!scenariosData || !scenariosData.scenarios || !Array.isArray(scenariosData.scenarios)) {
      // If we have a plan but no scenarios, try to refetch
      if (latestPlan?.id && !scenariosLoading) {
        console.log('No scenarios found, attempting refetch...');
        setTimeout(() => refetchScenarios(), 1000);
      }
      return [];
    }

    return scenariosData.scenarios.map((scenario: Scenario) => ({
      year: scenario.year || 0,
      age: scenario.age || 0,
      conversionAmount: scenario.conversionAmount || 0,
      taxCost: scenario.taxCost || 0,
      netConversion: (scenario.conversionAmount || 0) - (scenario.taxCost || 0),
      traditionalBalance: scenario.traditionalBalance || 0,
      rothBalance: scenario.rothBalance || 0,
      totalNetWorth: scenario.netWorth || 0,
    }));
  };

  const cashFlowData = calculateCashFlowImpact();

  // Loading state
  if (plansLoading || scenariosLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Roth Conversion Cash Flow Impact
          </CardTitle>
          <CardDescription>
            Loading Roth conversion data...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Error state
  if (plansError || scenariosError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Roth Conversion Cash Flow Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading Roth conversion data. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No plans state
  if (!plans || !Array.isArray(plans) || plans.length === 0 || activePlans.length === 0) {
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

  // No scenarios state
  const scenariosData = scenarios as ScenariosResponse | null;
  if (!scenariosData || !scenariosData.scenarios || scenariosData.scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Roth Conversion Cash Flow Impact
          </CardTitle>
          <CardDescription>
            No conversion scenarios found for this plan.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
              {formatCurrency(latestPlan?.conversionAmount || 0)}
            </div>
            <p className="text-sm text-blue-700">
              Over {latestPlan?.yearsToConvert || 0} years
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-900">Total Tax Cost</h3>
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(
                cashFlowData.reduce((total: number, year: any) => total + (year.taxCost || 0), 0)
              )}
            </div>
            <p className="text-sm text-red-700">
              Tax rate: {formatPercentage(latestPlan?.currentTaxRate || 0)}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Net Conversion</h3>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(
                cashFlowData.reduce((total: number, year: any) => total + (year.netConversion || 0), 0)
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
                  cashFlowData.reduce((total: number, year: any) => total + (year.taxCost || 0), 0) / (latestPlan?.yearsToConvert || 1)
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