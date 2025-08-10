import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine
} from "recharts";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  GraduationCap,
  Heart,
  Plane,
  Gift,
  Building,
  Users,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@shared/schema";

const CashFlow = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const { user: authUser } = useAuth();
  const userId = authUser?.id || 1;

  // Fetch user data
  const { 
    data: userData, 
    isLoading: isLoadingUser
  } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  if (isLoadingUser) {
    return (
      <div className="py-4">
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-[600px] mb-8" />
      </div>
    );
  }

  // Generate cashflow projection data
  const cashflowData = useMemo(() => {
    if (!userData) return [];

    const currentAge = userData.currentAge || 30;
    const retirementAge = userData.targetRetirementAge || 65;
    const currentIncome = parseFloat(userData.currentIncome || '0');
    const currentYear = new Date().getFullYear();
    
    // Calculate monthly expenses from userData.expenses
    const monthlyExpenses = userData.expenses 
      ? (userData.expenses as any[]).reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0)
      : 3000; // Default if no expenses

    const annualExpenses = monthlyExpenses * 12;

    const data = [];
    for (let i = 0; i <= 40; i++) { // 40-year projection
      const year = currentYear + i;
      const age = currentAge + i;
      const isRetired = age >= retirementAge;
      
      // Income calculation
      let income = 0;
      if (!isRetired) {
        // Working years - assume 3% growth
        income = currentIncome * Math.pow(1.03, i);
      } else {
        // Retirement years - assume 70% of final working income
        const finalWorkingIncome = currentIncome * Math.pow(1.03, retirementAge - currentAge);
        income = finalWorkingIncome * 0.7; // Social Security + retirement savings
      }

      // Expenses calculation - assume 2% inflation
      const expenses = annualExpenses * Math.pow(1.02, i);
      
      // Net cashflow
      const netCashflow = income - expenses;
      
      data.push({
        year,
        age,
        income: Math.round(income),
        expenses: Math.round(expenses),
        netCashflow: Math.round(netCashflow),
        isRetired,
        isSelectedYear: year === selectedYear
      });
    }
    
    return data;
  }, [userData, selectedYear]);

  // Important events and milestones
  const timelineEvents = useMemo(() => {
    if (!userData) return [];

    const currentAge = userData.currentAge || 30;
    const retirementAge = userData.targetRetirementAge || 65;
    const currentYear = new Date().getFullYear();

    const events = [
      {
        year: currentYear,
        age: currentAge,
        title: "Today",
        description: "Current financial situation",
        icon: Calendar,
        color: "bg-blue-500",
        type: "milestone"
      },
      {
        year: currentYear + (50 - currentAge),
        age: 50,
        title: "Catch-up Contributions",
        description: "401(k) catch-up contributions available",
        icon: TrendingUp,
        color: "bg-green-500",
        type: "opportunity"
      },
      {
        year: currentYear + (59.5 - currentAge),
        age: 59.5,
        title: "Penalty-Free Withdrawals",
        description: "401(k)/IRA withdrawals without penalty",
        icon: DollarSign,
        color: "bg-yellow-500",
        type: "opportunity"
      },
      {
        year: currentYear + (62 - currentAge),
        age: 62,
        title: "Early Social Security",
        description: "Reduced Social Security benefits available",
        icon: Users,
        color: "bg-orange-500",
        type: "option"
      },
      {
        year: currentYear + (65 - currentAge),
        age: 65,
        title: "Medicare Eligibility",
        description: "Medicare coverage begins",
        icon: Heart,
        color: "bg-red-500",
        type: "milestone"
      },
      {
        year: currentYear + (retirementAge - currentAge),
        age: retirementAge,
        title: "Target Retirement",
        description: "Planned retirement date",
        icon: Target,
        color: "bg-purple-500",
        type: "goal"
      },
      {
        year: currentYear + (67 - currentAge),
        age: 67,
        title: "Full Social Security",
        description: "Full Social Security benefits",
        icon: Building,
        color: "bg-indigo-500",
        type: "milestone"
      },
      {
        year: currentYear + (73 - currentAge),
        age: 73,
        title: "Required Distributions",
        description: "RMDs from retirement accounts",
        icon: TrendingDown,
        color: "bg-gray-500",
        type: "requirement"
      }
    ].filter(event => event.age > currentAge && event.age <= currentAge + 40);

    return events;
  }, [userData]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const selectedYearData = cashflowData.find(d => d.year === selectedYear);
  
  // Prepare Sankey-style data for the selected year
  const sankeyData = useMemo(() => {
    if (!selectedYearData || !userData) return null;

    const expenses = userData.expenses as any[] || [];
    const incomeBreakdown = [
      { name: 'Primary Income', value: selectedYearData.income * 0.7 },
      { name: 'Investment Returns', value: selectedYearData.income * 0.2 },
      { name: 'Other Income', value: selectedYearData.income * 0.1 }
    ];

    const expenseBreakdown = expenses.length > 0 
      ? expenses.map(expense => ({
          name: expense.category?.charAt(0).toUpperCase() + expense.category?.slice(1).replace('_', ' ') || 'Other',
          value: parseFloat(expense.amount || '0') * 12
        }))
      : [
          { name: 'Housing', value: selectedYearData.expenses * 0.35 },
          { name: 'Healthcare', value: selectedYearData.expenses * 0.20 },
          { name: 'Food', value: selectedYearData.expenses * 0.15 },
          { name: 'Transportation', value: selectedYearData.expenses * 0.10 },
          { name: 'Other', value: selectedYearData.expenses * 0.20 }
        ];

    return { incomeBreakdown, expenseBreakdown };
  }, [selectedYearData, userData]);

  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Cash Flow Projection</h1>
        <p className="mt-1 text-sm text-gray-600">
          Visualize your income and expenses over time with important retirement milestones.
        </p>
      </div>

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Retirement Timeline</span>
          </CardTitle>
          <CardDescription>
            Click on any year or milestone to see detailed cashflow breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>
            
            {/* Timeline items */}
            <div className="flex justify-between items-start overflow-x-auto pb-4">
              {timelineEvents.map((event, index) => {
                const EventIcon = event.icon;
                return (
                  <div key={event.year} className="flex flex-col items-center space-y-2 min-w-[100px]">
                    <button
                      onClick={() => setSelectedYear(event.year)}
                      className={`
                        relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200
                        ${event.color} ${selectedYear === event.year ? 'ring-4 ring-blue-200 scale-110' : 'hover:scale-105'}
                      `}
                    >
                      <EventIcon className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                      <div className="text-xs font-semibold">{event.year}</div>
                      <div className="text-xs text-gray-600">Age {Math.floor(event.age)}</div>
                      <Badge 
                        variant={event.type === 'goal' ? 'default' : 'secondary'}
                        className="text-xs mt-1"
                      >
                        {event.title}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cashflow Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>40-Year Cashflow Projection</CardTitle>
          <CardDescription>
            Income vs Expenses over time (inflation-adjusted)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  tickFormatter={(value) => `'${value.toString().slice(-2)}`}
                />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net Cashflow']}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <ReferenceLine 
                  x={selectedYear} 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {selectedYearData && sankeyData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Income Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Income Sources - {selectedYear}</CardTitle>
              <CardDescription>
                Total: {formatCurrency(selectedYearData.income)} • Age {selectedYearData.age}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sankeyData.incomeBreakdown} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expense Categories - {selectedYear}</CardTitle>
              <CardDescription>
                Total: {formatCurrency(selectedYearData.expenses)} • Age {selectedYearData.age}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sankeyData.expenseBreakdown} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Year Summary */}
      {selectedYearData && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary for {selectedYear}</CardTitle>
            <CardDescription>
              Age {selectedYearData.age} • {selectedYearData.isRetired ? 'Retired' : 'Working'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedYearData.income)}
                </div>
                <div className="text-sm text-gray-600">Annual Income</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(selectedYearData.income / 12)}/month
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(selectedYearData.expenses)}
                </div>
                <div className="text-sm text-gray-600">Annual Expenses</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(selectedYearData.expenses / 12)}/month
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${selectedYearData.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(selectedYearData.netCashflow)}
                </div>
                <div className="text-sm text-gray-600">Net Cashflow</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(selectedYearData.netCashflow / 12)}/month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CashFlow;
