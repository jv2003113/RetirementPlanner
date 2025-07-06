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
  type Recommendation, type Resource
} from "@shared/schema";
import { eq, desc } from 'drizzle-orm';
import type { IStorage } from './types';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Drizzle database instance
const db = drizzle(pool);

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
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

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const results = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return results[0];
  }

  // Retirement goals operations
  async getRetirementGoals(userId: number): Promise<RetirementGoal[]> {
    return await db
      .select()
      .from(retirementGoals)
      .where(eq(retirementGoals.userId, userId));
  }

  async getRetirementGoal(id: number): Promise<RetirementGoal | undefined> {
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

  async updateRetirementGoal(id: number, goalData: Partial<InsertRetirementGoal>): Promise<RetirementGoal | undefined> {
    const results = await db
      .update(retirementGoals)
      .set(goalData)
      .where(eq(retirementGoals.id, id))
      .returning();
    return results[0];
  }

  async deleteRetirementGoal(id: number): Promise<boolean> {
    const results = await db
      .delete(retirementGoals)
      .where(eq(retirementGoals.id, id))
      .returning();
    return results.length > 0;
  }

  // Investment accounts operations
  async getInvestmentAccounts(userId: number): Promise<InvestmentAccount[]> {
    return await db
      .select()
      .from(investmentAccounts)
      .where(eq(investmentAccounts.userId, userId));
  }

  async getInvestmentAccount(id: number): Promise<InvestmentAccount | undefined> {
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

  async updateInvestmentAccount(id: number, accountData: Partial<InsertInvestmentAccount>): Promise<InvestmentAccount | undefined> {
    const results = await db
      .update(investmentAccounts)
      .set(accountData)
      .where(eq(investmentAccounts.id, id))
      .returning();
    return results[0];
  }

  async deleteInvestmentAccount(id: number): Promise<boolean> {
    const results = await db
      .delete(investmentAccounts)
      .where(eq(investmentAccounts.id, id))
      .returning();
    return results.length > 0;
  }

  // Asset allocations operations
  async getAssetAllocations(accountId: number): Promise<AssetAllocation[]> {
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

  async updateAssetAllocation(id: number, allocationData: Partial<InsertAssetAllocation>): Promise<AssetAllocation | undefined> {
    const results = await db
      .update(assetAllocations)
      .set(allocationData)
      .where(eq(assetAllocations.id, id))
      .returning();
    return results[0];
  }

  async deleteAssetAllocation(id: number): Promise<boolean> {
    const results = await db
      .delete(assetAllocations)
      .where(eq(assetAllocations.id, id))
      .returning();
    return results.length > 0;
  }

  // Security holdings operations
  async getSecurityHoldings(accountId: number): Promise<SecurityHolding[]> {
    return await db
      .select()
      .from(securityHoldings)
      .where(eq(securityHoldings.accountId, accountId));
  }

  async getSecurityHolding(id: number): Promise<SecurityHolding | undefined> {
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

  async updateSecurityHolding(id: number, holdingData: Partial<InsertSecurityHolding>): Promise<SecurityHolding | undefined> {
    const results = await db
      .update(securityHoldings)
      .set(holdingData)
      .where(eq(securityHoldings.id, id))
      .returning();
    return results[0];
  }

  async deleteSecurityHolding(id: number): Promise<boolean> {
    const results = await db
      .delete(securityHoldings)
      .where(eq(securityHoldings.id, id))
      .returning();
    return results.length > 0;
  }

  // Retirement expenses operations
  async getRetirementExpenses(userId: number): Promise<RetirementExpense[]> {
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

  async updateRetirementExpense(id: number, expenseData: Partial<InsertRetirementExpense>): Promise<RetirementExpense | undefined> {
    const results = await db
      .update(retirementExpenses)
      .set(expenseData)
      .where(eq(retirementExpenses.id, id))
      .returning();
    return results[0];
  }

  async deleteRetirementExpense(id: number): Promise<boolean> {
    const results = await db
      .delete(retirementExpenses)
      .where(eq(retirementExpenses.id, id))
      .returning();
    return results.length > 0;
  }

  // Activities operations
  async getActivities(userId: number, limit?: number): Promise<Activity[]> {
    let query = db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.date));
    
    if (limit) {
      query = query.limit(limit);
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
  async getRecommendations(userId: number): Promise<Recommendation[]> {
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
  async getRothConversionPlans(userId: number): Promise<RothConversionPlan[]> {
    return await db
      .select()
      .from(rothConversionPlans)
      .where(eq(rothConversionPlans.userId, userId))
      .orderBy(desc(rothConversionPlans.createdAt));
  }

  async getRothConversionPlan(id: number): Promise<RothConversionPlan | undefined> {
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

  async updateRothConversionPlan(id: number, planData: Partial<InsertRothConversionPlan>): Promise<RothConversionPlan | undefined> {
    const results = await db
      .update(rothConversionPlans)
      .set({ ...planData, updatedAt: new Date() })
      .where(eq(rothConversionPlans.id, id))
      .returning();
    return results[0];
  }

  async deleteRothConversionPlan(id: number): Promise<boolean> {
    const results = await db
      .delete(rothConversionPlans)
      .where(eq(rothConversionPlans.id, id))
      .returning();
    return results.length > 0;
  }

  // Roth conversion scenarios operations
  async getRothConversionScenarios(planId: number): Promise<RothConversionScenario[]> {
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

  async deleteRothConversionScenarios(planId: number): Promise<boolean> {
    const results = await db
      .delete(rothConversionScenarios)
      .where(eq(rothConversionScenarios.planId, planId))
      .returning();
    return results.length > 0;
  }
}

// Export a single instance
export const storage = new PostgresStorage();
