import { useQuery } from "@tanstack/react-query";
import { BarChart3, BanknoteIcon, WalletIcon } from "lucide-react";
import RetirementReadinessCard from "@/components/dashboard/RetirementReadinessCard";
import PortfolioAllocationChart from "@/components/dashboard/PortfolioAllocationChart";
import RecommendationsCard from "@/components/dashboard/RecommendationsCard";
import RetirementMilestones from "@/components/dashboard/RetirementMilestones";
import ResourceCard from "@/components/dashboard/ResourceCard";

import { Skeleton } from "@/components/ui/skeleton";
import { Recommendation, Resource, Activity, User } from "@shared/schema";
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
  recommendations: Recommendation[];
  resources: Resource[];
  recentActivities: Activity[];

}

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const userId = authUser?.id || 1;

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', userId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${userId}/dashboard`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
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

      {/* Portfolio Section */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PortfolioAllocationChart data={data!.portfolioAllocation} />
        <div className="grid grid-cols-1 gap-5">

          <RetirementMilestones
            user={{
              currentAge: 30,
              targetRetirementAge: data!.retirementReadiness.targetRetirementAge || 65,
            } as User}
            portfolioTotal={data!.portfolioAllocation.total}
          />
        </div>
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
