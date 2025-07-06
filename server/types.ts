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
  Recommendation, Resource
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Retirement goals operations
  getRetirementGoals(userId: number): Promise<RetirementGoal[]>;
  getRetirementGoal(id: number): Promise<RetirementGoal | undefined>;
  createRetirementGoal(goal: InsertRetirementGoal): Promise<RetirementGoal>;
  updateRetirementGoal(id: number, goal: Partial<InsertRetirementGoal>): Promise<RetirementGoal | undefined>;
  deleteRetirementGoal(id: number): Promise<boolean>;

  // Investment accounts operations
  getInvestmentAccounts(userId: number): Promise<InvestmentAccount[]>;
  getInvestmentAccount(id: number): Promise<InvestmentAccount | undefined>;
  createInvestmentAccount(account: InsertInvestmentAccount): Promise<InvestmentAccount>;
  updateInvestmentAccount(id: number, account: Partial<InsertInvestmentAccount>): Promise<InvestmentAccount | undefined>;
  deleteInvestmentAccount(id: number): Promise<boolean>;

  // Asset allocations operations
  getAssetAllocations(accountId: number): Promise<AssetAllocation[]>;
  createAssetAllocation(allocation: InsertAssetAllocation): Promise<AssetAllocation>;
  updateAssetAllocation(id: number, allocation: Partial<InsertAssetAllocation>): Promise<AssetAllocation | undefined>;
  deleteAssetAllocation(id: number): Promise<boolean>;

  // Security holdings operations
  getSecurityHoldings(accountId: number): Promise<SecurityHolding[]>;
  getSecurityHolding(id: number): Promise<SecurityHolding | undefined>;
  createSecurityHolding(holding: InsertSecurityHolding): Promise<SecurityHolding>;
  updateSecurityHolding(id: number, holding: Partial<InsertSecurityHolding>): Promise<SecurityHolding | undefined>;
  deleteSecurityHolding(id: number): Promise<boolean>;

  // Retirement expenses operations
  getRetirementExpenses(userId: number): Promise<RetirementExpense[]>;
  createRetirementExpense(expense: InsertRetirementExpense): Promise<RetirementExpense>;
  updateRetirementExpense(id: number, expense: Partial<InsertRetirementExpense>): Promise<RetirementExpense | undefined>;
  deleteRetirementExpense(id: number): Promise<boolean>;

  // Activities operations
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Recommendations operations
  getRecommendations(userId: number): Promise<Recommendation[]>;
  
  // Resources operations
  getResources(): Promise<Resource[]>;
  
  // Roth conversion plans operations
  getRothConversionPlans(userId: number): Promise<RothConversionPlan[]>;
  getRothConversionPlan(id: number): Promise<RothConversionPlan | undefined>;
  createRothConversionPlan(plan: InsertRothConversionPlan): Promise<RothConversionPlan>;
  updateRothConversionPlan(id: number, plan: Partial<InsertRothConversionPlan>): Promise<RothConversionPlan | undefined>;
  deleteRothConversionPlan(id: number): Promise<boolean>;
  
  // Roth conversion scenarios operations
  getRothConversionScenarios(planId: number): Promise<RothConversionScenario[]>;
  createRothConversionScenario(scenario: InsertRothConversionScenario): Promise<RothConversionScenario>;
  deleteRothConversionScenarios(planId: number): Promise<boolean>;
}
