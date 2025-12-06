import { drizzle } from 'drizzle-orm/node-postgres';

import { Pool } from 'pg';
import {
  users, type User, type InsertUser,
  retirementGoals, type RetirementGoal, type InsertRetirementGoal,
  investmentAccounts, type InvestmentAccount, type InsertInvestmentAccount,
  assetAllocations, type AssetAllocation, type InsertAssetAllocation,
  securityHoldings, type SecurityHolding, type InsertSecurityHolding,
  retirementExpenses, type RetirementExpense, type InsertRetirementExpense,
  activities, type Activity, type InsertActivity,
  rothConversionPlans, type RothConversionPlan, type InsertRothConversionPlan,
  rothConversionScenarios, type RothConversionScenario, type InsertRothConversionScenario,
  multiStepFormProgress, type MultiStepFormProgress, type InsertMultiStepFormProgress,
  retirementPlans, type RetirementPlan, type InsertRetirementPlan,
  annualSnapshots, type AnnualSnapshot, type InsertAnnualSnapshot,
  accountBalances, type AccountBalance, type InsertAccountBalance,
  milestones, type Milestone, type InsertMilestone,
  liabilities, type Liability, type InsertLiability,
  standardMilestones, type StandardMilestone, type InsertStandardMilestone,
  type Recommendation, type Resource
} from "@shared/schema";
import { eq, desc, and } from 'drizzle-orm';
import type { IStorage } from './types';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Drizzle database instance
const db = drizzle(pool);

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const results = await db.insert(users).values(userData).returning();
    return results[0];
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const results = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return results[0];
  }

  // Retirement goals operations
  async getRetirementGoals(userId: string): Promise<RetirementGoal[]> {
    return await db
      .select()
      .from(retirementGoals)
      .where(eq(retirementGoals.userId, userId));
  }

  async getRetirementGoal(id: string): Promise<RetirementGoal | undefined> {
    const results = await db
      .select()
      .from(retirementGoals)
      .where(eq(retirementGoals.id, id));
    return results[0];
  }

  async createRetirementGoal(goalData: InsertRetirementGoal): Promise<RetirementGoal> {
    const results = await db
      .insert(retirementGoals)
      .values(goalData)
      .returning();
    return results[0];
  }

  async updateRetirementGoal(id: string, goalData: Partial<InsertRetirementGoal>): Promise<RetirementGoal | undefined> {
    const results = await db
      .update(retirementGoals)
      .set(goalData)
      .where(eq(retirementGoals.id, id))
      .returning();
    return results[0];
  }

  async deleteRetirementGoal(id: string): Promise<boolean> {
    const results = await db
      .delete(retirementGoals)
      .where(eq(retirementGoals.id, id))
      .returning();
    return results.length > 0;
  }

  // Investment accounts operations
  async getInvestmentAccounts(userId: string): Promise<InvestmentAccount[]> {
    return await db
      .select()
      .from(investmentAccounts)
      .where(eq(investmentAccounts.userId, userId));
  }

  async getInvestmentAccount(id: string): Promise<InvestmentAccount | undefined> {
    const results = await db
      .select()
      .from(investmentAccounts)
      .where(eq(investmentAccounts.id, id));
    return results[0];
  }

  async createInvestmentAccount(accountData: InsertInvestmentAccount): Promise<InvestmentAccount> {
    const results = await db
      .insert(investmentAccounts)
      .values(accountData)
      .returning();
    return results[0];
  }

  async updateInvestmentAccount(id: string, accountData: Partial<InsertInvestmentAccount>): Promise<InvestmentAccount | undefined> {
    const results = await db
      .update(investmentAccounts)
      .set(accountData)
      .where(eq(investmentAccounts.id, id))
      .returning();
    return results[0];
  }

  async deleteInvestmentAccount(id: string): Promise<boolean> {
    const results = await db
      .delete(investmentAccounts)
      .where(eq(investmentAccounts.id, id))
      .returning();
    return results.length > 0;
  }

  // Asset allocations operations
  async getAssetAllocations(accountId: string): Promise<AssetAllocation[]> {
    return await db
      .select()
      .from(assetAllocations)
      .where(eq(assetAllocations.accountId, accountId));
  }

  async createAssetAllocation(allocationData: InsertAssetAllocation): Promise<AssetAllocation> {
    const results = await db
      .insert(assetAllocations)
      .values(allocationData)
      .returning();
    return results[0];
  }

  async updateAssetAllocation(id: string, allocationData: Partial<InsertAssetAllocation>): Promise<AssetAllocation | undefined> {
    const results = await db
      .update(assetAllocations)
      .set(allocationData)
      .where(eq(assetAllocations.id, id))
      .returning();
    return results[0];
  }

  async deleteAssetAllocation(id: string): Promise<boolean> {
    const results = await db
      .delete(assetAllocations)
      .where(eq(assetAllocations.id, id))
      .returning();
    return results.length > 0;
  }

  // Security holdings operations
  async getSecurityHoldings(accountId: string): Promise<SecurityHolding[]> {
    return await db
      .select()
      .from(securityHoldings)
      .where(eq(securityHoldings.accountId, accountId));
  }

  async getSecurityHolding(id: string): Promise<SecurityHolding | undefined> {
    const results = await db
      .select()
      .from(securityHoldings)
      .where(eq(securityHoldings.id, id));
    return results[0];
  }

  async createSecurityHolding(holdingData: InsertSecurityHolding): Promise<SecurityHolding> {
    const results = await db
      .insert(securityHoldings)
      .values(holdingData)
      .returning();
    return results[0];
  }

  async updateSecurityHolding(id: string, holdingData: Partial<InsertSecurityHolding>): Promise<SecurityHolding | undefined> {
    const results = await db
      .update(securityHoldings)
      .set(holdingData)
      .where(eq(securityHoldings.id, id))
      .returning();
    return results[0];
  }

  async deleteSecurityHolding(id: string): Promise<boolean> {
    const results = await db
      .delete(securityHoldings)
      .where(eq(securityHoldings.id, id))
      .returning();
    return results.length > 0;
  }

  // Retirement expenses operations
  async getRetirementExpenses(userId: string): Promise<RetirementExpense[]> {
    return await db
      .select()
      .from(retirementExpenses)
      .where(eq(retirementExpenses.userId, userId));
  }

  async createRetirementExpense(expenseData: InsertRetirementExpense): Promise<RetirementExpense> {
    const results = await db
      .insert(retirementExpenses)
      .values(expenseData)
      .returning();
    return results[0];
  }

  async updateRetirementExpense(id: string, expenseData: Partial<InsertRetirementExpense>): Promise<RetirementExpense | undefined> {
    const results = await db
      .update(retirementExpenses)
      .set(expenseData)
      .where(eq(retirementExpenses.id, id))
      .returning();
    return results[0];
  }

  async deleteRetirementExpense(id: string): Promise<boolean> {
    const results = await db
      .delete(retirementExpenses)
      .where(eq(retirementExpenses.id, id))
      .returning();
    return results.length > 0;
  }

  // Activities operations
  async getActivities(userId: string, limit?: number): Promise<Activity[]> {
    let query = db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.date));

    if (limit) {
      return await query.limit(limit);
    }

    return await query;
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const results = await db
      .insert(activities)
      .values(activityData)
      .returning();
    return results[0];
  }

  // Recommendations operations (static data for demo)
  async getRecommendations(userId: string): Promise<Recommendation[]> {
    return [
      {
        id: "rec-1",
        title: "Increase 401(k) contributions",
        description: "Consider increasing your 401(k) contributions to maximize your employer match and tax benefits.",
        impact: "high",
        actionText: "Adjust contributions",
        actionLink: "/portfolio"
      },
      // ... other recommendations
    ];
  }

  // Resources operations (static data for demo)
  async getResources(): Promise<Resource[]> {
    return [
      {
        id: "res-1",
        title: "Retirement Planning Guide",
        description: "Learn the basics of retirement planning and strategies.",
        icon: "book",
        buttonText: "Read Guide",
        buttonLink: "/guides/retirement",
        color: "blue"
      },
      // ... other resources
    ];
  }

  // Roth conversion plans operations
  async getRothConversionPlans(userId: string): Promise<RothConversionPlan[]> {
    return await db
      .select()
      .from(rothConversionPlans)
      .where(eq(rothConversionPlans.userId, userId))
      .orderBy(desc(rothConversionPlans.createdAt));
  }

  async getRothConversionPlan(id: string): Promise<RothConversionPlan | undefined> {
    const results = await db
      .select()
      .from(rothConversionPlans)
      .where(eq(rothConversionPlans.id, id));
    return results[0];
  }

  async createRothConversionPlan(planData: InsertRothConversionPlan): Promise<RothConversionPlan> {
    const results = await db
      .insert(rothConversionPlans)
      .values(planData)
      .returning();
    return results[0];
  }

  async updateRothConversionPlan(id: string, planData: Partial<InsertRothConversionPlan>): Promise<RothConversionPlan | undefined> {
    const results = await db
      .update(rothConversionPlans)
      .set({ ...planData, updatedAt: new Date() })
      .where(eq(rothConversionPlans.id, id))
      .returning();
    return results[0];
  }

  async deleteRothConversionPlan(id: string): Promise<boolean> {
    const results = await db
      .delete(rothConversionPlans)
      .where(eq(rothConversionPlans.id, id))
      .returning();
    return results.length > 0;
  }

  // Roth conversion scenarios operations
  async getRothConversionScenarios(planId: string): Promise<RothConversionScenario[]> {
    return await db
      .select()
      .from(rothConversionScenarios)
      .where(eq(rothConversionScenarios.planId, planId))
      .orderBy(rothConversionScenarios.year);
  }

  async createRothConversionScenario(scenarioData: InsertRothConversionScenario): Promise<RothConversionScenario> {
    const results = await db
      .insert(rothConversionScenarios)
      .values(scenarioData)
      .returning();
    return results[0];
  }

  async deleteRothConversionScenarios(planId: string): Promise<boolean> {
    const results = await db
      .delete(rothConversionScenarios)
      .where(eq(rothConversionScenarios.planId, planId))
      .returning();
    return results.length > 0;
  }

  async getMultiStepFormProgress(userId: string): Promise<MultiStepFormProgress | undefined> {
    const results = await db
      .select()
      .from(multiStepFormProgress)
      .where(eq(multiStepFormProgress.userId, userId));
    return results[0];
  }

  async createMultiStepFormProgress(progressData: InsertMultiStepFormProgress): Promise<MultiStepFormProgress> {
    const results = await db
      .insert(multiStepFormProgress)
      .values(progressData)
      .returning();
    return results[0];
  }

  async updateMultiStepFormProgress(userId: string, progressData: Partial<InsertMultiStepFormProgress>): Promise<MultiStepFormProgress | undefined> {
    const results = await db
      .update(multiStepFormProgress)
      .set({ ...progressData, lastUpdated: new Date() })
      .where(eq(multiStepFormProgress.userId, userId))
      .returning();
    return results[0];
  }

  async deleteMultiStepFormProgress(userId: string): Promise<boolean> {
    const results = await db
      .delete(multiStepFormProgress)
      .where(eq(multiStepFormProgress.userId, userId))
      .returning();
    return results.length > 0;
  }

  // Retirement plans operations
  async getRetirementPlans(userId: string): Promise<RetirementPlan[]> {
    return await db
      .select()
      .from(retirementPlans)
      .where(eq(retirementPlans.userId, userId))
      .orderBy(desc(retirementPlans.createdAt));
  }

  async getRetirementPlan(id: string): Promise<RetirementPlan | undefined> {
    const results = await db
      .select()
      .from(retirementPlans)
      .where(eq(retirementPlans.id, id));
    return results[0];
  }

  async createRetirementPlan(planData: InsertRetirementPlan): Promise<RetirementPlan> {
    const results = await db
      .insert(retirementPlans)
      .values(planData)
      .returning();
    return results[0];
  }

  async updateRetirementPlan(id: string, planData: Partial<InsertRetirementPlan>): Promise<RetirementPlan | undefined> {
    const results = await db
      .update(retirementPlans)
      .set({ ...planData, updatedAt: new Date() })
      .where(eq(retirementPlans.id, id))
      .returning();
    return results[0];
  }

  async deleteRetirementPlan(id: string): Promise<boolean> {
    const results = await db
      .delete(retirementPlans)
      .where(eq(retirementPlans.id, id))
      .returning();
    return results.length > 0;
  }

  async clearPlanData(planId: string): Promise<void> {
    // First delete all account balances for snapshots of this plan
    const planSnapshots = await db
      .select({ id: annualSnapshots.id })
      .from(annualSnapshots)
      .where(eq(annualSnapshots.planId, planId));

    for (const snapshot of planSnapshots) {
      await db
        .delete(accountBalances)
        .where(eq(accountBalances.snapshotId, snapshot.id));
    }

    // Then delete all annual snapshots for this plan
    await db
      .delete(annualSnapshots)
      .where(eq(annualSnapshots.planId, planId));
  }

  // Annual snapshots operations
  async getAnnualSnapshots(planId: string): Promise<AnnualSnapshot[]> {
    return await db
      .select()
      .from(annualSnapshots)
      .where(eq(annualSnapshots.planId, planId))
      .orderBy(annualSnapshots.year);
  }

  async getAnnualSnapshot(planId: string, year: number): Promise<AnnualSnapshot | undefined> {
    const results = await db
      .select()
      .from(annualSnapshots)
      .where(and(eq(annualSnapshots.planId, planId), eq(annualSnapshots.year, year)));
    return results[0];
  }

  async createAnnualSnapshot(snapshotData: InsertAnnualSnapshot): Promise<AnnualSnapshot> {
    const results = await db
      .insert(annualSnapshots)
      .values(snapshotData)
      .returning();
    return results[0];
  }

  async updateAnnualSnapshot(id: string, snapshotData: Partial<InsertAnnualSnapshot>): Promise<AnnualSnapshot | undefined> {
    const results = await db
      .update(annualSnapshots)
      .set(snapshotData)
      .where(eq(annualSnapshots.id, id))
      .returning();
    return results[0];
  }

  // Account balances operations
  async getAccountBalances(snapshotId: string): Promise<AccountBalance[]> {
    return await db
      .select()
      .from(accountBalances)
      .where(eq(accountBalances.snapshotId, snapshotId));
  }

  async createAccountBalance(balanceData: InsertAccountBalance): Promise<AccountBalance> {
    const results = await db
      .insert(accountBalances)
      .values(balanceData)
      .returning();
    return results[0];
  }

  async updateAccountBalance(id: string, balanceData: Partial<InsertAccountBalance>): Promise<AccountBalance | undefined> {
    const results = await db
      .update(accountBalances)
      .set(balanceData)
      .where(eq(accountBalances.id, id))
      .returning();
    return results[0];
  }

  // Milestones operations
  async getMilestones(planId?: string, userId?: string): Promise<Milestone[]> {
    let query = db.select().from(milestones);

    if (planId && userId) {
      return await db
        .select()
        .from(milestones)
        .where(and(eq(milestones.planId, planId), eq(milestones.userId, userId)))
        .orderBy(milestones.targetYear);
    } else if (planId) {
      return await db
        .select()
        .from(milestones)
        .where(eq(milestones.planId, planId))
        .orderBy(milestones.targetYear);
    } else if (userId) {
      return await db
        .select()
        .from(milestones)
        .where(eq(milestones.userId, userId))
        .orderBy(milestones.targetYear);
    }

    return await db
      .select()
      .from(milestones)
      .orderBy(milestones.targetYear);
  }


  async createMilestone(milestoneData: InsertMilestone): Promise<Milestone> {
    const results = await db
      .insert(milestones)
      .values(milestoneData)
      .returning();
    return results[0];
  }

  async updateMilestone(id: string, milestoneData: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const results = await db
      .update(milestones)
      .set(milestoneData)
      .where(eq(milestones.id, id))
      .returning();
    return results[0];
  }

  async deleteMilestone(id: string): Promise<boolean> {
    const results = await db
      .delete(milestones)
      .where(eq(milestones.id, id))
      .returning();
    return results.length > 0;
  }

  // Liabilities operations
  async getLiabilities(snapshotId: string): Promise<Liability[]> {
    return await db
      .select()
      .from(liabilities)
      .where(eq(liabilities.snapshotId, snapshotId));
  }

  async createLiability(liabilityData: InsertLiability): Promise<Liability> {
    const results = await db
      .insert(liabilities)
      .values(liabilityData)
      .returning();
    return results[0];
  }

  async updateLiability(id: string, liabilityData: Partial<InsertLiability>): Promise<Liability | undefined> {
    const results = await db
      .update(liabilities)
      .set(liabilityData)
      .where(eq(liabilities.id, id))
      .returning();
    return results[0];
  }

  // Standard milestones methods
  async getStandardMilestones(): Promise<StandardMilestone[]> {
    const results = await db.select().from(standardMilestones).where(eq(standardMilestones.isActive, true));
    return results;
  }

  async createStandardMilestone(milestone: InsertStandardMilestone): Promise<StandardMilestone> {
    const results = await db.insert(standardMilestones).values(milestone).returning();
    return results[0];
  }

  async populateStandardMilestones(): Promise<void> {
    // Check if milestones already exist
    const existingMilestones = await db.select().from(standardMilestones);
    if (existingMilestones.length > 0) {
      console.log("Standard milestones already exist, skipping population");
      return;
    }

    const defaultMilestones: InsertStandardMilestone[] = [
      {
        title: "Catch-up Contributions",
        description: "Eligible for additional 401(k) and IRA contributions",
        targetAge: 50,
        category: "financial",
        icon: "dollar-sign",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "Early Social Security",
        description: "Eligible for reduced Social Security benefits (75% of full benefit)",
        targetAge: 62,
        category: "retirement",
        icon: "clock",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "Medicare Eligibility",
        description: "Eligible for Medicare health insurance",
        targetAge: 65,
        category: "healthcare",
        icon: "shield",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "Full Retirement Age",
        description: "Eligible for full Social Security benefits",
        targetAge: 67,
        category: "retirement",
        icon: "clock",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "Required Minimum Distributions",
        description: "Must begin taking RMDs from retirement accounts",
        targetAge: 73,
        category: "financial",
        icon: "dollar-sign",
        isActive: true,
        sortOrder: 1,
      },
    ];

    await db.insert(standardMilestones).values(defaultMilestones);
    console.log(`✅ Successfully populated ${defaultMilestones.length} standard milestones`);
  }
}

// Export a single instance
export const storage = new PostgresStorage();
