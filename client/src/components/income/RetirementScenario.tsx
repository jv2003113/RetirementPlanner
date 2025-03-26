import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  calculateFutureValue,
  calculateMonthlyRetirementIncome
} from "@/lib/retirement-calculations";

interface RetirementScenarioProps {
  userData: any;
  accountsData: any[];
}

const RetirementScenario = ({ userData, accountsData }: RetirementScenarioProps) => {
  const [savingsRateChange, setSavingsRateChange] = useState(0);
  const [retirementAgeChange, setRetirementAgeChange] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState("baseline");

  // Current stats
  const currentAge = userData?.currentAge || 40;
  const currentRetirementAge = userData?.targetRetirementAge || 67;
  const currentPortfolioValue = accountsData?.reduce((total: number, account: any) => 
    total + (account.isRetirementAccount ? Number(account.balance) : 0), 0) || 100000;
  const currentMonthlyContribution = accountsData?.reduce((total: number, account: any) => 
    total + (account.contributionFrequency === "monthly" && account.isRetirementAccount ? 
      Number(account.contributionAmount) : 0), 0) || 500;

  // Calculate modified values based on scenarios
  const modifiedRetirementAge = currentRetirementAge + retirementAgeChange;
  const modifiedMonthlyContribution = currentMonthlyContribution * (1 + savingsRateChange / 100);
  
  // Years to retirement
  const yearsToRetirement = Math.max(0, modifiedRetirementAge - currentAge);

  // Calculate scenario outcomes
  const calculateScenario = (scenarioType: string) => {
    let projectedValue = 0;
    let monthlyIncome = 0;
    
    switch (scenarioType) {
      case "baseline":
        projectedValue = calculateFutureValue(
          currentPortfolioValue,
          0.07, // 7% return
          yearsToRetirement,
          currentMonthlyContribution
        );
        monthlyIncome = calculateMonthlyRetirementIncome(projectedValue);
        break;
      case "optimistic":
        projectedValue = calculateFutureValue(
          currentPortfolioValue,
          0.09, // 9% return
          yearsToRetirement,
          modifiedMonthlyContribution
        );
        monthlyIncome = calculateMonthlyRetirementIncome(projectedValue);
        break;
      case "pessimistic":
        projectedValue = calculateFutureValue(
          currentPortfolioValue,
          0.05, // 5% return
          yearsToRetirement,
          modifiedMonthlyContribution
        );
        monthlyIncome = calculateMonthlyRetirementIncome(projectedValue);
        break;
    }
    
    return {
      projectedValue,
      monthlyIncome
    };
  };

  // Get scenario data
  const baselineScenario = calculateScenario("baseline");
  const optimisticScenario = calculateScenario("optimistic");
  const pessimisticScenario = calculateScenario("pessimistic");

  // Prepare chart data
  const chartData = [
    {
      name: "Baseline",
      portfolioValue: baselineScenario.projectedValue,
      monthlyIncome: baselineScenario.monthlyIncome,
    },
    {
      name: "Optimistic",
      portfolioValue: optimisticScenario.projectedValue,
      monthlyIncome: optimisticScenario.monthlyIncome,
    },
    {
      name: "Pessimistic",
      portfolioValue: pessimisticScenario.projectedValue,
      monthlyIncome: pessimisticScenario.monthlyIncome,
    },
  ];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get scenario details
  const getScenarioDetails = () => {
    switch (selectedScenario) {
      case "baseline":
        return {
          title: "Baseline Scenario",
          description: "Based on your current savings rate and a 7% average annual return.",
          returnRate: "7%",
          monthlyContribution: formatCurrency(currentMonthlyContribution),
          projectedValue: formatCurrency(baselineScenario.projectedValue),
          monthlyIncome: formatCurrency(baselineScenario.monthlyIncome),
          retirementAge: currentRetirementAge
        };
      case "optimistic":
        return {
          title: "Optimistic Scenario",
          description: "Assumes a 9% average annual return and your adjusted savings rate.",
          returnRate: "9%",
          monthlyContribution: formatCurrency(modifiedMonthlyContribution),
          projectedValue: formatCurrency(optimisticScenario.projectedValue),
          monthlyIncome: formatCurrency(optimisticScenario.monthlyIncome),
          retirementAge: modifiedRetirementAge
        };
      case "pessimistic":
        return {
          title: "Pessimistic Scenario",
          description: "Assumes a 5% average annual return and your adjusted savings rate.",
          returnRate: "5%",
          monthlyContribution: formatCurrency(modifiedMonthlyContribution),
          projectedValue: formatCurrency(pessimisticScenario.projectedValue),
          monthlyIncome: formatCurrency(pessimisticScenario.monthlyIncome),
          retirementAge: modifiedRetirementAge
        };
      default:
        return {
          title: "Baseline Scenario",
          description: "Based on your current savings rate and a 7% average annual return.",
          returnRate: "7%",
          monthlyContribution: formatCurrency(currentMonthlyContribution),
          projectedValue: formatCurrency(baselineScenario.projectedValue),
          monthlyIncome: formatCurrency(baselineScenario.monthlyIncome),
          retirementAge: currentRetirementAge
        };
    }
  };

  const scenarioDetails = getScenarioDetails();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Retirement Scenarios Comparison</CardTitle>
          <CardDescription>
            Compare different retirement scenarios based on various assumptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="portfolio">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="portfolio">Portfolio Value</TabsTrigger>
              <TabsTrigger value="income">Monthly Income</TabsTrigger>
            </TabsList>
            <TabsContent value="portfolio" className="mt-4">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `$${value / 1000000}M`}
                      label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar 
                      dataKey="portfolioValue" 
                      name="Portfolio Value" 
                      fill="#1E88E5" 
                      onClick={(data) => setSelectedScenario(data.name.toLowerCase())}
                      className="cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="income" className="mt-4">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `$${value / 1000}k`}
                      label={{ value: 'Monthly Income', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar 
                      dataKey="monthlyIncome" 
                      name="Monthly Income" 
                      fill="#43A047"
                      onClick={(data) => setSelectedScenario(data.name.toLowerCase())}
                      className="cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="space-y-4 w-full">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Adjust Savings Rate: {savingsRateChange > 0 ? `+${savingsRateChange}%` : `${savingsRateChange}%`}</label>
                <span className="text-sm text-gray-500">{formatCurrency(modifiedMonthlyContribution)}/month</span>
              </div>
              <Slider
                value={[savingsRateChange]}
                min={-50}
                max={100}
                step={5}
                onValueChange={(value) => setSavingsRateChange(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Adjust Retirement Age: {retirementAgeChange > 0 ? `+${retirementAgeChange}` : retirementAgeChange} years</label>
                <span className="text-sm text-gray-500">Age {modifiedRetirementAge}</span>
              </div>
              <Slider
                value={[retirementAgeChange]}
                min={-5}
                max={10}
                step={1}
                onValueChange={(value) => setRetirementAgeChange(value[0])}
              />
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{scenarioDetails.title}</CardTitle>
          <CardDescription>
            {scenarioDetails.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            defaultValue="baseline" 
            value={selectedScenario}
            onValueChange={setSelectedScenario}
            className="mb-6"
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="baseline" id="baseline" />
              <Label htmlFor="baseline">Baseline</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="optimistic" id="optimistic" />
              <Label htmlFor="optimistic">Optimistic</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pessimistic" id="pessimistic" />
              <Label htmlFor="pessimistic">Pessimistic</Label>
            </div>
          </RadioGroup>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Average Annual Return</h3>
              <div className="font-medium">{scenarioDetails.returnRate}</div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Monthly Contribution</h3>
              <div className="font-medium">{scenarioDetails.monthlyContribution}</div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Retirement Age</h3>
              <div className="font-medium">{scenarioDetails.retirementAge}</div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500">Projected Portfolio Value</h3>
              <div className="text-xl font-bold">{scenarioDetails.projectedValue}</div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Projected Monthly Income</h3>
              <div className="text-xl font-bold">{scenarioDetails.monthlyIncome}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button className="w-full">Save This Scenario</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RetirementScenario;
