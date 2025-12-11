import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, TrendingUp, AlertCircle, Eye, Plus, Edit3, X } from "lucide-react";
import TimelineComponent from "@/components/retirement-plan/TimelineComponent";
import InteractiveTimeline from "@/components/retirement-plan/InteractiveTimeline";
import FinancialDashboard from "@/components/retirement-plan/FinancialDashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AccountBucketsDisplay from "@/components/retirement-plan/AccountBucketsDisplay";
import YearDetailView from "@/components/retirement-plan/YearDetailView";
import LifetimeTaxDisplay from "@/components/retirement-plan/LifetimeTaxDisplay";
import PlanParametersPanel from "@/components/retirement-plan/PlanParametersPanel";
import CreatePlanForm from "@/components/retirement-plan/CreatePlanForm";
import EditPlanForm from "@/components/retirement-plan/EditPlanForm";
import { useAuth } from "@/contexts/AuthContext";
import type { RetirementPlan, AnnualSnapshot, Milestone, User, InitialData, YearlyData, AnnualSnapshotAsset, AnnualSnapshotLiability, AnnualSnapshotIncome, AnnualSnapshotExpense } from "@shared/schema";
import { apiRequest } from "@/lib/api";
import ProjectionTable from "@/components/retirement/ProjectionTable";
import ProjectionChart from "@/components/retirement/ProjectionChart";

interface AnnualSnapshotWithDetails extends AnnualSnapshot {
  assets: AnnualSnapshotAsset[];
  liabilities: AnnualSnapshotLiability[];
  income: AnnualSnapshotIncome[];
  expenses: AnnualSnapshotExpense[];
}

interface RetirementPlanWithDetails extends RetirementPlan {
  snapshots: AnnualSnapshotWithDetails[];
  milestones: Milestone[];
}

export default function RetirementPlanPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Get planId from URL params if provided
  const urlParams = new URLSearchParams(window.location.search);
  const urlPlanId = urlParams.get('planId');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  const queryClient = useQueryClient();

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest(`/api/retirement-plans/${planId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete plan');
      if (response.status === 204) return null;
      return response.json();
    },
    onSuccess: (_, deletedPlanId) => {
      queryClient.invalidateQueries({ queryKey: ['retirement-plans'] });
      // If we deleted the currently selected plan, select another one
      if (selectedPlanId === deletedPlanId && plans) {
        const remainingPlans = plans.filter(p => p.id !== deletedPlanId);
        if (remainingPlans.length > 0) {
          setSelectedPlanId(remainingPlans[0].id);
        } else {
          setSelectedPlanId(null);
        }
      }
    },
  });

  const handleDeletePlan = (planId: string, planType: string | null) => {
    if (planType === 'P') return; // Cannot delete primary plan

    if (confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      deletePlanMutation.mutate(planId);
    }
  };

  // Fetch user data to get current age
  const { data: userData } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const { data: plans, isLoading: plansLoading } = useQuery<RetirementPlan[]>({
    queryKey: ["retirement-plans"],
    queryFn: async () => {
      const response = await apiRequest("/api/retirement-plans");
      if (!response.ok) throw new Error("Failed to fetch retirement plans");
      return response.json();
    },
  });

  const { data: planDetails, isLoading: detailsLoading } = useQuery<RetirementPlanWithDetails>({
    queryKey: ["retirement-plan-details", selectedPlanId],
    queryFn: async () => {
      if (!selectedPlanId) return null;
      // Use the new /full endpoint to get complete nested data
      const response = await apiRequest(`/api/retirement-plans/${selectedPlanId}/full`);
      if (!response.ok) throw new Error("Failed to fetch plan details");
      return response.json();
    },
    enabled: !!selectedPlanId,
  });

  // Also keep fetching single year detailed view for safety/redundancy or specific UI needs
  const { data: yearData, isLoading: yearLoading } = useQuery({
    queryKey: ["year-details", selectedPlanId, selectedYear],
    queryFn: async () => {
      if (!selectedPlanId || !selectedYear) return null;
      const response = await apiRequest(`/api/retirement-plans/${selectedPlanId}/year/${selectedYear}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch year details");
      }
      return response.json();
    },
    enabled: !!selectedPlanId && !!selectedYear,
  });

  // Auto-select plan based on URL or first available plan
  useEffect(() => {
    if (plans && plans.length > 0) {
      // If URL has planId, use that
      if (urlPlanId) {
        const planExists = plans.find(p => p.id === urlPlanId);
        if (planExists && selectedPlanId !== urlPlanId) {
          console.log(`🎯 Selecting plan from URL: ${urlPlanId}`);
          setSelectedPlanId(urlPlanId);
          return;
        }
      }

      // Otherwise, auto-select first plan if none selected
      if (!selectedPlanId) {
        console.log(`📋 Auto-selecting first plan: ${plans[0].id}`);
        setSelectedPlanId(plans[0].id);
      }
    }
  }, [plans, urlPlanId]); // Removed selectedPlanId to prevent resetting when user selects a plan manually

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

  // Convert DB snapshots to YearlyData format for charts
  const projectionData = useMemo<YearlyData[]>(() => {
    if (!planDetails?.snapshots) return [];

    return planDetails.snapshots.map(s => {
      // Calculate asset breakdowns from the nested assets array
      const assets = s.assets || [];

      const getAssetTotal = (type: string) =>
        assets.filter(a => a.type === type).reduce((sum, a) => sum + Number(a.balance), 0);

      // Map AnnualSnapshot (from DB) to YearlyData (for UI components)
      return {
        year: s.year,
        age: s.age,
        grossIncome: Number(s.grossIncome),
        netIncome: Number(s.netIncome),
        totalExpenses: Number(s.totalExpenses),
        totalAssets: Number(s.totalAssets),
        totalLiabilities: Number(s.totalLiabilities),
        netWorth: Number(s.netWorth),
        taxesPaid: Number(s.taxesPaid),
        cumulativeTax: Number(s.cumulativeTax),
        // Map detailed breakdowns
        "401k_eoy": getAssetTotal('401k'),
        rothIRA_eoy: getAssetTotal('roth_ira'),
        brokerage_eoy: getAssetTotal('brokerage'),
        savings_eoy: getAssetTotal('savings'),
        // Fill other required fields with defaults or calculate if data exists
        inflationAdjustedSpending: Number(s.totalExpenses),
        socialSecurityIncome: 0, // Individual income streams would need to be aggregated from s.income if types align
        pensionIncome: 0,
        currentIncome: 0,
        spouseCurrentIncome: 0,
        totalGrossWithdrawal: 0,
        estimatedTax: Number(s.taxesPaid),
        totalAssets_eoy: Number(s.totalAssets),
        totalLiabilities_eoy: Number(s.totalLiabilities),
        rmdCalculated: 0,
        isDepleted: Number(s.totalAssets) <= 0,
        // Arrays for detailed views if needed
        assets: s.assets,
        liabilities: s.liabilities,
        income: s.income,
        expenses: s.expenses
      } as unknown as YearlyData; // Cast because some specific breakdown fields might be missing but chart mainly needs eoy values
    });
  }, [planDetails]);

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
            existingPlans={plans || []}
            onCancel={() => setShowCreateForm(false)}
            onSuccess={(planId) => {
              setShowCreateForm(false);
              setSelectedPlanId(String(planId));
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
          existingPlans={plans}
          onCancel={() => setShowCreateForm(false)}
          onSuccess={(planId) => {
            setShowCreateForm(false);
            setSelectedPlanId(String(planId));
          }}
        />
      </div>
    );
  }

  // Show edit form if requested
  if (showEditForm && activePlan) {
    return (
      <div className="container mx-auto p-6">
        <EditPlanForm
          plan={activePlan}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header with Plan Tabs */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Retirement Plans</h1>
        </div>

        {/* Plan Tabs */}
        <div className="flex items-center gap-3 mb-4 overflow-x-auto scrollbar-hide">
          {plans && plans.length > 0 && (
            <Tabs
              value={selectedPlanId || undefined}
              onValueChange={setSelectedPlanId}
              className="w-auto"
            >
              <TabsList>
                {[...plans]
                  .sort((a, b) => {
                    // Sort by plan type: P first, then A, B, C
                    const order = { 'P': 0, 'A': 1, 'B': 2, 'C': 3 };
                    const aOrder = order[a.planType as keyof typeof order] ?? 999;
                    const bOrder = order[b.planType as keyof typeof order] ?? 999;
                    return aOrder - bOrder;
                  })
                  .map(plan => (
                    <TabsTrigger key={plan.id} value={plan.id}>
                      {plan.planName}
                    </TabsTrigger>
                  ))}
              </TabsList>
            </Tabs>
          )}
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={plans.length >= 4}
            variant="outline"
            size="sm"
            className="flex items-center justify-center w-8 h-8 p-0 rounded-full"
            title="Add new plan"
          >
            <Plus className="h-4 w-4" />
          </Button>
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
              onDelete={activePlan.planType !== 'P' ? () => handleDeletePlan(activePlan.id, activePlan.planType) : undefined}
            />
          )}

          {/* Mobile Year Selector */}
          {activePlan && planDetails && (
            <div className="md:hidden mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Year to View</label>
              <Select
                value={selectedYear?.toString()}
                onValueChange={(val) => handleYearSelect(parseInt(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {planDetails.snapshots.map(s => (
                    <SelectItem key={s.year} value={s.year.toString()}>
                      {s.year} (Age {s.age})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Tabs defaultValue="annual-financials" className="w-full">
            <TabsList>
              <TabsTrigger value="annual-financials">Annual Financials</TabsTrigger>
              <TabsTrigger value="projection">Projection</TabsTrigger>
            </TabsList>

            <TabsContent value="annual-financials">
              {/* Interactive Timeline */}
              {activePlan && planDetails && (
                <div className="hidden md:block mb-6">
                  <InteractiveTimeline
                    snapshots={planDetails.snapshots}
                    milestones={planDetails.milestones}
                    onYearSelect={handleYearSelect}
                    selectedYear={selectedYear}
                    retirementAge={activePlan.retirementAge}
                    startAge={activePlan.startAge}
                    endAge={activePlan.endAge || 95}
                    currentAge={userData?.currentAge || activePlan.startAge}
                  />
                </div>
              )}

              {/* Financial Dashboard View */}
              {selectedYear && planDetails && (
                <FinancialDashboard
                  year={selectedYear}
                  age={userData?.currentAge ? userData.currentAge + (selectedYear - new Date().getFullYear()) : (activePlan?.startAge || 30) + (selectedYear - new Date().getFullYear())}
                  snapshot={yearData?.snapshot || planDetails.snapshots.find(s => s.year === selectedYear) || null}
                  assets={yearData?.assets || planDetails.snapshots.find(s => s.year === selectedYear)?.assets || []}
                  liabilities={yearData?.liabilities || planDetails.snapshots.find(s => s.year === selectedYear)?.liabilities || []}
                  income={yearData?.income || planDetails.snapshots.find(s => s.year === selectedYear)?.income || []}
                  expenses={yearData?.expenses || planDetails.snapshots.find(s => s.year === selectedYear)?.expenses || []}
                  isLoading={yearLoading && !planDetails}
                />
              )}
            </TabsContent>

            <TabsContent value="projection">
              {projectionData.length > 0 ? (
                <div className="space-y-6">
                  <ProjectionChart data={projectionData} />
                  <ProjectionTable data={projectionData} />
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Insufficient data to generate projection. Please ensure you have account balances and plan details.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}