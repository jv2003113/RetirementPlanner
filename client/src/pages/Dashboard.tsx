import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BarChart3, BanknoteIcon, WalletIcon } from "lucide-react";
import RetirementReadinessCard from "@/components/dashboard/RetirementReadinessCard";
import PortfolioAllocationChart from "@/components/dashboard/PortfolioAllocationChart";
import IncomeProjectionChart from "@/components/dashboard/IncomeProjectionChart";
import RecommendationsCard from "@/components/dashboard/RecommendationsCard";
import RetirementMilestones from "@/components/dashboard/RetirementMilestones";
import ResourceCard from "@/components/dashboard/ResourceCard";
import RetirementGoalsCard from "@/components/dashboard/RetirementGoalsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Recommendation, Resource, Activity, RetirementGoal, User } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

// Define interface for the dashboard data
interface DashboardData {
  retirementReadiness: {
    score: number;
    targetRetirementAge: number | null;
  };
  monthlyIncome: {
    projected: number;
    goal: number;
    percentOfCurrent: number;
  };
  savingsRate: {
    percentage: number;
    monthlyAmount: number;
  };
  portfolioAllocation: {
    total: number;
    categories: {
      stocks: { percentage: number; value: number };
      bonds: { percentage: number; value: number };
      realEstate: { percentage: number; value: number };
      cash: { percentage: number; value: number };
    };
  };
  incomeProjection: {
    portfolioIncome: number;
    socialSecurity: number;
    estimatedExpenses: number;
  };
  recommendations: Recommendation[];
  resources: Resource[];
  recentActivities: Activity[];
  retirementGoals: RetirementGoal[];
}

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const [, setLocation] = useLocation();
  const userId = authUser?.id || 1;

  // Fetch user data to check if profile is complete
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: [`/api/users/${userId}/dashboard`],
    refetchOnWindowFocus: false,
  });

  // Check if user is new (has minimal profile information)
  const isNewUser = (user: User | undefined) => {
    if (!user) return true;
    
    // Consider user "new" if they haven't filled out essential retirement planning info
    const hasRetirementInfo = user.currentAge && user.targetRetirementAge;
    const hasFinancialInfo = user.currentIncome && parseFloat(user.currentIncome) > 0;
    
    // Debug logging
    console.log('Dashboard - User data:', {
      currentAge: user.currentAge,
      targetRetirementAge: user.targetRetirementAge,
      currentIncome: user.currentIncome,
      hasRetirementInfo,
      hasFinancialInfo
    });
    
    // User is "new" if they lack retirement planning data
    return !(hasRetirementInfo && hasFinancialInfo);
  };

  // Redirect new users to profile wizard
  useEffect(() => {
    if (!isLoadingUser && userData && isNewUser(userData)) {
      setLocation('/profile');
    }
  }, [userData, isLoadingUser, setLocation]);

  // Recommendations and resources are now fetched from the API and included in the data object

  if (isLoading || isLoadingUser) {
    return (
      <div className="py-4">
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96 mb-8" />
        
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        
        <div className="grid grid-cols-1 gap-5 mb-8">
          <Skeleton className="h-80" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="py-4">Error loading dashboard data</div>;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Retirement Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Welcome back, John. Here's an overview of your retirement plan.</p>
      </div>

      {/* Retirement Readiness Cards */}
      <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <RetirementReadinessCard
          score={data!.retirementReadiness.score}
          label="Retirement Readiness"
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          bgColor="bg-primary"
          description={`On track for retirement at age ${data!.retirementReadiness.targetRetirementAge}`}
        />
        
        <RetirementReadinessCard
          score={data!.monthlyIncome.projected}
          label="Projected Monthly Income"
          icon={<BanknoteIcon className="h-6 w-6 text-white" />}
          bgColor="bg-[#43A047]"
          description={`${data!.monthlyIncome.percentOfCurrent}% of current income`}
        />
        
        <RetirementReadinessCard
          score={data!.savingsRate.percentage}
          label="Current Savings Rate"
          icon={<WalletIcon className="h-6 w-6 text-white" />}
          bgColor="bg-[#FFA000]"
          description={`$${data!.savingsRate.monthlyAmount} per month`}
        />
      </div>

      {/* Portfolio and Projection Section */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PortfolioAllocationChart data={data!.portfolioAllocation} />
        <IncomeProjectionChart data={data!.incomeProjection} />
      </div>

      {/* Retirement Goals & Milestones Section */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RetirementGoalsCard goals={data!.retirementGoals || []} />
        <RetirementMilestones 
          user={{
            id: userId,
            username: 'john.doe',
            password: '',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            currentAge: 40,
            targetRetirementAge: data!.retirementReadiness.targetRetirementAge || 65,
            createdAt: null
          }}
          portfolioTotal={data!.portfolioAllocation.total}
        />
      </div>
      
      {/* Recommendations Section */}
      <div className="mt-8 grid grid-cols-1 gap-5">
        <RecommendationsCard recommendations={data!.recommendations} />
      </div>

      {/* Planning Resources Section */}
      <div className="mt-8 mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data!.resources.map((resource: Resource) => (
          <ResourceCard
            key={resource.id}
            title={resource.title}
            description={resource.description}
            icon={resource.icon}
            buttonText={resource.buttonText}
            buttonLink={resource.buttonLink}
            color={`text-[${resource.color}]`}
          />
        ))}
      </div>

      {/* Tax Optimization Card */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Tax Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Roth Conversion</div>
          <p className="text-sm text-gray-500 mt-1">Optimize your tax strategy</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/tax-planning">Explore Roth Conversion</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
