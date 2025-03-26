import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface IncomeProjection {
  portfolioIncome: number;
  socialSecurity: number;
  estimatedExpenses: number;
}

interface IncomeProjectionChartProps {
  data: IncomeProjection;
}

const IncomeProjectionChart = ({ data }: IncomeProjectionChartProps) => {
  // Generate projection data for the chart
  const generateProjectionData = () => {
    const currentYear = new Date().getFullYear();
    const projectionData = [];

    for (let i = 0; i <= 30; i += 5) {
      const year = currentYear + i;
      const age = 40 + i; // Assuming the user is 40 now
      let portfolioIncome = 0;
      let socialSecurity = 0;

      // Start portfolio income at retirement (estimated at age 65)
      if (age >= 65) {
        portfolioIncome = data.portfolioIncome;
      }

      // Start social security at age 67
      if (age >= 67) {
        socialSecurity = data.socialSecurity;
      }

      // Calculate expenses with inflation (assuming 2% annual)
      const inflationFactor = Math.pow(1.02, i);
      const estimatedExpenses = Math.round(data.estimatedExpenses * inflationFactor);

      projectionData.push({
        year,
        portfolioIncome,
        socialSecurity,
        estimatedExpenses,
        total: portfolioIncome + socialSecurity
      });
    }

    return projectionData;
  };

  const chartData = generateProjectionData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Retirement Income Projection</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Line
                type="monotone"
                dataKey="portfolioIncome"
                stroke="#1E88E5"
                name="Portfolio Income"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="socialSecurity"
                stroke="#43A047"
                name="Social Security"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="estimatedExpenses"
                stroke="#9E9E9E"
                name="Est. Expenses"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-primary mr-2"></span>
              <span className="text-gray-600">Portfolio Income</span>
            </div>
            <span className="font-medium">{formatCurrency(data.portfolioIncome)}/month</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#43A047] mr-2"></span>
              <span className="text-gray-600">Social Security</span>
            </div>
            <span className="font-medium">{formatCurrency(data.socialSecurity)}/month</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
              <span className="text-gray-600">Estimated Expenses</span>
            </div>
            <span className="font-medium">{formatCurrency(data.estimatedExpenses)}/month</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <a href="/income-projections" className="text-sm font-medium text-primary hover:text-primary-dark">
          Run income simulation →
        </a>
      </CardFooter>
    </Card>
  );
};

export default IncomeProjectionChart;
