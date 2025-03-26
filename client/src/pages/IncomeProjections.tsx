import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  projectRetirementIncome,
  calculateMonthlyRetirementIncome,
  estimateSocialSecurityBenefits
} from "@/lib/retirement-calculations";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import IncomeCalculator from "@/components/income/IncomeCalculator";
import RetirementScenario from "@/components/income/RetirementScenario";

const IncomeProjections = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const userId = 1; // For demo purposes

  // Fetch user profile data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });

  // Fetch investment accounts
  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
    queryKey: [`/api/users/${userId}/investment-accounts`],
  });

  // Prepare and calculate projection data for charts
  const getProjectionData = () => {
    if (!userData || !accountsData) return [];

    const currentAge = userData.currentAge || 40;
    const retirementAge = userData.targetRetirementAge || 67;
    
    // Calculate total retirement portfolio value (only from retirement accounts)
    const retirementAccounts = accountsData.filter((account: any) => account.isRetirementAccount);
    const portfolioValue = retirementAccounts.reduce(
      (total: number, account: any) => total + Number(account.balance), 
      0
    );
    
    // Calculate monthly retirement income from portfolio
    const monthlyPortfolioIncome = calculateMonthlyRetirementIncome(portfolioValue);
    
    // Estimate Social Security benefits
    const monthlySocialSecurity = estimateSocialSecurityBenefits(
      currentAge,
      userData.currentIncome,
      retirementAge
    );
    
    // Generate projection data
    const projections = projectRetirementIncome(
      retirementAge,
      portfolioValue,
      0.04, // 4% withdrawal rate
      0.025, // 2.5% inflation
      monthlySocialSecurity,
      30 // Project for 30 years
    );
    
    // Convert projections to chart data format
    const chartData = [];
    
    // Add pre-retirement years (zero retirement income)
    for (let i = 0; i <= retirementAge - currentAge; i += 5) {
      chartData.push({
        age: currentAge + i,
        portfolioIncome: 0,
        socialSecurity: 0,
        total: 0
      });
    }
    
    // Add projection data
    projections.forEach(projection => {
      // Only add every 5 years to avoid cluttering the chart
      if ((projection.age - retirementAge) % 5 === 0 || projection.age === retirementAge) {
        chartData.push(projection);
      }
    });
    
    return chartData;
  };

  if (isLoadingUser || isLoadingAccounts) {
    return (
      <div className="py-4">
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-[600px] mb-8" />
      </div>
    );
  }

  const projectionData = getProjectionData();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Retirement Income Projections</h1>
        <p className="mt-1 text-sm text-gray-600">
          Visualize your potential retirement income and plan for your future.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Estimated Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData && accountsData ? formatCurrency(
                calculateMonthlyRetirementIncome(
                  accountsData.reduce((total: number, account: any) => 
                    total + (account.isRetirementAccount ? Number(account.balance) : 0), 0)
                ) + 
                estimateSocialSecurityBenefits(
                  userData.currentAge, 
                  userData.currentIncome, 
                  userData.targetRetirementAge
                )
              ) : "$0"}
            </div>
            <p className="text-sm text-gray-500 mt-1">at age {userData?.targetRetirementAge || 67}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Income Replacement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData && accountsData ? Math.round(
                (calculateMonthlyRetirementIncome(
                  accountsData.reduce((total: number, account: any) => 
                    total + (account.isRetirementAccount ? Number(account.balance) : 0), 0)
                ) + 
                estimateSocialSecurityBenefits(
                  userData.currentAge, 
                  userData.currentIncome, 
                  userData.targetRetirementAge
                )) / (userData.currentIncome / 12) * 100
              ) : 0}%
            </div>
            <p className="text-sm text-gray-500 mt-1">of current income</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Years to Retirement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData ? Math.max(0, (userData.targetRetirementAge || 67) - (userData.currentAge || 40)) : 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">based on target age {userData?.targetRetirementAge || 67}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Retirement Income Projection</CardTitle>
          <CardDescription>
            Projected monthly income throughout retirement based on your current portfolio and contributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={projectionData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="age" 
                  label={{ value: 'Age', position: 'insideBottomRight', offset: -10 }} 
                />
                <YAxis 
                  tickFormatter={(value) => `$${value / 1000}k`}
                  label={{ value: 'Monthly Income', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="portfolioIncome"
                  name="Portfolio Income"
                  stroke="#1E88E5"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="socialSecurity"
                  name="Social Security"
                  stroke="#43A047"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Income"
                  stroke="#9C27B0"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calculator" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Income Calculator</TabsTrigger>
          <TabsTrigger value="scenarios">Retirement Scenarios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="mt-4">
          <IncomeCalculator 
            userData={userData} 
            accountsData={accountsData} 
          />
        </TabsContent>
        
        <TabsContent value="scenarios" className="mt-4">
          <RetirementScenario 
            userData={userData} 
            accountsData={accountsData} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncomeProjections;
