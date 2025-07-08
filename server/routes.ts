import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertRetirementGoalSchema,
  insertInvestmentAccountSchema,
  insertAssetAllocationSchema,
  insertSecurityHoldingSchema,
  insertRetirementExpenseSchema,
  insertActivitySchema,
  insertRothConversionPlanSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      return res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Retirement goals routes
  app.get("/api/users/:userId/retirement-goals", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const goals = await storage.getRetirementGoals(userId);
    return res.json(goals);
  });

  app.post("/api/retirement-goals", async (req: Request, res: Response) => {
    try {
      const goalData = insertRetirementGoalSchema.parse(req.body);
      const goal = await storage.createRetirementGoal(goalData);
      
      // Create an activity for this goal creation
      await ({
        userId: goalData.userId,
        activityType: "goal_created",
        title: "New Retirement Goal",
        description: `Added a new retirement goal${goalData.description ? ': ' + goalData.description : ''}`,
        metadata: {
          goalId: goal.id,
          category: goalData.category,
          priority: goalData.priority
        }
      });
      
      return res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create retirement goal" });
    }
  });

  app.patch("/api/retirement-goals/:id", async (req: Request, res: Response) => {
    const goalId = parseInt(req.params.id);
    
    if (isNaN(goalId)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }
    
    try {
      const goalData = insertRetirementGoalSchema.partial().parse(req.body);
      const updatedGoal = await storage.updateRetirementGoal(goalId, goalData);
      
      if (!updatedGoal) {
        return res.status(404).json({ message: "Retirement goal not found" });
      }
      
      // Create an activity for this goal update
      await storage.createActivity({
        userId: updatedGoal.userId,
        activityType: "goal_updated",
        title: "Updated Retirement Goal",
        description: `Updated retirement goal${updatedGoal.description ? ': ' + updatedGoal.description : ''}`,
        metadata: {
          goalId: updatedGoal.id,
          category: updatedGoal.category,
          priority: updatedGoal.priority
        }
      });
      
      return res.json(updatedGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update retirement goal" });
    }
  });

  app.delete("/api/retirement-goals/:id", async (req: Request, res: Response) => {
    const goalId = parseInt(req.params.id);
    
    if (isNaN(goalId)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }
    
    // Get the goal before deleting it to capture user info and goal details
    const goal = await storage.getRetirementGoal(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Retirement goal not found" });
    }
    
    const success = await storage.deleteRetirementGoal(goalId);
    
    if (!success) {
      return res.status(404).json({ message: "Retirement goal not found" });
    }
    
    // Create an activity for this goal deletion
    await storage.createActivity({
      userId: goal.userId,
      activityType: "goal_deleted",
      title: "Deleted Retirement Goal",
      description: `Deleted retirement goal${goal.description ? ': ' + goal.description : ''}`,
      metadata: {
        goalId: goal.id,
        category: goal.category,
        priority: goal.priority
      }
    });
    
    return res.status(204).end();
  });

  // Investment accounts routes
  app.get("/api/users/:userId/investment-accounts", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const accounts = await storage.getInvestmentAccounts(userId);
    return res.json(accounts);
  });

  app.post("/api/investment-accounts", async (req: Request, res: Response) => {
    try {
      const accountData = insertInvestmentAccountSchema.parse(req.body);
      const account = await storage.createInvestmentAccount(accountData);
      return res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create investment account" });
    }
  });

  app.patch("/api/investment-accounts/:id", async (req: Request, res: Response) => {
    const accountId = parseInt(req.params.id);
    
    if (isNaN(accountId)) {
      return res.status(400).json({ message: "Invalid account ID" });
    }
    
    try {
      const accountData = insertInvestmentAccountSchema.partial().parse(req.body);
      const updatedAccount = await storage.updateInvestmentAccount(accountId, accountData);
      
      if (!updatedAccount) {
        return res.status(404).json({ message: "Investment account not found" });
      }
      
      return res.json(updatedAccount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update investment account" });
    }
  });

  app.delete("/api/investment-accounts/:id", async (req: Request, res: Response) => {
    const accountId = parseInt(req.params.id);
    
    if (isNaN(accountId)) {
      return res.status(400).json({ message: "Invalid account ID" });
    }
    
    const success = await storage.deleteInvestmentAccount(accountId);
    
    if (!success) {
      return res.status(404).json({ message: "Investment account not found" });
    }
    
    return res.status(204).end();
  });

  // Asset allocations routes
  app.get("/api/investment-accounts/:accountId/asset-allocations", async (req: Request, res: Response) => {
    const accountId = parseInt(req.params.accountId);
    
    if (isNaN(accountId)) {
      return res.status(400).json({ message: "Invalid account ID" });
    }
    
    const allocations = await storage.getAssetAllocations(accountId);
    return res.json(allocations);
  });

  app.post("/api/asset-allocations", async (req: Request, res: Response) => {
    try {
      const allocationData = insertAssetAllocationSchema.parse(req.body);
      const allocation = await storage.createAssetAllocation(allocationData);
      return res.status(201).json(allocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid allocation data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create asset allocation" });
    }
  });

  app.patch("/api/asset-allocations/:id", async (req: Request, res: Response) => {
    const allocationId = parseInt(req.params.id);
    
    if (isNaN(allocationId)) {
      return res.status(400).json({ message: "Invalid allocation ID" });
    }
    
    try {
      const allocationData = insertAssetAllocationSchema.partial().parse(req.body);
      const updatedAllocation = await storage.updateAssetAllocation(allocationId, allocationData);
      
      if (!updatedAllocation) {
        return res.status(404).json({ message: "Asset allocation not found" });
      }
      
      return res.json(updatedAllocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid allocation data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update asset allocation" });
    }
  });

  app.delete("/api/asset-allocations/:id", async (req: Request, res: Response) => {
    const allocationId = parseInt(req.params.id);
    
    if (isNaN(allocationId)) {
      return res.status(400).json({ message: "Invalid allocation ID" });
    }
    
    const success = await storage.deleteAssetAllocation(allocationId);
    
    if (!success) {
      return res.status(404).json({ message: "Asset allocation not found" });
    }
    
    return res.status(204).end();
  });

  // Security holdings routes
  app.get("/api/investment-accounts/:accountId/security-holdings", async (req: Request, res: Response) => {
    const accountId = parseInt(req.params.accountId);
    
    if (isNaN(accountId)) {
      return res.status(400).json({ message: "Invalid account ID" });
    }
    
    const holdings = await storage.getSecurityHoldings(accountId);
    return res.json(holdings);
  });

  app.post("/api/security-holdings", async (req: Request, res: Response) => {
    try {
      const holdingData = insertSecurityHoldingSchema.parse(req.body);
      const newHolding = await storage.createSecurityHolding(holdingData);
      
      // Create activity for adding a new security holding
      await storage.createActivity({
        userId: (await storage.getInvestmentAccount(holdingData.accountId))?.userId || 1,
        activityType: "portfolio_update",
        description: `Added ${holdingData.ticker} to portfolio`,
        date: new Date(),
        metadata: { ticker: holdingData.ticker, percentage: holdingData.percentage }
      });
      
      res.status(201).json(newHolding);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid holding data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create security holding" });
    }
  });

  app.patch("/api/security-holdings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid security holding ID" });
      }
      
      const existingHolding = await storage.getSecurityHolding(id);
      
      if (!existingHolding) {
        return res.status(404).json({ message: "Security holding not found" });
      }
      
      const updateData = insertSecurityHoldingSchema.partial().parse(req.body);
      const updatedHolding = await storage.updateSecurityHolding(id, updateData);
      
      // Create activity for updating security holding
      await storage.createActivity({
        userId: (await storage.getInvestmentAccount(existingHolding.accountId))?.userId || 1,
        activityType: "portfolio_update",
        description: `Updated ${existingHolding.ticker} allocation`,
        date: new Date(),
        metadata: { 
          ticker: existingHolding.ticker, 
          oldPercentage: existingHolding.percentage,
          newPercentage: updateData.percentage || existingHolding.percentage
        }
      });
      
      res.json(updatedHolding);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid holding data", errors: error.errors });
      }
      return res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/security-holdings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid security holding ID" });
      }
      
      const existingHolding = await storage.getSecurityHolding(id);
      
      if (!existingHolding) {
        return res.status(404).json({ message: "Security holding not found" });
      }
      
      const deleted = await storage.deleteSecurityHolding(id);
      
      // Create activity for deleting security holding
      await storage.createActivity({
        userId: (await storage.getInvestmentAccount(existingHolding.accountId))?.userId || 1,
        activityType: "portfolio_update",
        description: `Removed ${existingHolding.ticker} from portfolio`,
        date: new Date(),
        metadata: { ticker: existingHolding.ticker }
      });
      
      res.json({ success: deleted });
    } catch (error: unknown) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Retirement expenses routes
  app.get("/api/users/:userId/retirement-expenses", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const expenses = await storage.getRetirementExpenses(userId);
    return res.json(expenses);
  });

  app.post("/api/retirement-expenses", async (req: Request, res: Response) => {
    try {
      const expenseData = insertRetirementExpenseSchema.parse(req.body);
      const expense = await storage.createRetirementExpense(expenseData);
      return res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create retirement expense" });
    }
  });

  app.patch("/api/retirement-expenses/:id", async (req: Request, res: Response) => {
    const expenseId = parseInt(req.params.id);
    
    if (isNaN(expenseId)) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }
    
    try {
      const expenseData = insertRetirementExpenseSchema.partial().parse(req.body);
      const updatedExpense = await storage.updateRetirementExpense(expenseId, expenseData);
      
      if (!updatedExpense) {
        return res.status(404).json({ message: "Retirement expense not found" });
      }
      
      return res.json(updatedExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update retirement expense" });
    }
  });

  app.delete("/api/retirement-expenses/:id", async (req: Request, res: Response) => {
    const expenseId = parseInt(req.params.id);
    
    if (isNaN(expenseId)) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }
    
    const success = await storage.deleteRetirementExpense(expenseId);
    
    if (!success) {
      return res.status(404).json({ message: "Retirement expense not found" });
    }
    
    return res.status(204).end();
  });

  // Activities routes
  app.get("/api/users/:userId/activities", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    let limit: number | undefined = undefined;
    if (req.query.limit && typeof req.query.limit === 'string') {
      limit = parseInt(req.query.limit);
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ message: "Invalid limit parameter" });
      }
    }
    
    const activities = await storage.getActivities(userId, limit);
    return res.json(activities);
  });

  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      return res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Roth conversion plans routes
  app.get("/api/users/:userId/roth-conversion-plans", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const plans = await storage.getRothConversionPlans(userId);
    return res.json(plans);
  });

  app.get("/api/roth-conversion-plans/:id", async (req: Request, res: Response) => {
    const planId = parseInt(req.params.id);
    
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }
    
    const plan = await storage.getRothConversionPlan(planId);
    
    if (!plan) {
      return res.status(404).json({ message: "Roth conversion plan not found" });
    }
    
    // Get scenarios for this plan
    const scenarios = await storage.getRothConversionScenarios(planId);
    
    return res.json({ plan, scenarios });
  });

  app.post("/api/roth-conversion-plans", async (req: Request, res: Response) => {
    try {
      console.log('Creating Roth conversion plan with data:', req.body);
      const planData = insertRothConversionPlanSchema.parse(req.body);
      console.log('Parsed plan data:', planData);
      const plan = await storage.createRothConversionPlan(planData);
      console.log('Created plan:', plan);
      
      // Create an activity for this plan creation
      await storage.createActivity({
        userId: planData.userId,
        activityType: "roth_conversion_plan_created",
        title: "Roth Conversion Plan Created",
        description: `Created Roth conversion plan: ${planData.planName}`,
        metadata: {
          planId: plan.id,
          conversionAmount: planData.conversionAmount,
          yearsToConvert: planData.yearsToConvert
        }
      });
      
      return res.status(201).json(plan);
    } catch (error: unknown) {
      console.error('Error creating Roth conversion plan:', error);
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        return res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create Roth conversion plan" });
    }
  });

  app.post("/api/roth-conversion-plans/:id/scenarios", async (req: Request, res: Response) => {
    const planId = parseInt(req.params.id);
    
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }
    
    try {
      // Delete existing scenarios for this plan
      await storage.deleteRothConversionScenarios(planId);
      
      // Insert new scenarios
      const scenarios = req.body.scenarios;
      if (!Array.isArray(scenarios)) {
        return res.status(400).json({ message: "Scenarios must be an array" });
      }
      
      const createdScenarios = [];
      for (const scenario of scenarios) {
        const scenarioData = {
          ...scenario,
          planId
        };
        const createdScenario = await storage.createRothConversionScenario(scenarioData);
        createdScenarios.push(createdScenario);
      }
      
      return res.status(201).json(createdScenarios);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid scenario data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create scenarios" });
    }
  });

  app.patch("/api/roth-conversion-plans/:id", async (req: Request, res: Response) => {
    const planId = parseInt(req.params.id);
    
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }
    
    try {
      const planData = insertRothConversionPlanSchema.partial().parse(req.body);
      const updatedPlan = await storage.updateRothConversionPlan(planId, planData);
      
      if (!updatedPlan) {
        return res.status(404).json({ message: "Roth conversion plan not found" });
      }
      
      // Create an activity for this plan update
      await storage.createActivity({
        userId: updatedPlan.userId,
        activityType: "roth_conversion_plan_updated",
        title: "Roth Conversion Plan Updated",
        description: `Updated Roth conversion plan: ${updatedPlan.planName}`,
        metadata: {
          planId: updatedPlan.id,
          conversionAmount: updatedPlan.conversionAmount,
          yearsToConvert: updatedPlan.yearsToConvert
        }
      });
      
      return res.json(updatedPlan);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update Roth conversion plan" });
    }
  });

  app.delete("/api/roth-conversion-plans/:id", async (req: Request, res: Response) => {
    const planId = parseInt(req.params.id);
    
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }
    
    // Get the plan before deleting it to capture user info and plan details
    const plan = await storage.getRothConversionPlan(planId);
    if (!plan) {
      return res.status(404).json({ message: "Roth conversion plan not found" });
    }
    
    const success = await storage.deleteRothConversionPlan(planId);
    
    if (!success) {
      return res.status(404).json({ message: "Roth conversion plan not found" });
    }
    
    // Create an activity for this plan deletion
    await storage.createActivity({
      userId: plan.userId,
      activityType: "roth_conversion_plan_deleted",
      title: "Roth Conversion Plan Deleted",
      description: `Deleted Roth conversion plan: ${plan.planName}`,
      metadata: {
        planId: plan.id,
        conversionAmount: plan.conversionAmount,
        yearsToConvert: plan.yearsToConvert
      }
    });
    
    return res.status(204).end();
  });

  // Dashboard summary route
  app.get("/api/users/:userId/dashboard", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get retirement goals
    const goals = await storage.getRetirementGoals(userId);
    
    // Get investment accounts
    const accounts = await storage.getInvestmentAccounts(userId);
    
    // Get asset allocations for all accounts
    const assetAllocations = [];
    for (const account of accounts) {
      const allocations = await storage.getAssetAllocations(account.id);
      assetAllocations.push(...allocations);
    }
    
    // Get security holdings for all accounts
    const securityHoldings = [];
    for (const account of accounts) {
      const holdings = await storage.getSecurityHoldings(account.id);
      securityHoldings.push(...holdings);
    }
    
    // Get retirement expenses
    const expenses = await storage.getRetirementExpenses(userId);
    
    // Get recent activities
    const activities = await storage.getActivities(userId, 3);
    
    // Get personalized recommendations
    const recommendations = await storage.getRecommendations(userId);
    
    // Get resources
    const resources = await storage.getResources();
    
    // Calculate total portfolio value
    const totalPortfolioValue = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
    
    // Calculate retirement readiness score (simplified)
    const retirementReadinessScore = 78;
    
    // Calculate projected monthly income (simplified)
    const projectedMonthlyIncome = 5250;
    
    // Find the primary income goal if exists
    const primaryIncomeGoal = goals.find(goal => goal.category === "income") || null;
    
    // Calculate aggregate asset allocation
    const aggregateAssetAllocation = {
      stocks: 0,
      bonds: 0,
      realEstate: 0,
      cash: 0
    };
    
    // Sum the values for each asset category
    assetAllocations.forEach(allocation => {
      const value = Number(allocation.value);
      if (allocation.assetCategory === "stocks") {
        aggregateAssetAllocation.stocks += value;
      } else if (allocation.assetCategory === "bonds") {
        aggregateAssetAllocation.bonds += value;
      } else if (allocation.assetCategory === "real_estate") {
        aggregateAssetAllocation.realEstate += value;
      } else if (allocation.assetCategory === "cash") {
        aggregateAssetAllocation.cash += value;
      }
    });
    
    // Calculate total expenses
    const totalMonthlyExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.estimatedMonthlyAmount), 
      0
    );
    
    // Calculate current savings rate (simplified)
    const currentSavingsRate = 15;
    
    // Return dashboard data
    return res.json({
      retirementReadiness: {
        score: retirementReadinessScore,
        targetRetirementAge: user.targetRetirementAge
      },
      monthlyIncome: {
        projected: projectedMonthlyIncome,
        goal: primaryIncomeGoal?.targetMonthlyIncome || 6000,
        percentOfCurrent: 87
      },
      savingsRate: {
        percentage: currentSavingsRate,
        monthlyAmount: 1250
      },
      portfolioAllocation: {
        total: totalPortfolioValue,
        categories: {
          stocks: {
            percentage: Math.round((aggregateAssetAllocation.stocks / totalPortfolioValue) * 100),
            value: aggregateAssetAllocation.stocks
          },
          bonds: {
            percentage: Math.round((aggregateAssetAllocation.bonds / totalPortfolioValue) * 100),
            value: aggregateAssetAllocation.bonds
          },
          realEstate: {
            percentage: Math.round((aggregateAssetAllocation.realEstate / totalPortfolioValue) * 100),
            value: aggregateAssetAllocation.realEstate
          },
          cash: {
            percentage: Math.round((aggregateAssetAllocation.cash / totalPortfolioValue) * 100),
            value: aggregateAssetAllocation.cash
          }
        }
      },
      incomeProjection: {
        portfolioIncome: 3800,
        socialSecurity: 1450,
        estimatedExpenses: totalMonthlyExpenses
      },
      recommendations: recommendations,
      resources: resources,
      recentActivities: activities,
      retirementGoals: goals // Add retirement goals to dashboard data
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
