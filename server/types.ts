import type {
  User, InsertUser,
  RetirementGoal, InsertRetirementGoal,
  InvestmentAccount, InsertInvestmentAccount,
  AssetAllocation, InsertAssetAllocation,
  SecurityHolding, InsertSecurityHolding,
  RetirementExpense, InsertRetirementExpense,
  Activity, InsertActivity,
  RothConversionPlan, InsertRothConversionPlan,
  RothConversionScenario, InsertRothConversionScenario,
  MultiStepFormProgress, InsertMultiStepFormProgress,
  RetirementPlan, InsertRetirementPlan,
  AnnualSnapshot, InsertAnnualSnapshot,
  AccountBalance, InsertAccountBalance,
  Milestone, InsertMilestone,
  Liability, InsertLiability,
  StandardMilestone, InsertStandardMilestone,
  Recommendation, Resource
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Retirement goals operations
  getRetirementGoals(userId: string): Promise<RetirementGoal[]>;
  getRetirementGoal(id: string): Promise<RetirementGoal | undefined>;
  createRetirementGoal(goal: InsertRetirementGoal): Promise<RetirementGoal>;
  updateRetirementGoal(id: string, goal: Partial<InsertRetirementGoal>): Promise<RetirementGoal | undefined>;
  deleteRetirementGoal(id: string): Promise<boolean>;

  // Investment accounts operations
  getInvestmentAccounts(userId: string): Promise<InvestmentAccount[]>;
  getInvestmentAccount(id: string): Promise<InvestmentAccount | undefined>;
  createInvestmentAccount(account: InsertInvestmentAccount): Promise<InvestmentAccount>;
  updateInvestmentAccount(id: string, account: Partial<InsertInvestmentAccount>): Promise<InvestmentAccount | undefined>;
  deleteInvestmentAccount(id: string): Promise<boolean>;

  // Asset allocations operations
  getAssetAllocations(accountId: string): Promise<AssetAllocation[]>;
  createAssetAllocation(allocation: InsertAssetAllocation): Promise<AssetAllocation>;
  updateAssetAllocation(id: string, allocation: Partial<InsertAssetAllocation>): Promise<AssetAllocation | undefined>;
  deleteAssetAllocation(id: string): Promise<boolean>;

  // Security holdings operations
  getSecurityHoldings(accountId: string): Promise<SecurityHolding[]>;
  getSecurityHolding(id: string): Promise<SecurityHolding | undefined>;
  createSecurityHolding(holding: InsertSecurityHolding): Promise<SecurityHolding>;
  updateSecurityHolding(id: string, holding: Partial<InsertSecurityHolding>): Promise<SecurityHolding | undefined>;
  deleteSecurityHolding(id: string): Promise<boolean>;

  // Retirement expenses operations
  getRetirementExpenses(userId: string): Promise<RetirementExpense[]>;
  createRetirementExpense(expense: InsertRetirementExpense): Promise<RetirementExpense>;
  updateRetirementExpense(id: string, expense: Partial<InsertRetirementExpense>): Promise<RetirementExpense | undefined>;
  deleteRetirementExpense(id: string): Promise<boolean>;

  // Activities operations
  getActivities(userId: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Recommendations operations
  getRecommendations(userId: string): Promise<Recommendation[]>;

  // Resources operations
  getResources(): Promise<Resource[]>;

  // Roth conversion plans operations
  getRothConversionPlans(userId: string): Promise<RothConversionPlan[]>;
  getRothConversionPlan(id: string): Promise<RothConversionPlan | undefined>;
  createRothConversionPlan(plan: InsertRothConversionPlan): Promise<RothConversionPlan>;
  updateRothConversionPlan(id: string, plan: Partial<InsertRothConversionPlan>): Promise<RothConversionPlan | undefined>;
  deleteRothConversionPlan(id: string): Promise<boolean>;

  // Roth conversion scenarios operations
  getRothConversionScenarios(planId: string): Promise<RothConversionScenario[]>;
  createRothConversionScenario(scenario: InsertRothConversionScenario): Promise<RothConversionScenario>;
  deleteRothConversionScenarios(planId: string): Promise<boolean>;

  // Multi-step form progress operations
  getMultiStepFormProgress(userId: string): Promise<MultiStepFormProgress | undefined>;
  createMultiStepFormProgress(progress: InsertMultiStepFormProgress): Promise<MultiStepFormProgress>;
  updateMultiStepFormProgress(userId: string, progress: Partial<InsertMultiStepFormProgress>): Promise<MultiStepFormProgress | undefined>;
  deleteMultiStepFormProgress(userId: string): Promise<boolean>;

  // Retirement plans operations
  getRetirementPlans(userId: string): Promise<RetirementPlan[]>;
  getRetirementPlan(id: string): Promise<RetirementPlan | undefined>;
  createRetirementPlan(plan: InsertRetirementPlan): Promise<RetirementPlan>;
  updateRetirementPlan(id: string, plan: Partial<InsertRetirementPlan>): Promise<RetirementPlan | undefined>;
  deleteRetirementPlan(id: string): Promise<boolean>;
  clearPlanData(planId: string): Promise<void>;

  // Annual snapshots operations
  getAnnualSnapshots(planId: string): Promise<AnnualSnapshot[]>;
  getAnnualSnapshot(planId: string, year: number): Promise<AnnualSnapshot | undefined>;
  createAnnualSnapshot(snapshot: InsertAnnualSnapshot): Promise<AnnualSnapshot>;
  updateAnnualSnapshot(id: string, snapshot: Partial<InsertAnnualSnapshot>): Promise<AnnualSnapshot | undefined>;

  // Account balances operations
  getAccountBalances(snapshotId: string): Promise<AccountBalance[]>;
  createAccountBalance(balance: InsertAccountBalance): Promise<AccountBalance>;
  updateAccountBalance(id: string, balance: Partial<InsertAccountBalance>): Promise<AccountBalance | undefined>;

  // Milestones operations
  getMilestones(planId?: string, userId?: string): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: string): Promise<boolean>;

  // Liabilities operations
  getLiabilities(snapshotId: string): Promise<Liability[]>;
  createLiability(liability: InsertLiability): Promise<Liability>;
  updateLiability(id: string, liability: Partial<InsertLiability>): Promise<Liability | undefined>;

  // Standard milestones operations
  getStandardMilestones(): Promise<StandardMilestone[]>;
  createStandardMilestone(milestone: InsertStandardMilestone): Promise<StandardMilestone>;
  populateStandardMilestones(): Promise<void>;
}
