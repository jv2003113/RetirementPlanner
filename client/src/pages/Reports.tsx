import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  FileText,
  Download,
  Printer,
  Mail,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

import { useAuth } from "@/contexts/AuthContext";

import { User, InvestmentAccount, RetirementGoal, RetirementExpense, AnnualSnapshot } from "@shared/schema";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { user } = useAuth();
  const userId = user?.id;

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  // Fetch investment accounts
  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery<InvestmentAccount[]>({
    queryKey: [`/api/users/${userId}/investment-accounts`],
    enabled: !!userId,
  });

  // Fetch retirement goals
  const { data: goalsData, isLoading: isLoadingGoals } = useQuery<RetirementGoal[]>({
    queryKey: [`/api/users/${userId}/retirement-goals`],
    enabled: !!userId,
  });

  // Fetch retirement expenses
  const { data: expensesData, isLoading: isLoadingExpenses } = useQuery<RetirementExpense[]>({
    queryKey: [`/api/users/${userId}/retirement-expenses`],
    enabled: !!userId,
  });

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery<any>({
    queryKey: [`/api/users/${userId}/dashboard`],
    enabled: !!userId,
  });

  if (isLoadingUser || isLoadingAccounts || isLoadingGoals || isLoadingExpenses || isLoadingDashboard) {
    return (
      <div className="py-4">
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-[600px] mb-8" />
      </div>
    );
  }

  if (!userData || !userId) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p className="text-muted-foreground">Please log in to access reports.</p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMMM d, yyyy');
  };

  // Calculate portfolio allocation data
  const calculatePortfolioData = () => {
    if (!dashboardData) return [];

    return [
      { name: "Stocks", value: dashboardData.portfolioAllocation.categories.stocks.value },
      { name: "Bonds", value: dashboardData.portfolioAllocation.categories.bonds.value },
      { name: "Real Estate", value: dashboardData.portfolioAllocation.categories.realEstate.value },
      { name: "Cash", value: dashboardData.portfolioAllocation.categories.cash.value }
    ];
  };

  const COLORS = ['#1E88E5', '#43A047', '#FFA000', '#9C27B0'];

  // Calculate total expenses by category
  const calculateExpensesByCategory = () => {
    if (!expensesData) return [];

    const categories: Record<string, number> = {};

    expensesData.forEach((expense: any) => {
      const category = expense.category;
      const amount = Number(expense.estimatedMonthlyAmount);

      if (categories[category]) {
        categories[category] += amount;
      } else {
        categories[category] = amount;
      }
    });

    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value
    }));
  };

  // Calculate income vs expenses data
  const calculateIncomeVsExpenses = () => {
    if (!dashboardData || !expensesData) return [];

    const totalMonthlyExpenses = expensesData.reduce(
      (sum: number, expense: any) => sum + Number(expense.estimatedMonthlyAmount),
      0
    );

    return [
      {
        name: "Current",
        income: (userData?.currentIncome ? Number(userData.currentIncome) : 0) / 12,
        expenses: totalMonthlyExpenses * 0.7 // Assuming current expenses are lower
      },
      {
        name: "Retirement",
        income: dashboardData.monthlyIncome.projected,
        expenses: totalMonthlyExpenses
      }
    ];
  };

  // Generate retirement readiness data
  const generateRetirementReadinessData = () => {
    if (!dashboardData) return [];

    return [
      {
        name: "Retirement Readiness",
        score: dashboardData.retirementReadiness.score,
        target: 100
      }
    ];
  };

  const portfolioData = calculatePortfolioData();
  const expenseData = calculateExpensesByCategory();
  const incomeVsExpensesData = calculateIncomeVsExpenses();
  const retirementReadinessData = generateRetirementReadinessData();

  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analysis</h1>
        <p className="mt-1 text-sm text-gray-600">
          Generate and review comprehensive reports about your retirement planning.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Retirement Planning Report</CardTitle>
              <CardDescription>
                Generated on {format(new Date(), 'MMMM d, yyyy')}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="h-4 w-4 mr-1" /> Download PDF
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Mail className="h-4 w-4 mr-1" /> Email
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Retirement Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.retirementReadiness.score}%
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Target age: {dashboardData.retirementReadiness.targetRetirementAge}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Monthly Income in Retirement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(dashboardData.monthlyIncome.projected)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {dashboardData.monthlyIncome.percentOfCurrent}% of current income
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(dashboardData.portfolioAllocation.total)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  across {accountsData?.length || 0} accounts
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" /> Summary Report
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center">
                <PieChartIcon className="h-4 w-4 mr-2" /> Portfolio Analysis
              </TabsTrigger>
              <TabsTrigger value="projection" className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" /> Retirement Projection
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Retirement Readiness</CardTitle>
                    <CardDescription>
                      Current status toward your retirement goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={retirementReadinessData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                          <Legend />
                          <Bar dataKey="score" name="Current Score" fill="#1E88E5" />
                          <Bar dataKey="target" name="Target" fill="#43A047" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Retirement Age</span>
                        <span className="font-medium">{dashboardData.retirementReadiness.targetRetirementAge}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Current Age</span>
                        <span className="font-medium">{userData?.currentAge || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Years to Retirement</span>
                        <span className="font-medium">{dashboardData.retirementReadiness.targetRetirementAge - (userData?.currentAge || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Income vs. Expenses</CardTitle>
                    <CardDescription>
                      Comparing income and expenses now and in retirement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={incomeVsExpensesData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                          <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                          <Legend />
                          <Bar dataKey="income" name="Monthly Income" fill="#43A047" />
                          <Bar dataKey="expenses" name="Monthly Expenses" fill="#F44336" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Income Replacement Rate</span>
                        <span className="font-medium">{dashboardData.monthlyIncome.percentOfCurrent}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Monthly Expenses in Retirement</span>
                        <span className="font-medium">{formatCurrency(4500)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Retirement Goals Summary</CardTitle>
                  <CardDescription>
                    Overview of your defined retirement goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Goal Description</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Priority</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Monthly Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {goalsData && goalsData.length > 0 ? (
                          goalsData.map((goal: any) => (
                            <tr key={goal.id}>
                              <td className="px-4 py-3 text-sm">{goal.description}</td>
                              <td className="px-4 py-3 text-sm capitalize">{goal.category}</td>
                              <td className="px-4 py-3 text-sm">{goal.priority}</td>
                              <td className="px-4 py-3 text-sm text-right">
                                {goal.targetMonthlyIncome ? formatCurrency(goal.targetMonthlyIncome) : "—"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-sm text-center text-gray-500">
                              No retirement goals defined yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-medium">Recommendations</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Increase Retirement Contributions</h4>
                        <p className="text-sm mt-1">
                          Increasing your retirement contributions by 2% could significantly boost your retirement readiness score and projected income.
                        </p>
                        <Button variant="link" size="sm" className="pl-0 mt-1 flex items-center">
                          Learn more <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Review Healthcare Planning</h4>
                        <p className="text-sm mt-1">
                          Complete your healthcare planning to ensure your retirement expense projections are accurate. Medical costs are a significant part of retirement expenses.
                        </p>
                        <Button variant="link" size="sm" className="pl-0 mt-1 flex items-center">
                          Complete healthcare planning <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Asset Allocation</CardTitle>
                    <CardDescription>
                      Current distribution of your investment portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={portfolioData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {portfolioData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {portfolioData.map((item, index) => (
                        <div key={`item-${index}`} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></span>
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Expense Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of your expected retirement expenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {expenseData.slice(0, 6).map((item, index) => (
                        <div key={`expense-${index}`} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></span>
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investment Accounts Summary</CardTitle>
                  <CardDescription>
                    Overview of your retirement and investment accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Account Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Balance</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Monthly Contribution</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Annual Return</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {accountsData && accountsData.map((account: any) => (
                          <tr key={account.id}>
                            <td className="px-4 py-3 text-sm">{account.accountName}</td>
                            <td className="px-4 py-3 text-sm capitalize">
                              {account.accountType.replace('_', ' ')}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              {formatCurrency(account.balance)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              {account.contributionFrequency !== "none"
                                ? formatCurrency(account.contributionAmount)
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">{account.annualReturn}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projection" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Retirement Financial Overview</CardTitle>
                  <CardDescription>
                    Projected income and expenses throughout retirement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            age: "65",
                            portfolioIncome: 3500,
                            socialSecurity: 0,
                            expenses: 4800
                          },
                          {
                            age: "67",
                            portfolioIncome: 3800,
                            socialSecurity: 1450,
                            expenses: 4800
                          },
                          {
                            age: "70",
                            portfolioIncome: 4000,
                            socialSecurity: 1500,
                            expenses: 5000
                          },
                          {
                            age: "75",
                            portfolioIncome: 4200,
                            socialSecurity: 1600,
                            expenses: 5200
                          },
                          {
                            age: "80",
                            portfolioIncome: 4300,
                            socialSecurity: 1700,
                            expenses: 5500
                          },
                          {
                            age: "85",
                            portfolioIncome: 4400,
                            socialSecurity: 1800,
                            expenses: 5800
                          },
                          {
                            age: "90",
                            portfolioIncome: 4500,
                            socialSecurity: 1900,
                            expenses: 6100
                          }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -10 }} />
                        <YAxis
                          tickFormatter={(value) => `$${value / 1000}k`}
                          label={{ value: 'Monthly Amount', angle: -90, position: 'insideLeft', offset: 10 }}
                        />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                        <Legend />
                        <Bar
                          dataKey="portfolioIncome"
                          name="Portfolio Income"
                          stackId="a"
                          fill="#1E88E5"
                        />
                        <Bar
                          dataKey="socialSecurity"
                          name="Social Security"
                          stackId="a"
                          fill="#43A047"
                        />
                        <Bar
                          dataKey="expenses"
                          name="Expenses"
                          fill="#F44336"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Long-term Portfolio Projection</CardTitle>
                    <CardDescription>
                      Estimated future value of your investment portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Current Portfolio Value</span>
                        <span className="font-medium">{formatCurrency(dashboardData.portfolioAllocation.total)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Estimated Value at Retirement (Age {dashboardData.retirementReadiness.targetRetirementAge})</span>
                        <span className="font-medium">{formatCurrency(dashboardData.portfolioAllocation.total * 1.8)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Estimated Value at Age 75</span>
                        <span className="font-medium">{formatCurrency(dashboardData.portfolioAllocation.total * 1.6)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Estimated Value at Age 85</span>
                        <span className="font-medium">{formatCurrency(dashboardData.portfolioAllocation.total * 1.3)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Estimated Value at Age 95</span>
                        <span className="font-medium">{formatCurrency(dashboardData.portfolioAllocation.total * 0.9)}</span>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                      <h4 className="font-medium">Assumptions</h4>
                      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                        <li>Average annual return: 7%</li>
                        <li>Inflation: 2.5% annually</li>
                        <li>Withdrawal rate: 4% annually in retirement</li>
                        <li>Social Security begins at age 67</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scenario Analysis</CardTitle>
                    <CardDescription>
                      How different scenarios might affect your retirement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Baseline Scenario</h3>
                        <div className="flex justify-between items-center text-sm">
                          <span>Monthly Income in Retirement</span>
                          <span>{formatCurrency(dashboardData.monthlyIncome.projected)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Portfolio Longevity</span>
                          <span>30+ years</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Optimistic Scenario</h3>
                        <div className="flex justify-between items-center text-sm">
                          <span>Monthly Income in Retirement</span>
                          <span>{formatCurrency(dashboardData.monthlyIncome.projected * 1.2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Portfolio Longevity</span>
                          <span>35+ years</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Key Factor</span>
                          <span>9% annual returns</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Pessimistic Scenario</h3>
                        <div className="flex justify-between items-center text-sm">
                          <span>Monthly Income in Retirement</span>
                          <span>{formatCurrency(dashboardData.monthlyIncome.projected * 0.8)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Portfolio Longevity</span>
                          <span>23 years</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Key Factor</span>
                          <span>5% annual returns</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium">Recommendation</h4>
                      <p className="text-sm mt-2">
                        Consider increasing your savings rate by 2-3% to improve portfolio longevity in the pessimistic scenario and further enhance your retirement security.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline">Schedule Advisor Consultation</Button>
          <Button>Generate Full Report</Button>
        </CardFooter>
      </Card>

      <div className="mb-12">
        <h2 className="text-lg font-medium mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Comprehensive Retirement Report</CardTitle>
              <CardDescription>
                Complete analysis of your retirement plan with detailed projections
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Portfolio analysis and recommendations</li>
                <li>Expense analysis</li>
                <li>Tax considerations</li>
                <li>Monte Carlo simulation results</li>
              </ul>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full">Generate Report</Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Social Security Analysis</CardTitle>
              <CardDescription>
                Detailed analysis of Social Security claiming strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Estimated benefit calculations</li>
                <li>Optimal claiming age analysis</li>
                <li>Spousal benefit strategies</li>
                <li>Break-even analysis</li>
                <li>Integration with overall retirement plan</li>
              </ul>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full">Generate Report</Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Tax Efficiency Report</CardTitle>
              <CardDescription>
                Analysis of tax implications for your retirement strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Withdrawal strategy recommendations</li>
                <li>Roth conversion analysis</li>
                <li>Tax-efficient investment placement</li>
                <li>Required Minimum Distribution planning</li>
                <li>Estate tax considerations</li>
              </ul>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full">Generate Report</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
