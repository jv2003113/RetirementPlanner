import { 
  users, type User, type InsertUser,
  retirementGoals, type RetirementGoal, type InsertRetirementGoal,
  investmentAccounts, type InvestmentAccount, type InsertInvestmentAccount,
  assetAllocations, type AssetAllocation, type InsertAssetAllocation,
  securityHoldings, type SecurityHolding, type InsertSecurityHolding,
  retirementExpenses, type RetirementExpense, type InsertRetirementExpense,
  activities, type Activity, type InsertActivity,
  type Recommendation, type Resource
} from "@shared/schema";

// Define the storage interface
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private retirementGoals: Map<number, RetirementGoal>;
  private investmentAccounts: Map<number, InvestmentAccount>;
  private assetAllocations: Map<number, AssetAllocation>;
  private securityHoldings: Map<number, SecurityHolding>;
  private retirementExpenses: Map<number, RetirementExpense>;
  private activities: Map<number, Activity>;
  private recommendations: Map<string, Recommendation>;
  private resources: Map<string, Resource>;

  private userId: number;
  private goalId: number;
  private accountId: number;
  private allocationId: number;
  private holdingId: number;
  private expenseId: number;
  private activityId: number;

  constructor() {
    this.users = new Map();
    this.retirementGoals = new Map();
    this.investmentAccounts = new Map();
    this.assetAllocations = new Map();
    this.retirementExpenses = new Map();
    this.activities = new Map();
    this.recommendations = new Map();
    this.resources = new Map();

    this.userId = 1;
    this.goalId = 1;
    this.accountId = 1;
    this.allocationId = 1;
    this.expenseId = 1;
    this.activityId = 1;

    // Create a default user for demo purposes
    this.createUser({
      username: "john.doe",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      currentAge: 40,
      targetRetirementAge: 67,
      currentLocation: "New York",
      maritalStatus: "married",
      dependents: 2,
      currentIncome: 120000,
      expectedFutureIncome: 150000,
      desiredLifestyle: "comfortable"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const currentDate = new Date();
    const user: User = { 
      ...userData, 
      id,
      createdAt: currentDate
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Retirement goals operations
  async getRetirementGoals(userId: number): Promise<RetirementGoal[]> {
    return Array.from(this.retirementGoals.values()).filter(goal => goal.userId === userId);
  }

  async getRetirementGoal(id: number): Promise<RetirementGoal | undefined> {
    return this.retirementGoals.get(id);
  }

  async createRetirementGoal(goalData: InsertRetirementGoal): Promise<RetirementGoal> {
    const id = this.goalId++;
    const currentDate = new Date();
    const goal: RetirementGoal = { 
      ...goalData, 
      id,
      createdAt: currentDate
    };
    this.retirementGoals.set(id, goal);
    return goal;
  }

  async updateRetirementGoal(id: number, goalData: Partial<InsertRetirementGoal>): Promise<RetirementGoal | undefined> {
    const goal = this.retirementGoals.get(id);
    if (!goal) return undefined;

    const updatedGoal: RetirementGoal = { ...goal, ...goalData };
    this.retirementGoals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteRetirementGoal(id: number): Promise<boolean> {
    return this.retirementGoals.delete(id);
  }

  // Investment accounts operations
  async getInvestmentAccounts(userId: number): Promise<InvestmentAccount[]> {
    return Array.from(this.investmentAccounts.values()).filter(account => account.userId === userId);
  }

  async getInvestmentAccount(id: number): Promise<InvestmentAccount | undefined> {
    return this.investmentAccounts.get(id);
  }

  async createInvestmentAccount(accountData: InsertInvestmentAccount): Promise<InvestmentAccount> {
    const id = this.accountId++;
    const currentDate = new Date();
    const account: InvestmentAccount = { 
      ...accountData, 
      id,
      createdAt: currentDate,
      updatedAt: currentDate
    };
    this.investmentAccounts.set(id, account);
    return account;
  }

  async updateInvestmentAccount(id: number, accountData: Partial<InsertInvestmentAccount>): Promise<InvestmentAccount | undefined> {
    const account = this.investmentAccounts.get(id);
    if (!account) return undefined;

    const updatedAccount: InvestmentAccount = { 
      ...account, 
      ...accountData,
      updatedAt: new Date()
    };
    this.investmentAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteInvestmentAccount(id: number): Promise<boolean> {
    return this.investmentAccounts.delete(id);
  }

  // Asset allocations operations
  async getAssetAllocations(accountId: number): Promise<AssetAllocation[]> {
    return Array.from(this.assetAllocations.values())
      .filter(allocation => allocation.accountId === accountId);
  }

  async createAssetAllocation(allocationData: InsertAssetAllocation): Promise<AssetAllocation> {
    const id = this.allocationId++;
    const currentDate = new Date();
    const allocation: AssetAllocation = { 
      ...allocationData, 
      id,
      createdAt: currentDate,
      updatedAt: currentDate
    };
    this.assetAllocations.set(id, allocation);
    return allocation;
  }

  async updateAssetAllocation(id: number, allocationData: Partial<InsertAssetAllocation>): Promise<AssetAllocation | undefined> {
    const allocation = this.assetAllocations.get(id);
    if (!allocation) return undefined;

    const updatedAllocation: AssetAllocation = { 
      ...allocation, 
      ...allocationData,
      updatedAt: new Date()
    };
    this.assetAllocations.set(id, updatedAllocation);
    return updatedAllocation;
  }

  async deleteAssetAllocation(id: number): Promise<boolean> {
    return this.assetAllocations.delete(id);
  }

  // Retirement expenses operations
  async getRetirementExpenses(userId: number): Promise<RetirementExpense[]> {
    return Array.from(this.retirementExpenses.values())
      .filter(expense => expense.userId === userId);
  }

  async createRetirementExpense(expenseData: InsertRetirementExpense): Promise<RetirementExpense> {
    const id = this.expenseId++;
    const currentDate = new Date();
    const expense: RetirementExpense = { 
      ...expenseData, 
      id,
      createdAt: currentDate
    };
    this.retirementExpenses.set(id, expense);
    return expense;
  }

  async updateRetirementExpense(id: number, expenseData: Partial<InsertRetirementExpense>): Promise<RetirementExpense | undefined> {
    const expense = this.retirementExpenses.get(id);
    if (!expense) return undefined;

    const updatedExpense: RetirementExpense = { ...expense, ...expenseData };
    this.retirementExpenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteRetirementExpense(id: number): Promise<boolean> {
    return this.retirementExpenses.delete(id);
  }

  // Activities operations
  async getActivities(userId: number, limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const activity: Activity = { 
      ...activityData, 
      id,
      title: activityData.title || this.formatActivityTitle(activityData.activityType)
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  private formatActivityTitle(activityType: string): string {
    return activityType.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Initialize with sample data for demo
  // Recommendations operations
  async getRecommendations(userId: number): Promise<Recommendation[]> {
    // Currently returning static recommendations based on user profile
    // In a real app, this would generate personalized recommendations based on user data
    return [
      {
        id: "rec-1",
        title: "Increase 401(k) contributions",
        description: "Consider increasing your 401(k) contributions to maximize your employer match and tax benefits.",
        impact: "high",
        actionText: "Adjust contributions",
        actionLink: "/portfolio"
      },
      {
        id: "rec-2",
        title: "Diversify your portfolio",
        description: "Your portfolio has a high concentration in stocks. Consider diversifying to reduce risk.",
        impact: "medium",
        actionText: "View allocation strategies",
        actionLink: "/portfolio"
      },
      {
        id: "rec-3",
        title: "Check healthcare coverage",
        description: "Medicare may not cover all your healthcare needs in retirement. Consider supplemental insurance.",
        impact: "high",
        actionText: "Explore healthcare options",
        actionLink: "/healthcare"
      },
      {
        id: "rec-4",
        title: "Create an estate plan",
        description: "Ensure your assets are distributed according to your wishes and minimize taxes.",
        impact: "medium",
        actionText: "Start estate planning",
        actionLink: "/estate-planning"
      },
      {
        id: "rec-5",
        title: "Set up automatic savings",
        description: "Automate your contributions to retirement accounts to stay consistent.",
        impact: "info",
        actionText: "Learn more",
        actionLink: "/portfolio"
      }
    ];
  }
  
  // Resources operations
  async getResources(): Promise<Resource[]> {
    // Static resources that are the same for all users
    return [
      {
        id: "res-1",
        title: "Retirement Tax Strategies",
        description: "Learn strategies to minimize taxes in retirement and maximize your income.",
        icon: "book",
        buttonText: "Read guide",
        buttonLink: "/tax-planning",
        color: "#4CAF50"
      },
      {
        id: "res-2",
        title: "Healthcare in Retirement",
        description: "Understand Medicare coverage and plan for healthcare expenses in retirement.",
        icon: "healthcare",
        buttonText: "Learn more",
        buttonLink: "/healthcare",
        color: "#2196F3"
      },
      {
        id: "res-3",
        title: "Estate Planning Basics",
        description: "Protect your assets and provide for your loved ones with proper estate planning.",
        icon: "estate",
        buttonText: "Get started",
        buttonLink: "/estate-planning",
        color: "#9C27B0"
      }
    ];
  }
  
  async initializeDemoData(userId: number) {
    // Create retirement goals
    await this.createRetirementGoal({
      userId,
      targetMonthlyIncome: 6000,
      description: "Monthly income during retirement",
      category: "income",
      priority: 1,
    });

    await this.createRetirementGoal({
      userId,
      description: "Travel to Europe",
      category: "travel",
      priority: 2,
    });

    // Create investment accounts
    const account401k = await this.createInvestmentAccount({
      userId,
      accountName: "401(k)",
      accountType: "401k",
      balance: 300000,
      contributionAmount: 1000,
      contributionFrequency: "monthly",
      annualReturn: 7,
      fees: 0.05,
      isRetirementAccount: true,
    });

    const accountIRA = await this.createInvestmentAccount({
      userId,
      accountName: "Roth IRA",
      accountType: "roth_ira",
      balance: 150000,
      contributionAmount: 500,
      contributionFrequency: "monthly",
      annualReturn: 6.5,
      fees: 0.03,
      isRetirementAccount: true,
    });

    const accountBrokerage = await this.createInvestmentAccount({
      userId,
      accountName: "Brokerage Account",
      accountType: "brokerage",
      balance: 200000,
      contributionAmount: 1000,
      contributionFrequency: "monthly",
      annualReturn: 8,
      fees: 0.1,
      isRetirementAccount: false,
    });

    const accountRealEstate = await this.createInvestmentAccount({
      userId,
      accountName: "Real Estate Investments",
      accountType: "real_estate",
      balance: 150000,
      contributionAmount: 0,
      contributionFrequency: "none",
      annualReturn: 5,
      fees: 1,
      isRetirementAccount: false,
    });

    // Create asset allocations for 401k
    await this.createAssetAllocation({
      accountId: account401k.id,
      assetCategory: "stocks",
      percentage: 70,
      value: 210000,
    });

    await this.createAssetAllocation({
      accountId: account401k.id,
      assetCategory: "bonds",
      percentage: 25,
      value: 75000,
    });

    await this.createAssetAllocation({
      accountId: account401k.id,
      assetCategory: "cash",
      percentage: 5,
      value: 15000,
    });

    // Create asset allocations for IRA
    await this.createAssetAllocation({
      accountId: accountIRA.id,
      assetCategory: "stocks",
      percentage: 80,
      value: 120000,
    });

    await this.createAssetAllocation({
      accountId: accountIRA.id,
      assetCategory: "bonds",
      percentage: 15,
      value: 22500,
    });

    await this.createAssetAllocation({
      accountId: accountIRA.id,
      assetCategory: "cash",
      percentage: 5,
      value: 7500,
    });

    // Create asset allocations for brokerage
    await this.createAssetAllocation({
      accountId: accountBrokerage.id,
      assetCategory: "stocks",
      percentage: 60,
      value: 120000,
    });

    await this.createAssetAllocation({
      accountId: accountBrokerage.id,
      assetCategory: "bonds",
      percentage: 20,
      value: 40000,
    });

    await this.createAssetAllocation({
      accountId: accountBrokerage.id,
      assetCategory: "cash",
      percentage: 20,
      value: 40000,
    });

    // Create asset allocations for real estate
    await this.createAssetAllocation({
      accountId: accountRealEstate.id,
      assetCategory: "real_estate",
      percentage: 100,
      value: 150000,
    });

    // Create retirement expenses
    await this.createRetirementExpense({
      userId,
      category: "housing",
      estimatedMonthlyAmount: 2000,
      isEssential: true,
      notes: "Mortgage will be paid off by retirement"
    });

    await this.createRetirementExpense({
      userId,
      category: "healthcare",
      estimatedMonthlyAmount: 800,
      isEssential: true,
      notes: "Includes Medicare premiums and supplemental insurance"
    });

    await this.createRetirementExpense({
      userId,
      category: "food",
      estimatedMonthlyAmount: 600,
      isEssential: true,
      notes: "Groceries and dining out"
    });

    await this.createRetirementExpense({
      userId,
      category: "transportation",
      estimatedMonthlyAmount: 400,
      isEssential: true,
      notes: "Car maintenance, gas, insurance"
    });

    await this.createRetirementExpense({
      userId,
      category: "travel",
      estimatedMonthlyAmount: 1000,
      isEssential: false,
      notes: "Budget for vacations and trips"
    });

    // Create activities
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    await this.createActivity({
      userId,
      activityType: "profile_setup",
      title: "Profile Setup",
      description: "Set up retirement goals",
      date: threeMonthsAgo,
      metadata: { targetRetirementAge: 67, targetMonthlyIncome: 6000 }
    });

    await this.createActivity({
      userId,
      activityType: "assessment",
      title: "Retirement Assessment",
      description: "Completed retirement assessment",
      date: twoMonthsAgo,
      metadata: { oldScore: 72, newScore: 78 }
    });

    await this.createActivity({
      userId,
      activityType: "contribution_update",
      title: "Contribution Update",
      description: "Updated 401(k) contribution rate",
      date: twoWeeksAgo,
      metadata: { oldRate: 12, newRate: 15 }
    });
    
    await this.createActivity({
      userId,
      activityType: "goal",
      title: "Retirement Goal Added",
      description: "Added a new retirement goal for travel to Europe",
      date: oneMonthAgo,
      metadata: { category: "travel", priority: 2 }
    });
  }
}

// Initialize storage
export const storage = new MemStorage();

// Add demo data for the default user
storage.initializeDemoData(1);
