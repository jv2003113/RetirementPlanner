import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, BanknoteIcon, WalletIcon } from "lucide-react";
import RetirementReadinessCard from "@/components/dashboard/RetirementReadinessCard";
import PortfolioAllocationChart from "@/components/dashboard/PortfolioAllocationChart";
import IncomeProjectionChart from "@/components/dashboard/IncomeProjectionChart";
import RecommendationsCard from "@/components/dashboard/RecommendationsCard";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import ResourceCard from "@/components/dashboard/ResourceCard";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const userId = 1; // For demo purposes

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/users/${userId}/dashboard`],
    refetchOnWindowFocus: false,
  });

  // Recommendations data
  const recommendations = [
    {
      id: "1",
      title: "Increase contribution rate",
      description: "Increasing your 401(k) contribution by just 2% could add $250,000 to your retirement savings.",
      impact: "high",
      actionText: "Take action",
      actionLink: "/portfolio",
    },
    {
      id: "2",
      title: "Review asset allocation",
      description: "Your portfolio may be too aggressive for your age. Consider adjusting your stock-to-bond ratio.",
      impact: "medium",
      actionText: "Review allocation",
      actionLink: "/portfolio",
    },
    {
      id: "3",
      title: "Complete healthcare planning",
      description: "You haven't completed your healthcare planning section. This is important for accurate retirement projections.",
      impact: "info",
      actionText: "Complete section",
      actionLink: "/healthcare",
    },
  ];

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
          score={data.retirementReadiness.score}
          label="Retirement Readiness"
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          bgColor="bg-primary"
          description={`On track for retirement at age ${data.retirementReadiness.targetRetirementAge}`}
        />
        
        <RetirementReadinessCard
          score={data.monthlyIncome.projected}
          label="Projected Monthly Income"
          icon={<BanknoteIcon className="h-6 w-6 text-white" />}
          bgColor="bg-[#43A047]"
          description={`${data.monthlyIncome.percentOfCurrent}% of current income`}
        />
        
        <RetirementReadinessCard
          score={data.savingsRate.percentage}
          label="Current Savings Rate"
          icon={<WalletIcon className="h-6 w-6 text-white" />}
          bgColor="bg-[#FFA000]"
          description={`$${data.savingsRate.monthlyAmount} per month`}
        />
      </div>

      {/* Portfolio and Projection Section */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PortfolioAllocationChart data={data.portfolioAllocation} />
        <IncomeProjectionChart data={data.incomeProjection} />
      </div>

      {/* Recommendations & Activities Section */}
      <div className="mt-8 grid grid-cols-1 gap-5">
        <RecommendationsCard recommendations={recommendations} />
        <ActivityTimeline activities={data.recentActivities} />
      </div>

      {/* Planning Resources Section */}
      <div className="mt-8 mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ResourceCard
          title="Retirement Tax Strategies"
          description="Learn strategies to minimize taxes in retirement and maximize your income."
          icon="book"
          buttonText="Read guide"
          buttonLink="/tax-planning"
          color="text-primary"
        />
        
        <ResourceCard
          title="Healthcare in Retirement"
          description="Understand Medicare options and planning for healthcare costs in retirement."
          icon="healthcare"
          buttonText="Read healthcare guide"
          buttonLink="/healthcare"
          color="text-[#43A047]"
        />
        
        <ResourceCard
          title="Estate Planning Basics"
          description="Learn the fundamentals of estate planning and how to protect your legacy."
          icon="estate"
          buttonText="Read estate guide"
          buttonLink="/estate-planning"
          color="text-[#FFA000]"
        />
      </div>
    </div>
  );
};

export default Dashboard;
