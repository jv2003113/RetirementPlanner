import type {
  User, InsertUser,

  InvestmentAccount, InsertInvestmentAccount,
  AssetAllocation, InsertAssetAllocation,
  SecurityHolding, InsertSecurityHolding,

  Activity, InsertActivity,
  RothConversionPlan, InsertRothConversionPlan,
  RothConversionScenario, InsertRothConversionScenario,
  MultiStepFormProgress, InsertMultiStepFormProgress,
  RetirementPlan, InsertRetirementPlan,
  AnnualSnapshot, InsertAnnualSnapshot,
  AnnualSnapshotAsset, InsertAnnualSnapshotAsset,
  AnnualSnapshotLiability, InsertAnnualSnapshotLiability,
  AnnualSnapshotIncome, InsertAnnualSnapshotIncome,
  AnnualSnapshotExpense, InsertAnnualSnapshotExpense,
  Milestone, InsertMilestone,
  StandardMilestone, InsertStandardMilestone,
  Recommendation, Resource
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;



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
  getFullPlanData(planId: string): Promise<(AnnualSnapshot & { assets: AnnualSnapshotAsset[], liabilities: AnnualSnapshotLiability[], income: AnnualSnapshotIncome[], expenses: AnnualSnapshotExpense[] })[]>;
  getAnnualSnapshot(planId: string, year: number): Promise<AnnualSnapshot | undefined>;
  createAnnualSnapshot(snapshot: InsertAnnualSnapshot): Promise<AnnualSnapshot>;
  updateAnnualSnapshot(id: string, snapshot: Partial<InsertAnnualSnapshot>): Promise<AnnualSnapshot | undefined>;

  // Annual Snapshot Assets
  getSnapshotAssets(snapshotId: string): Promise<AnnualSnapshotAsset[]>;
  createSnapshotAsset(asset: InsertAnnualSnapshotAsset): Promise<AnnualSnapshotAsset>;

  // Annual Snapshot Liabilities
  getSnapshotLiabilities(snapshotId: string): Promise<AnnualSnapshotLiability[]>;
  createSnapshotLiability(liability: InsertAnnualSnapshotLiability): Promise<AnnualSnapshotLiability>;

  // Annual Snapshot Income
  getSnapshotIncome(snapshotId: string): Promise<AnnualSnapshotIncome[]>;
  createSnapshotIncome(income: InsertAnnualSnapshotIncome): Promise<AnnualSnapshotIncome>;

  // Annual Snapshot Expenses
  getSnapshotExpenses(snapshotId: string): Promise<AnnualSnapshotExpense[]>;
  createSnapshotExpense(expense: InsertAnnualSnapshotExpense): Promise<AnnualSnapshotExpense>;

  // Milestones
  getMilestones(planId?: string, userId?: string): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: string): Promise<boolean>;

  // Milestones operations
  getMilestones(planId?: string, userId?: string): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: string): Promise<boolean>;

  // Standard milestones operations
  getStandardMilestones(): Promise<StandardMilestone[]>;
  createStandardMilestone(milestone: InsertStandardMilestone): Promise<StandardMilestone>;
  populateStandardMilestones(): Promise<void>;
}
