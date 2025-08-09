import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar, 
  DollarSign, 
  Home, 
  Heart, 
  Car, 
  Plane, 
  GraduationCap,
  Building,
  PiggyBank,
  CreditCard,
  Shield,
  TrendingUp,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  HelpCircle,
  Grid3X3,
  List,
  BarChart3,
  UserX,
  Filter
} from "lucide-react";

interface RetirementOverviewProps {
  userId?: number;
}

interface FinancialSummary {
  income: number;
  assets: number;
  expenses: number;
  liabilities: number;
  savings: number;
  insurance: number;
}

interface TimelineMilestone {
  year: number;
  age: number;
  partnerAge: number;
  type: 'retirement' | 'medicare' | 'social-security' | 'roth-conversion' | 'rmd' | 'goal' | 'expense';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const RetirementOverview = ({ userId = 1 }: RetirementOverviewProps) => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch retirement goals
  const { data: goalsData } = useQuery({
    queryKey: [`/api/users/${userId}/retirement-goals`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch Roth conversion plans
  const { data: rothPlans } = useQuery({
    queryKey: [`/api/users/${userId}/roth-conversion-plans`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch investment accounts
  const { data: accountsData } = useQuery({
    queryKey: [`/api/users/${userId}/investment-accounts`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch retirement expenses
  const { data: expensesData } = useQuery({
    queryKey: [`/api/users/${userId}/retirement-expenses`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const currentAge = 50; // This would come from user profile
  const partnerAge = 50; // This would come from partner profile
  const retirementAge = 67; // This would come from user settings
  const socialSecurityAge = 67;
  const medicareAge = 65;

  // Generate timeline milestones
  const generateTimelineMilestones = (): TimelineMilestone[] => {
    const milestones: TimelineMilestone[] = [];
    const currentYear = new Date().getFullYear();
    
    // Retirement milestone
    const retirementYear = currentYear + (retirementAge - currentAge);
    milestones.push({
      year: retirementYear,
      age: retirementAge,
      partnerAge: partnerAge + (retirementAge - currentAge),
      type: 'retirement',
      title: 'Retirement Start',
      description: 'Begin retirement and start drawing from savings',
      icon: <Home className="h-4 w-4" />,
      color: 'bg-green-500'
    });

    // Medicare milestone
    const medicareYear = currentYear + (medicareAge - currentAge);
    milestones.push({
      year: medicareYear,
      age: medicareAge,
      partnerAge: partnerAge + (medicareAge - currentAge),
      type: 'medicare',
      title: 'Medicare Eligibility',
      description: 'Start Medicare coverage',
      icon: <Heart className="h-4 w-4" />,
      color: 'bg-blue-500'
    });

    // Social Security milestone
    const ssYear = currentYear + (socialSecurityAge - currentAge);
    milestones.push({
      year: ssYear,
      age: socialSecurityAge,
      partnerAge: partnerAge + (socialSecurityAge - currentAge),
      type: 'social-security',
      title: 'Social Security',
      description: 'Start receiving Social Security benefits',
      icon: <Building className="h-4 w-4" />,
      color: 'bg-orange-500'
    });

    // Roth conversion milestones (if plans exist)
    if (rothPlans && Array.isArray(rothPlans)) {
      rothPlans.forEach((plan: any, index: number) => {
        if (plan.isActive) {
          const startYear = currentYear + (plan.currentAge - currentAge);
          for (let i = 0; i < plan.yearsToConvert; i++) {
            milestones.push({
              year: startYear + i,
              age: plan.currentAge + i,
              partnerAge: partnerAge + (plan.currentAge - currentAge) + i,
              type: 'roth-conversion',
              title: `Roth Conversion Year ${i + 1}`,
              description: `Convert $${(parseFloat(plan.conversionAmount) / plan.yearsToConvert).toLocaleString()} to Roth IRA`,
              icon: <TrendingUp className="h-4 w-4" />,
              color: 'bg-purple-500'
            });
          }
        }
      });
    }

    // RMD milestones (starting at age 73)
    const rmdAge = 73;
    const rmdYear = currentYear + (rmdAge - currentAge);
    if (rmdYear > currentYear) {
      milestones.push({
        year: rmdYear,
        age: rmdAge,
        partnerAge: partnerAge + (rmdAge - currentAge),
        type: 'rmd',
        title: 'RMD Start',
        description: 'Required Minimum Distributions begin',
        icon: <PiggyBank className="h-4 w-4" />,
        color: 'bg-red-500'
      });
    }

    // Add some sample goals and expenses
    if (goalsData && Array.isArray(goalsData)) {
      goalsData.forEach((goal: any) => {
        const goalYear = currentYear + (goal.targetAge - currentAge);
        milestones.push({
          year: goalYear,
          age: goal.targetAge,
          partnerAge: partnerAge + (goal.targetAge - currentAge),
          type: 'goal',
          title: goal.title || 'Retirement Goal',
          description: goal.description || 'Achieve retirement goal',
          icon: <Star className="h-4 w-4" />,
          color: 'bg-yellow-500'
        });
      });
    }

    return milestones.sort((a, b) => a.year - b.year);
  };

  const milestones = generateTimelineMilestones();

  // Calculate financial summary for selected year
  const calculateFinancialSummary = (year: number): FinancialSummary => {
    const yearsFromNow = year - new Date().getFullYear();
    const age = currentAge + yearsFromNow;
    
    // Base values (these would come from actual financial data)
    let baseIncome = 200000;
    let baseAssets = 1000000;
    let baseExpenses = 120000;
    let baseLiabilities = 0;
    
    // Adjust based on age and milestones
    if (age >= retirementAge) {
      baseIncome = 80000; // Reduced income in retirement
      baseExpenses = 100000; // Reduced expenses
    }
    
    if (age >= socialSecurityAge) {
      baseIncome += 40000; // Social Security income
    }
    
    // Add Roth conversion impact
    const rothMilestones = milestones.filter(m => m.type === 'roth-conversion' && m.year <= year);
    if (rothMilestones.length > 0) {
      baseAssets += rothMilestones.length * 50000; // Simplified Roth conversion impact
    }
    
    return {
      income: baseIncome,
      assets: baseAssets,
      expenses: baseExpenses,
      liabilities: baseLiabilities,
      savings: baseIncome - baseExpenses,
      insurance: 0
    };
  };

  const financialSummary = calculateFinancialSummary(selectedYear);
  const selectedMilestones = milestones.filter(m => m.year === selectedYear);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CategoryDetailDialog = ({ category, data }: { category: string; data: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{category} Details - {selectedYear}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {category === 'Income' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Social Security</span>
                </div>
                <span className="font-bold">{formatCurrency(40000)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Investment Income</span>
                </div>
                <span className="font-bold">{formatCurrency(25000)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Part-time Work</span>
                </div>
                <span className="font-bold">{formatCurrency(15000)}</span>
              </div>
            </div>
          )}
          
          {category === 'Assets' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                  <span className="font-medium">401(k) & IRA</span>
                </div>
                <span className="font-bold">{formatCurrency(800000)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Home Equity</span>
                </div>
                <span className="font-bold">{formatCurrency(400000)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Cash & Savings</span>
                </div>
                <span className="font-bold">{formatCurrency(200000)}</span>
              </div>
            </div>
          )}
          
          {category === 'Expenses' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Housing</span>
                </div>
                <span className="font-bold">{formatCurrency(30000)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Healthcare</span>
                </div>
                <span className="font-bold">{formatCurrency(25000)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Travel & Leisure</span>
                </div>
                <span className="font-bold">{formatCurrency(20000)}</span>
              </div>
            </div>
          )}
          
          {category === 'Liabilities' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Credit Card Debt</span>
                </div>
                <span className="font-bold">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Mortgage</span>
                </div>
                <span className="font-bold">{formatCurrency(0)}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-gray-500 mb-2">
            Household Plan &gt; Life Hub
          </nav>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h1 className="text-2xl font-bold">Household Plan</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Jose, 50
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Priya, 50
            </Button>
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Joint
            </Button>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Last updated Jul 28, 2:53 PM</div>
            <div className="flex gap-2 mt-1">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <BarChart3 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <UserX className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Retirement Timeline</CardTitle>
          <CardDescription>
            Select a year to view your financial situation at that point
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-blue-200 rounded-full"></div>
            
            {/* Year selector */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedYear(Math.max(2025, selectedYear - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="bg-orange-500 text-white rounded-full px-6 py-2 font-bold">
                  {selectedYear}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedYear(Math.min(2074, selectedYear + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Milestones */}
            <div className="relative">
              {milestones.map((milestone, index) => (
                <div
                  key={`${milestone.year}-${milestone.type}`}
                  className="absolute transform -translate-x-1/2"
                  style={{
                    left: `${((milestone.year - 2025) / (2074 - 2025)) * 100}%`,
                    top: index % 2 === 0 ? '0' : '16px'
                  }}
                >
                  <div className={`w-8 h-8 rounded-full ${milestone.color} flex items-center justify-center text-white text-xs`}>
                    {milestone.icon}
                  </div>
                  {milestone.year === selectedYear && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg p-2 shadow-lg min-w-48">
                      <div className="font-medium text-sm">{milestone.title}</div>
                      <div className="text-xs text-gray-500">{milestone.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Age: {milestone.age} | Partner: {milestone.partnerAge}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Financial Categories */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold">Household Financial Summary</h3>
            <p className="text-sm text-gray-500">Year: {selectedYear}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Income</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(financialSummary.income)}
                </div>
                <CategoryDetailDialog category="Income" data={financialSummary} />
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Assets</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(financialSummary.assets)}
                </div>
                <CategoryDetailDialog category="Assets" data={financialSummary} />
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Expenses</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {formatCurrency(financialSummary.expenses)}
                </div>
                <CategoryDetailDialog category="Expenses" data={financialSummary} />
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Liabilities</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency(financialSummary.liabilities)}
                </div>
                <CategoryDetailDialog category="Liabilities" data={financialSummary} />
              </CardContent>
            </Card>
          </div>

          {/* Additional Summary Boxes */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Savings & Transfers</span>
                </div>
                <div className="text-xl font-bold text-purple-900">
                  {formatCurrency(financialSummary.savings)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Insurance</span>
                </div>
                <div className="text-xl font-bold text-yellow-900">
                  {formatCurrency(financialSummary.insurance)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected Year Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Year {selectedYear} Details</CardTitle>
              <CardDescription>
                Age: {currentAge + (selectedYear - new Date().getFullYear())} | 
                Partner: {partnerAge + (selectedYear - new Date().getFullYear())}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedMilestones.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Milestones this year:</h4>
                  {selectedMilestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-6 h-6 rounded-full ${milestone.color} flex items-center justify-center`}>
                        {milestone.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{milestone.title}</div>
                        <div className="text-xs text-gray-500">{milestone.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No major milestones this year</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Net Worth</span>
                  <span className="font-bold">{formatCurrency(financialSummary.assets - financialSummary.liabilities)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cash Flow</span>
                  <span className={`font-bold ${financialSummary.income - financialSummary.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financialSummary.income - financialSummary.expenses)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Savings Rate</span>
                  <span className="font-bold">
                    {financialSummary.income > 0 ? ((financialSummary.savings / financialSummary.income) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        Values are annual (beginning-of-period or calendar year totals) rounded and in future dollars
      </div>
    </div>
  );
};

export default RetirementOverview; 