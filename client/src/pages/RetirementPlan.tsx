import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, TrendingUp, AlertCircle, Eye, Plus, Edit3 } from "lucide-react";
import TimelineComponent from "@/components/retirement-plan/TimelineComponent";
import InteractiveTimeline from "@/components/retirement-plan/InteractiveTimeline";
import FinancialMindMap from "@/components/retirement-plan/FinancialMindMap";
import AccountBucketsDisplay from "@/components/retirement-plan/AccountBucketsDisplay";
import YearDetailView from "@/components/retirement-plan/YearDetailView";
import LifetimeTaxDisplay from "@/components/retirement-plan/LifetimeTaxDisplay";
import PlanParametersPanel from "@/components/retirement-plan/PlanParametersPanel";
import CreatePlanForm from "@/components/retirement-plan/CreatePlanForm";
import { useAuth } from "@/contexts/AuthContext";
import type { RetirementPlan, AnnualSnapshot, AccountBalance, Milestone, User } from "@shared/schema";

interface RetirementPlanWithDetails extends RetirementPlan {
  snapshots: AnnualSnapshot[];
  milestones: Milestone[];
}

export default function RetirementPlanPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const { user: authUser } = useAuth();
  const userId = authUser?.id || 1;

  // Fetch user data to get current age
  const { data: userData } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const { data: plans, isLoading: plansLoading } = useQuery<RetirementPlan[]>({
    queryKey: ["retirement-plans"],
    queryFn: async () => {
      const response = await fetch("/api/retirement-plans");
      if (!response.ok) throw new Error("Failed to fetch retirement plans");
      return response.json();
    },
  });

  const { data: planDetails, isLoading: detailsLoading } = useQuery<RetirementPlanWithDetails>({
    queryKey: ["retirement-plan-details", selectedPlanId],
    queryFn: async () => {
      if (!selectedPlanId) return null;
      const response = await fetch(`/api/retirement-plans/${selectedPlanId}/details`);
      if (!response.ok) throw new Error("Failed to fetch plan details");
      return response.json();
    },
    enabled: !!selectedPlanId,
  });

  const { data: yearData, isLoading: yearLoading } = useQuery({
    queryKey: ["year-details", selectedPlanId, selectedYear],
    queryFn: async () => {
      if (!selectedPlanId || !selectedYear) return null;
      const response = await fetch(`/api/retirement-plans/${selectedPlanId}/year/${selectedYear}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Year data doesn't exist, return null instead of throwing
          return null;
        }
        throw new Error("Failed to fetch year details");
      }
      return response.json();
    },
    enabled: !!selectedPlanId && !!selectedYear,
  });

  // Auto-select first plan if available
  useEffect(() => {
    if (plans && plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  // Auto-select current year when plan details and user data are available
  useEffect(() => {
    if (planDetails && userData && !selectedYear) {
      const currentYear = new Date().getFullYear();
      setSelectedYear(currentYear);
    }
  }, [planDetails, userData, selectedYear]);

  // Handle year selection from timeline
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };

  if (plansLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your retirement plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="container mx-auto p-6">
        {showCreateForm ? (
          <CreatePlanForm 
            onCancel={() => setShowCreateForm(false)}
            onSuccess={(planId) => {
              setShowCreateForm(false);
              setSelectedPlanId(planId);
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                No Retirement Plans Found
              </CardTitle>
              <CardDescription>
                It looks like you haven't created any retirement plans yet. Create your first retirement plan to start analyzing different scenarios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowCreateForm(true)}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const activePlan = planDetails || plans.find(p => p.id === selectedPlanId);

  // Show create form if requested
  if (showCreateForm) {
    return (
      <div className="container mx-auto p-6">
        <CreatePlanForm 
          onCancel={() => setShowCreateForm(false)}
          onSuccess={(planId) => {
            setShowCreateForm(false);
            setSelectedPlanId(planId);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header with Plan Tabs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Retirement Plans</h1>
          <Button 
            onClick={() => setShowCreateForm(true)}
            disabled={plans.length >= 4}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {plans.length === 0 ? 'Create Plan' : 'Add Plan'}
            {plans.length >= 4 && (
              <Badge variant="secondary" className="ml-2">Max 4</Badge>
            )}
          </Button>
        </div>
        
        {/* Plan Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {plans.map(plan => (
            <Button
              key={plan.id}
              variant={selectedPlanId === plan.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPlanId(plan.id)}
              className="relative"
            >
              {plan.planName}
              {selectedPlanId === plan.id && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </Button>
          ))}
        </div>
      </div>

      {detailsLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Plan Parameters Panel */}
          {activePlan && (
            <PlanParametersPanel 
              plan={activePlan} 
              onEdit={() => setShowEditForm(true)} 
            />
          )}

          {/* Interactive Timeline */}
          {activePlan && planDetails && (
            <InteractiveTimeline
              snapshots={planDetails.snapshots}
              milestones={planDetails.milestones}
              onYearSelect={handleYearSelect}
              selectedYear={selectedYear}
              retirementAge={activePlan.retirementAge}
              startAge={activePlan.startAge}
              endAge={activePlan.endAge}
              currentAge={userData?.currentAge || activePlan.startAge}
            />
          )}

          {/* Financial Mind Map View */}
          {selectedYear && planDetails && (
            <FinancialMindMap
              year={selectedYear}
              age={userData?.currentAge ? userData.currentAge + (selectedYear - new Date().getFullYear()) : activePlan.startAge + (selectedYear - new Date().getFullYear())}
              snapshot={yearData?.snapshot || null}
              accountBalances={yearData?.accountBalances || []}
              isLoading={yearLoading}
            />
          )}
        </div>
      )}
    </div>
  );
}