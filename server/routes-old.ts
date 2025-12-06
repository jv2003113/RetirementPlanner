import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertRetirementGoalSchema,
  insertInvestmentAccountSchema,
  insertAssetAllocationSchema,
  insertSecurityHoldingSchema,
  insertRetirementExpenseSchema,
  insertActivitySchema,
  insertRothConversionPlanSchema,
  insertRothConversionScenarioSchema,
  insertMultiStepFormProgressSchema,
  insertRetirementPlanSchema,
  insertAnnualSnapshotSchema,
  insertAccountBalanceSchema,
  insertMilestoneSchema,
  insertLiabilitySchema,
} from "../shared/schema";
import { z } from "zod";
import { generateRetirementPlan } from "./planGenerator";
import { calculateRetirementProjection } from "./services/projectionService";

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Helper function to get current user from request
function getCurrentUser(req: Request): any {
  return req.user;
}

// Function to generate sample scenarios for a Roth conversion plan
async function generateSampleScenarios(plan: any) {
  const scenarios = [];
  const annualConversion = parseFloat(plan.conversionAmount) / plan.yearsToConvert;
  const currentTaxRate = parseFloat(plan.currentTaxRate) / 100;

  let traditionalBalance = parseFloat(plan.traditionalIraBalance);
  let rothBalance = 0;
  let totalTaxPaid = 0;

  // Generate scenarios for conversion years
  for (let year = 1; year <= plan.yearsToConvert; year++) {
    const age = plan.currentAge + year - 1;
    const taxCost = annualConversion * currentTaxRate;
    totalTaxPaid += taxCost;

    // Apply conversion
    traditionalBalance -= annualConversion;
    rothBalance += annualConversion - taxCost;

    // Apply growth to both accounts
    traditionalBalance *= (1 + parseFloat(plan.expectedReturn) / 100);
    rothBalance *= (1 + parseFloat(plan.expectedReturn) / 100);

    scenarios.push({
      planId: plan.id,
      year,
      age,
      conversionAmount: annualConversion.toString(),
      taxCost: taxCost.toString(),
      traditionalBalance: traditionalBalance.toString(),
      rothBalance: rothBalance.toString(),
      totalTaxPaid: totalTaxPaid.toString(),
      netWorth: (traditionalBalance + rothBalance).toString(),
    });
  }

  // Generate scenarios for years after conversion
  const yearsAfterConversion = plan.retirementAge - plan.currentAge - plan.yearsToConvert;
  for (let year = plan.yearsToConvert + 1; year <= plan.yearsToConvert + yearsAfterConversion; year++) {
    const age = plan.currentAge + year - 1;

    // Apply growth to both accounts
    traditionalBalance *= (1 + parseFloat(plan.expectedReturn) / 100);
    rothBalance *= (1 + parseFloat(plan.expectedReturn) / 100);

    scenarios.push({
      planId: plan.id,
      year,
      age,
      conversionAmount: "0",
      taxCost: "0",
      traditionalBalance: traditionalBalance.toString(),
      rothBalance: rothBalance.toString(),
      totalTaxPaid: totalTaxPaid.toString(),
      netWorth: (traditionalBalance + rothBalance).toString(),
    });
  }

  // Save the generated scenarios to the database
  const createdScenarios = [];
  for (const scenario of scenarios) {
    try {
      const createdScenario = await storage.createRothConversionScenario(scenario);
      createdScenarios.push(createdScenario);
    } catch (error) {
      console.error('Error creating scenario:', error);
    }
  }

  return createdScenarios;
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Authentication routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
      };

      const user = await storage.createUser(userData);

      // Log the user in automatically after signup
      req.login(user, (err) => {
        if (err) {
          console.error('Login error after signup:', err);
          return res.status(500).json({ message: "Account created but login failed" });
        }

        // Don't return password in response
        const { password: _, ...userWithoutPassword } = user;
        return res.status(201).json({
          message: "Account created successfully",
          user: userWithoutPassword
        });
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Auth error:', err);
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ message: "Login failed" });
        }

        // Explicitly save the session before sending response
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ message: "Session save failed" });
          }
          console.log('✓ User', user.id, 'logged in successfully with session', req.sessionID);
          return res.json({ message: "Login successful", user });
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const userId = req.params.id;

    if (!userId) {
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
    const userId = req.params.id;

    if (!userId) {
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
    const userId = req.params.userId;

    if (!userId) {
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
      await storage.createActivity({
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
    const goalId = req.params.id;

    if (!goalId) {
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
    const goalId = req.params.id;

    if (!goalId) {
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
    const userId = req.params.userId;

    if (!userId) {
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
    const accountId = req.params.id;

    if (!accountId) {
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
    const accountId = req.params.id;

    if (!accountId) {
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
    const accountId = req.params.accountId;

    if (!accountId) {
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
    const allocationId = req.params.id;

    if (!allocationId) {
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
    const allocationId = req.params.id;

    if (!allocationId) {
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
    const accountId = req.params.accountId;

    if (!accountId) {
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
        userId: (await storage.getInvestmentAccount(String(holdingData.accountId)))?.userId || "user-id",
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
      const id = req.params.id;

      if (!id) {
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
        userId: (await storage.getInvestmentAccount(String(existingHolding.accountId)))?.userId || "user-id",
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
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ message: "Invalid security holding ID" });
      }

      const existingHolding = await storage.getSecurityHolding(id);

      if (!existingHolding) {
        return res.status(404).json({ message: "Security holding not found" });
      }

      const deleted = await storage.deleteSecurityHolding(id);

      // Create activity for deleting security holding
      await storage.createActivity({
        userId: (await storage.getInvestmentAccount(String(existingHolding.accountId)))?.userId || "user-id",
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
    const userId = req.params.userId;

    if (!userId) {
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
    const expenseId = req.params.id;

    if (!expenseId) {
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
    const expenseId = req.params.id;

    if (!expenseId) {
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
    const userId = req.params.userId;

    if (!userId) {
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
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const plans = await storage.getRothConversionPlans(userId);
    return res.json(plans);
  });

  app.get("/api/roth-conversion-plans/:id", async (req: Request, res: Response) => {
    const planId = req.params.id;

    if (!planId) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = await storage.getRothConversionPlan(planId);

    if (!plan) {
      return res.status(404).json({ message: "Roth conversion plan not found" });
    }

    // Get scenarios for this plan
    let scenarios = await storage.getRothConversionScenarios(planId);

    // If no scenarios exist, generate sample scenarios
    if (scenarios.length === 0) {
      scenarios = await generateSampleScenarios(plan);
    }

    return res.json({ plan, scenarios });
  });

  app.post("/api/roth-conversion-plans", async (req: Request, res: Response) => {
    try {
      const planData = insertRothConversionPlanSchema.parse(req.body);
      const plan = await storage.createRothConversionPlan(planData);

      // Generate scenarios for the new plan
      const scenarios = await generateSampleScenarios(plan);

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
    const planId = req.params.id;

    if (!planId) {
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
          planId: planId
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
    const planId = req.params.id;

    if (!planId) {
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
    const planId = req.params.id;

    if (!planId) {
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
    const userId = req.params.userId;

    if (!userId) {
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
        projected: 5250,
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
      recommendations: recommendations,
      resources: resources,
      recentActivities: activities,
      retirementGoals: goals // Add retirement goals to dashboard data
    });
  });

  // Multi-step form progress routes
  app.get("/api/users/:userId/multi-step-form-progress", async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const progress = await storage.getMultiStepFormProgress(userId);
    return res.json(progress || null);
  });

  app.post("/api/users/:userId/multi-step-form-progress", async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const progressData = insertMultiStepFormProgressSchema.parse({
        ...req.body,
        userId
      });

      // Check if progress already exists for this user
      const existingProgress = await storage.getMultiStepFormProgress(userId);

      if (existingProgress) {
        // Update existing progress
        const updatedProgress = await storage.updateMultiStepFormProgress(userId, req.body);
        return res.json(updatedProgress);
      } else {
        // Create new progress
        const newProgress = await storage.createMultiStepFormProgress(progressData);
        return res.status(201).json(newProgress);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to save form progress" });
    }
  });

  app.patch("/api/users/:userId/multi-step-form-progress", async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const progressData = insertMultiStepFormProgressSchema.partial().parse(req.body);
      const updatedProgress = await storage.updateMultiStepFormProgress(userId, progressData);

      if (!updatedProgress) {
        return res.status(404).json({ message: "Form progress not found" });
      }

      return res.json(updatedProgress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update form progress" });
    }
  });

  app.delete("/api/users/:userId/multi-step-form-progress", async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const success = await storage.deleteMultiStepFormProgress(userId);

    if (!success) {
      return res.status(404).json({ message: "Form progress not found" });
    }

    return res.status(204).end();
  });

  // Retirement plan routes
  app.get("/api/retirement-plans", requireAuth, async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    const plans = await storage.getRetirementPlans(user.id);
    return res.json(plans);
  });

  // IMPORTANT: More specific routes must come BEFORE the generic /:id route
  // Otherwise Express will match /:id first and treat "details" or "year" as the ID

  app.get("/api/retirement-plans/:id/details", requireAuth, async (req: Request, res: Response) => {
    const planId = req.params.id;

    if (!planId) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = await storage.getRetirementPlan(planId);

    if (!plan) {
      return res.status(404).json({ message: "Retirement plan not found" });
    }

    // Get snapshots and milestones
    const snapshots = await storage.getAnnualSnapshots(planId);
    const milestones = await storage.getMilestones(planId);

    return res.json({
      ...plan,
      snapshots,
      milestones
    });
  });

  app.get("/api/retirement-plans/:id/year/:year", requireAuth, async (req: Request, res: Response) => {
    const planId = req.params.id;
    const year = parseInt(req.params.year);

    if (!planId || isNaN(year)) {
      return res.status(400).json({ message: "Invalid plan ID or year" });
    }

    const snapshot = await storage.getAnnualSnapshot(planId, year);

    if (!snapshot) {
      return res.status(404).json({ message: "Year data not found" });
    }

    // Get account balances and liabilities for this snapshot
    const accountBalances = await storage.getAccountBalances(snapshot.id);
    const liabilities = await storage.getLiabilities(snapshot.id);

    return res.json({
      snapshot,
      accountBalances,
      liabilities
    });
  });

  app.get("/api/retirement-plans/:id", requireAuth, async (req: Request, res: Response) => {
    const planId = req.params.id;

    if (!planId) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = await storage.getRetirementPlan(planId);

    if (!plan) {
      return res.status(404).json({ message: "Retirement plan not found" });
    }

    return res.json(plan);
  });

  app.post("/api/retirement-plans", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = getCurrentUser(req);

      // Check 4 plan limit
      const existingPlans = await storage.getRetirementPlans(user.id);
      if (existingPlans.length >= 4) {
        return res.status(400).json({ message: "Maximum of 4 plans allowed per user" });
      }

      const planData = insertRetirementPlanSchema.parse({
        ...req.body,
        userId: user.id
      });

      const plan = await storage.createRetirementPlan(planData);

      // Generate financial projections for the new plan - MUST complete before responding
      try {
        console.log(`🚀 Generating projections for new plan ${plan.id} (${plan.planName})`);
        await generateRetirementPlan(plan);
        console.log(`✅ Successfully generated projections for new plan ${plan.id}`);

        // Verify data was created
        const snapshots = await storage.getAnnualSnapshots(plan.id);
        console.log(`📊 Plan ${plan.id} now has ${snapshots.length} snapshots`);

        if (snapshots.length === 0) {
          throw new Error("Plan generation completed but no data was created");
        }
      } catch (genError) {
        console.error(`❌ Failed to generate projections for plan ${plan.id}:`, genError);
        // Delete the plan if generation failed
        await storage.deleteRetirementPlan(plan.id);
        return res.status(500).json({
          message: "Failed to generate retirement plan data",
          error: genError instanceof Error ? genError.message : 'Unknown error'
        });
      }

      // Create an activity for this plan creation
      await storage.createActivity({
        userId: user.id,
        activityType: "retirement_plan_created",
        title: "Retirement Plan Created",
        description: `Created retirement plan: ${planData.planName}`,
        metadata: {
          planId: plan.id,
          planType: planData.planType
        }
      });

      return res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create retirement plan" });
    }
  });

  app.patch("/api/retirement-plans/:id", requireAuth, async (req: Request, res: Response) => {
    const planId = req.params.id;

    if (!planId) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    try {
      const planData = insertRetirementPlanSchema.partial().parse(req.body);
      const updatedPlan = await storage.updateRetirementPlan(planId, planData);

      if (!updatedPlan) {
        return res.status(404).json({ message: "Retirement plan not found" });
      }

      // Regenerate financial projections for the updated plan - MUST complete before responding
      try {
        console.log(`🚀 Regenerating projections for updated plan ${updatedPlan.id}...`);
        await generateRetirementPlan(updatedPlan);
        console.log(`✅ Successfully regenerated projections for plan ${updatedPlan.id}`);

        // Verify data was created
        const snapshots = await storage.getAnnualSnapshots(updatedPlan.id);
        console.log(`📊 Plan ${updatedPlan.id} updated with ${snapshots.length} snapshots`);

        if (snapshots.length === 0) {
          throw new Error("Plan regeneration completed but no data was created");
        }
      } catch (genError) {
        console.error(`❌ Failed to regenerate projections for plan ${updatedPlan.id}:`, genError);
        return res.status(500).json({
          message: "Failed to regenerate retirement plan data",
          error: genError instanceof Error ? genError.message : 'Unknown error'
        });
      }

      // Create an activity for this plan update
      await storage.createActivity({
        userId: updatedPlan.userId,
        activityType: "retirement_plan_updated",
        title: "Retirement Plan Updated",
        description: `Updated retirement plan: ${updatedPlan.planName}`,
        metadata: {
          planId: updatedPlan.id,
          planType: updatedPlan.planType
        }
      });

      return res.json(updatedPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update retirement plan" });
    }
  });

  app.delete("/api/retirement-plans/:id", requireAuth, async (req: Request, res: Response) => {
    const planId = req.params.id;

    if (!planId) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const success = await storage.deleteRetirementPlan(planId);

    if (!success) {
      return res.status(404).json({ message: "Retirement plan not found" });
    }

    return res.status(204).end();
  });

  // Regenerate retirement plan endpoint - for fixing plans with data gaps
  app.post("/api/retirement-plans/:id/regenerate", requireAuth, async (req: Request, res: Response) => {
    try {
      const planId = req.params.id;

      if (!planId) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      // Get the existing plan
      const plan = await storage.getRetirementPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Clear existing snapshots and account balances for this plan
      await storage.clearPlanData(planId);

      // Regenerate using the unified generator
      try {
        await generateRetirementPlan(plan);
      } catch (genError) {
        console.error(`❌ Failed to regenerate projections for plan ${plan.id}:`, genError);
        return res.status(500).json({
          message: "Failed to regenerate plan data",
          error: genError instanceof Error ? genError.message : 'Unknown error'
        });
      }

      return res.json({
        plan,
        message: "Plan data regenerated successfully with complete yearly data"
      });
    } catch (error) {
      console.error('Error regenerating retirement plan:', error);
      return res.status(500).json({
        message: "Failed to regenerate retirement plan",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate retirement plan endpoint - creates or updates primary plan
  app.post("/api/retirement-plans/generate", requireAuth, async (req: Request, res: Response) => {
    console.log(`🎯 ENDPOINT: /api/retirement-plans/generate called at ${new Date().toISOString()}`);
    try {
      const user = getCurrentUser(req);

      // Get user's current data to build the plan
      const userData = await storage.getUser(user.id);
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check for existing primary plan and delete it
      const existingPlans = await storage.getRetirementPlans(user.id);
      const existingPrimaryPlan = existingPlans.find(plan => plan.planType === 'P');

      if (existingPrimaryPlan) {
        await storage.deleteRetirementPlan(existingPrimaryPlan.id);
      }

      // Calculate total assets from form data (if provided) or use defaults
      const formData = req.body.formData || {};
      const calculateTotalAssets = () => {
        return (
          parseInt(formData.savingsBalance || '0') +
          parseInt(formData.checkingBalance || '0') +
          parseInt(formData.investmentBalance || '0') +
          parseInt(formData.retirementAccount401k || '0') +
          parseInt(formData.retirementAccountIRA || '0') +
          parseInt(formData.retirementAccountRoth || '0') +
          parseInt(formData.realEstateValue || '0') +
          parseInt(formData.otherAssetsValue || '0')
        );
      };

      // Create retirement plan from user data with proper validation
      const planData = {
        userId: user.id,
        planName: "Primary Retirement Plan",
        planType: "P" as const, // Primary plan
        startAge: Number(userData.currentAge) || 30,
        retirementAge: Number(userData.targetRetirementAge) || 65,
        endAge: 95, // Default life expectancy
        spouseStartAge: userData.hasSpouse && userData.spouseCurrentAge ? Number(userData.spouseCurrentAge) : null,
        spouseRetirementAge: userData.hasSpouse && userData.spouseTargetRetirementAge ? Number(userData.spouseTargetRetirementAge) : null,
        spouseEndAge: userData.hasSpouse ? 95 : null,
        socialSecurityStartAge: 67, // Default full retirement age
        spouseSocialSecurityStartAge: userData.hasSpouse ? 67 : null,
        estimatedSocialSecurityBenefit: "30000", // Default estimate
        spouseEstimatedSocialSecurityBenefit: userData.hasSpouse ? "25000" : "0",
        portfolioGrowthRate: "7.0", // Default growth rate
        inflationRate: "3.0", // Default inflation rate
        pensionIncome: "0", // Default - can be updated later
        spousePensionIncome: "0",
        otherRetirementIncome: "0",
        desiredAnnualRetirementSpending: formData.expectedAnnualExpenses || "80000",
        majorOneTimeExpenses: "0",
        majorExpensesDescription: null,
        bondGrowthRate: "4.0", // Default bond rate
        initialNetWorth: calculateTotalAssets().toString(),
        totalLifetimeTax: "0", // Will be calculated by generator
        isActive: true
      };

      // Validate the data before creating
      const validatedPlanData = insertRetirementPlanSchema.parse(planData);

      const plan = await storage.createRetirementPlan(validatedPlanData);

      // Generate financial projections for the new plan - MUST complete before responding
      try {
        console.log(`🚀 ROUTE: About to call generateRetirementPlan for plan ${plan.id}...`);
        await generateRetirementPlan(plan);
        console.log(`🚀 ROUTE: generateRetirementPlan call completed for plan ${plan.id}...`);
        console.log(`✅ Successfully completed generation for plan ${plan.id}`);

        // Verify data was created
        const snapshots = await storage.getAnnualSnapshots(plan.id);
        console.log(`📊 Plan ${plan.id} generated with ${snapshots.length} snapshots`);

        if (snapshots.length === 0) {
          throw new Error("Plan generation completed but no data was created");
        }
      } catch (genError) {
        console.error(`❌ Failed to generate projections for plan ${plan.id}:`, genError);
        // Delete the plan if generation failed
        await storage.deleteRetirementPlan(plan.id);
        return res.status(500).json({
          message: "Failed to generate retirement plan data",
          error: genError instanceof Error ? genError.message : 'Unknown error'
        });
      }

      // Create an activity for this plan generation
      await storage.createActivity({
        userId: user.id,
        activityType: existingPrimaryPlan ? "retirement_plan_updated" : "retirement_plan_created",
        title: existingPrimaryPlan ? "Retirement Plan Updated" : "Retirement Plan Generated",
        description: existingPrimaryPlan
          ? "Updated primary retirement plan with latest information"
          : "Generated new primary retirement plan",
        metadata: {
          planId: plan.id,
          planType: "P",
          replacedPlanId: existingPrimaryPlan?.id
        }
      });

      console.log(`🎯 CRITICAL: About to respond for plan ${plan.id} after generation completed`);

      return res.status(201).json({
        plan,
        message: existingPrimaryPlan ? "Retirement plan updated successfully" : "Retirement plan generated successfully"
      });
    } catch (error) {
      console.error('Error generating retirement plan:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid plan data",
          errors: error.errors,
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }

      return res.status(500).json({
        message: "Failed to generate retirement plan",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Milestones routes
  app.get("/api/milestones/standard", async (req: Request, res: Response) => {
    try {
      const apiUrl = process.env.API_URL || 'http://localhost:4001';
      const response = await fetch(`${apiUrl}/api/milestones/standard`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      const milestones = await response.json();
      return res.json(milestones);
    } catch (error) {
      console.error('Error fetching standard milestones:', error);
      return res.status(500).json({ message: 'Failed to fetch standard milestones' });
    }
  });

  app.post("/api/milestones", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = getCurrentUser(req);
      const milestoneData = insertMilestoneSchema.parse({
        ...req.body,
        userId: req.body.milestoneType === 'personal' ? user.id : undefined
      });

      const milestone = await storage.createMilestone(milestoneData);
      return res.status(201).json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid milestone data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  // Demo data seeding endpoint (development only)
  app.post("/api/seed-demo-data", async (req: Request, res: Response) => {
    try {
      // Create or find demo user
      let demoUser;
      try {
        demoUser = await storage.getUserByUsername("demo_user");
      } catch (e) {
        // User doesn't exist
      }

      if (!demoUser) {
        const hashedPassword = await bcrypt.hash("demo123", 10);

        demoUser = await storage.createUser({
          username: "demo_user",
          password: hashedPassword,
          firstName: "Demo",
          lastName: "User",
          email: "demo@example.com",
          currentAge: 30,
          targetRetirementAge: 65,
          currentLocation: "San Francisco, CA",
          maritalStatus: "single",
          dependents: 0,
          currentIncome: "85000",
          spouseExpectedIncomeGrowth: "3",
          desiredLifestyle: "comfortable",
          hasSpouse: false,
          totalMonthlyExpenses: "4500"
        });
      }

      // Check if plan exists
      const existingPlans = await storage.getRetirementPlans(demoUser.id);
      if (existingPlans.length > 0) {
        return res.json({
          message: "Demo data already exists",
          user: demoUser.username,
          plans: existingPlans.length
        });
      }

      // Create basic retirement plan
      const plan = await storage.createRetirementPlan({
        userId: demoUser.id,
        planName: "My Retirement Plan",
        planType: "comprehensive",
        startAge: 30,
        retirementAge: 65,
        endAge: 95,
        initialNetWorth: "250000",
        totalLifetimeTax: "750000",
        isActive: true
      });

      // Use the unified plan generator to create complete yearly data
      try {
        await generateRetirementPlan(plan);
      } catch (genError) {
        console.error(`❌ Failed to generate demo plan projections:`, genError);
        // Continue even if generation fails
      }

      const currentYear = new Date().getFullYear();
      const snapshots = await storage.getAnnualSnapshots(plan.id);

      /* Legacy manual snapshot creation - replaced by unified generator
      const currentYear = new Date().getFullYear();
      const snapshots = [];
      
      for (let age = 30; age <= 95; age += 5) {
        const year = currentYear + (age - 30);
        const isRetired = age >= 65;
        const netWorth = 250000 + (age - 30) * 25000;
        
        const snapshot = await storage.createAnnualSnapshot({
          planId: plan.id,
          year,
          age,
          grossIncome: isRetired ? "50000" : "85000",
          netIncome: isRetired ? "45000" : "65000", 
          totalExpenses: "45000",
          totalAssets: netWorth.toString(),
          totalLiabilities: age < 50 ? "150000" : "0",
          netWorth: (netWorth - (age < 50 ? 150000 : 0)).toString(),
          taxesPaid: isRetired ? "5000" : "20000",
          cumulativeTax: ((age - 30) * 15000).toString()
        });
        
        snapshots.push(snapshot);
        
        // Add basic account balances
        await storage.createAccountBalance({
          snapshotId: snapshot.id,
          accountType: "401k",
          accountName: "Company 401(k)",
          balance: (netWorth * 0.4).toString(),
          contribution: isRetired ? "0" : "15000",
          withdrawal: isRetired ? "25000" : "0",
          growth: (netWorth * 0.04).toString()
        });

        await storage.createAccountBalance({
          snapshotId: snapshot.id,
          accountType: "roth_ira",
          accountName: "Roth IRA", 
          balance: (netWorth * 0.3).toString(),
          contribution: isRetired ? "0" : "6000",
          withdrawal: "0",
          growth: (netWorth * 0.03).toString()
        });

        await storage.createAccountBalance({
          snapshotId: snapshot.id,
          accountType: "brokerage",
          accountName: "Taxable Brokerage",
          balance: (netWorth * 0.2).toString(),
          contribution: "5000",
          withdrawal: isRetired ? "10000" : "0",
          growth: (netWorth * 0.02).toString()
        });

        await storage.createAccountBalance({
          snapshotId: snapshot.id,
          accountType: "savings", 
          accountName: "Emergency Fund",
          balance: (netWorth * 0.1).toString(),
          contribution: "2000",
          withdrawal: "0",
          growth: (netWorth * 0.01).toString()
        });
      }
      */ // End legacy manual snapshot creation

      // Create sample milestones
      await storage.createMilestone({
        planId: plan.id,
        userId: demoUser.id,
        milestoneType: "personal",
        title: "Pay Off Mortgage",
        description: "Complete mortgage payments",
        targetYear: currentYear + 20,
        targetAge: 50,
        category: "housing",
        color: "#8b5cf6",
        icon: "home"
      });

      await storage.createMilestone({
        planId: null,
        userId: null,
        milestoneType: "standard",
        title: "Medicare Eligibility",
        description: "Eligible for Medicare benefits",
        targetYear: null,
        targetAge: 65,
        category: "healthcare",
        color: "#ef4444",
        icon: "shield"
      });

      return res.json({
        message: "Demo data created successfully!",
        user: demoUser.username,
        planId: plan.id,
        snapshots: snapshots.length
      });

    } catch (error) {
      console.error("Seeding error:", error);
      return res.status(500).json({
        message: "Failed to seed demo data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
