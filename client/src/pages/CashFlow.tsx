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
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import ExpenseTracker from "@/components/cashflow/ExpenseTracker";
import AddExpenseForm from "@/components/cashflow/AddExpenseForm";
import RothConversionCashFlow from "@/components/cashflow/RothConversionCashFlow";

const CashFlow = () => {
  const [activeTab, setActiveTab] = useState("expenses");
  const userId = 1; // For demo purposes

  // Fetch retirement expenses
  const { 
    data: expensesData, 
    isLoading: isLoadingExpenses,
    error: expensesError
  } = useQuery({
    queryKey: [`/api/users/${userId}/retirement-expenses`],
  });

  if (isLoadingExpenses) {
    return (
      <div className="py-4">
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-[600px] mb-8" />
      </div>
    );
  }

  if (expensesError) {
    return <div className="py-4">Error loading expense data</div>;
  }

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    if (!expensesData) return 0;
    return expensesData.reduce((total: number, expense: any) => 
      total + Number(expense.estimatedMonthlyAmount), 0);
  };

  // Prepare data for pie chart
  const prepareChartData = () => {
    if (!expensesData || expensesData.length === 0) return [];
    
    // Group expenses by category
    const categoryGroups: Record<string, number> = {};
    
    expensesData.forEach((expense: any) => {
      const category = expense.category;
      const amount = Number(expense.estimatedMonthlyAmount);
      
      if (categoryGroups[category]) {
        categoryGroups[category] += amount;
      } else {
        categoryGroups[category] = amount;
      }
    });
    
    // Convert to chart data format
    return Object.entries(categoryGroups).map(([category, value]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value
    }));
  };

  const chartData = prepareChartData();
  const totalExpenses = calculateTotalExpenses();
  
  // Colors for pie chart
  const COLORS = ['#1E88E5', '#43A047', '#FFA000', '#9C27B0', '#F44336', '#607D8B', '#FF5722', '#795548'];
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const countEssentialExpenses = () => {
    if (!expensesData) return 0;
    return expensesData.filter((expense: any) => expense.isEssential).length;
  };

  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Cash Flow Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track and manage your expected retirement expenses.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-sm text-gray-500 mt-1">{expensesData?.length || 0} expense categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Essential Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                expensesData?.reduce((total: number, expense: any) => 
                  total + (expense.isEssential ? Number(expense.estimatedMonthlyAmount) : 0), 0) || 0
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{countEssentialExpenses()} essential categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Discretionary Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                expensesData?.reduce((total: number, expense: any) => 
                  total + (!expense.isEssential ? Number(expense.estimatedMonthlyAmount) : 0), 0) || 0
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {(expensesData?.length || 0) - countEssentialExpenses()} discretionary categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>
              Visual breakdown of your retirement expense categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No expense data available. Add your first expense.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Retirement Budget Recommendations</CardTitle>
            <CardDescription>
              Suggested expense allocation based on best practices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">General Guidelines</h3>
              <p className="text-sm text-gray-600">
                Financial planners often recommend the following expense allocation for retirees:
              </p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Housing (mortgage/rent, utilities, maintenance)</span>
                <span className="font-medium">30-35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "35%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Healthcare (insurance, medications, care)</span>
                <span className="font-medium">15-20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "20%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Food & Groceries</span>
                <span className="font-medium">10-15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "15%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Transportation</span>
                <span className="font-medium">10-15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "12%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Travel & Leisure</span>
                <span className="font-medium">10-15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: "10%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Other (gifts, charity, miscellaneous)</span>
                <span className="font-medium">5-10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: "8%" }}></div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full">Compare My Budget</Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="expenses" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">Manage Expenses</TabsTrigger>
          <TabsTrigger value="add">Add New Expense</TabsTrigger>
          <TabsTrigger value="roth-conversion">Roth Conversion Impact</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="mt-4">
          <ExpenseTracker 
            expenses={expensesData || []}
            userId={userId}
          />
        </TabsContent>
        
        <TabsContent value="add" className="mt-4">
          <AddExpenseForm 
            userId={userId}
            onSuccess={() => setActiveTab("expenses")}
          />
        </TabsContent>
        
        <TabsContent value="roth-conversion" className="mt-4">
          <RothConversionCashFlow userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlow;
