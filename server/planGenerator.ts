import type { RetirementPlan, InsertAnnualSnapshot, InsertAccountBalance, InsertMilestone } from "../shared/schema";
import { storage } from "./storage";

interface PlanGenerationOptions {
  generateSnapshots?: boolean;
  generateAccountBalances?: boolean;
  generateMilestones?: boolean;
}

interface FinancialProjection {
  year: number;
  age: number;
  grossIncome: number;
  netIncome: number;
  totalExpenses: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  taxesPaid: number;
  cumulativeTax: number;
  accounts: {
    type: string;
    name: string;
    balance: number;
    contribution: number;
    withdrawal: number;
    growth: number;
  }[];
}

export class RetirementPlanGenerator {
  private plan: RetirementPlan;
  private inflationRate: number;
  private portfolioGrowthRate: number;
  private bondGrowthRate: number;
  
  constructor(plan: RetirementPlan) {
    this.plan = plan;
    this.inflationRate = parseFloat(plan.inflationRate || "3.0") / 100;
    this.portfolioGrowthRate = parseFloat(plan.portfolioGrowthRate || "7.0") / 100;
    this.bondGrowthRate = parseFloat(plan.bondGrowthRate || "4.0") / 100;
  }

  async generateFullPlan(options: PlanGenerationOptions = { generateSnapshots: true, generateAccountBalances: true, generateMilestones: true }): Promise<void> {
    console.log(`🚀 Generating retirement plan data for plan ${this.plan.id}: ${this.plan.planName}`);
    
    // Generate financial projections for each year
    const projections = this.calculateFinancialProjections();
    
    if (options.generateSnapshots) {
      await this.createAnnualSnapshots(projections);
    }
    
    if (options.generateMilestones) {
      await this.createStandardMilestones();
    }
    
    // Update plan with calculated total lifetime tax
    const totalLifetimeTax = projections.reduce((sum, proj) => sum + proj.taxesPaid, 0);
    await storage.updateRetirementPlan(this.plan.id, {
      totalLifetimeTax: totalLifetimeTax.toFixed(2)
    });

    console.log(`✅ Generated ${projections.length} annual snapshots and milestones for plan ${this.plan.id}`);
  }

  private calculateFinancialProjections(): FinancialProjection[] {
    const projections: FinancialProjection[] = [];
    const currentYear = new Date().getFullYear();
    
    // Starting financial values
    let total401k = parseFloat(this.plan.initialNetWorth || "250000") * 0.4;
    let totalRothIRA = parseFloat(this.plan.initialNetWorth || "250000") * 0.3;
    let totalBrokerage = parseFloat(this.plan.initialNetWorth || "250000") * 0.2;
    let totalSavings = parseFloat(this.plan.initialNetWorth || "250000") * 0.1;
    let mortgageBalance = 400000; // Starting mortgage
    let cumulativeTax = 0;
    
    // Calculate for each year from start to end age
    for (let age = this.plan.startAge; age <= this.plan.endAge; age++) {
      const year = currentYear + (age - this.plan.startAge);
      const isRetired = age >= this.plan.retirementAge;
      const isWorkingAge = age < this.plan.retirementAge;
      
      // Income calculations
      let grossIncome = 0;
      let netIncome = 0;
      
      if (isWorkingAge) {
        // Working years - salary increases with inflation
        const yearsWorked = age - this.plan.startAge;
        grossIncome = 85000 * Math.pow(1 + this.inflationRate, yearsWorked);
        netIncome = grossIncome * 0.75; // Roughly 25% tax rate
      } else {
        // Retirement years - withdrawal from accounts
        const withdrawalRate = 0.04; // 4% rule
        const portfolioValue = total401k + totalRothIRA + totalBrokerage;
        grossIncome = portfolioValue * withdrawalRate;
        netIncome = grossIncome * 0.85; // Lower tax rate in retirement
      }
      
      // Expenses increase with inflation
      const yearsFromStart = age - this.plan.startAge;
      const totalExpenses = 45000 * Math.pow(1 + this.inflationRate, yearsFromStart);
      
      // Account contributions and growth
      let contribution401k = 0;
      let contributionRothIRA = 0;
      let contributionBrokerage = 0;
      let contributionSavings = 0;
      
      let withdrawal401k = 0;
      let withdrawalRothIRA = 0;
      let withdrawalBrokerage = 0;
      
      if (isWorkingAge) {
        // Contributions during working years
        contribution401k = Math.min(23000, grossIncome * 0.15); // 15% up to limit
        contributionRothIRA = age >= 50 ? 7500 : 6500; // Catch-up contributions
        contributionBrokerage = Math.max(0, (netIncome - totalExpenses - contribution401k - contributionRothIRA) * 0.7);
        contributionSavings = Math.max(0, (netIncome - totalExpenses - contribution401k - contributionRothIRA - contributionBrokerage));
      } else {
        // Withdrawals during retirement
        const totalWithdrawals = Math.max(totalExpenses - grossIncome, 0);
        withdrawal401k = totalWithdrawals * 0.4;
        withdrawalRothIRA = totalWithdrawals * 0.2;
        withdrawalBrokerage = totalWithdrawals * 0.4;
      }
      
      // Apply contributions and withdrawals
      total401k = (total401k + contribution401k - withdrawal401k) * (1 + this.portfolioGrowthRate);
      totalRothIRA = (totalRothIRA + contributionRothIRA - withdrawalRothIRA) * (1 + this.portfolioGrowthRate);
      totalBrokerage = (totalBrokerage + contributionBrokerage - withdrawalBrokerage) * (1 + this.portfolioGrowthRate);
      totalSavings = (totalSavings + contributionSavings) * (1 + this.bondGrowthRate);
      
      // Mortgage paydown (30-year from age 30)
      if (age < 60) {
        const annualPayment = 28000; // Roughly $2,333/month
        mortgageBalance = Math.max(0, mortgageBalance * 1.05 - annualPayment); // 5% interest
      }
      
      // Tax calculations
      const taxesPaid = isWorkingAge ? grossIncome * 0.25 : grossIncome * 0.15;
      cumulativeTax += taxesPaid;
      
      const totalAssets = total401k + totalRothIRA + totalBrokerage + totalSavings;
      const totalLiabilities = mortgageBalance;
      const netWorth = totalAssets - totalLiabilities;
      
      projections.push({
        year,
        age,
        grossIncome,
        netIncome,
        totalExpenses,
        totalAssets,
        totalLiabilities,
        netWorth,
        taxesPaid,
        cumulativeTax,
        accounts: [
          {
            type: "401k",
            name: "Company 401(k)",
            balance: total401k,
            contribution: contribution401k,
            withdrawal: withdrawal401k,
            growth: total401k * this.portfolioGrowthRate
          },
          {
            type: "roth_ira",
            name: "Roth IRA",
            balance: totalRothIRA,
            contribution: contributionRothIRA,
            withdrawal: withdrawalRothIRA,
            growth: totalRothIRA * this.portfolioGrowthRate
          },
          {
            type: "brokerage",
            name: "Taxable Brokerage",
            balance: totalBrokerage,
            contribution: contributionBrokerage,
            withdrawal: withdrawalBrokerage,
            growth: totalBrokerage * this.portfolioGrowthRate
          },
          {
            type: "savings",
            name: "Savings Account",
            balance: totalSavings,
            contribution: contributionSavings,
            withdrawal: 0,
            growth: totalSavings * this.bondGrowthRate
          }
        ]
      });
    }
    
    return projections;
  }

  private async createAnnualSnapshots(projections: FinancialProjection[]): Promise<void> {
    // Create snapshots every 5 years to match existing pattern
    for (let i = 0; i < projections.length; i += 5) {
      const projection = projections[i];
      
      const snapshot = await storage.createAnnualSnapshot({
        planId: this.plan.id,
        year: projection.year,
        age: projection.age,
        grossIncome: projection.grossIncome.toFixed(2),
        netIncome: projection.netIncome.toFixed(2),
        totalExpenses: projection.totalExpenses.toFixed(2),
        totalAssets: projection.totalAssets.toFixed(2),
        totalLiabilities: projection.totalLiabilities.toFixed(2),
        netWorth: projection.netWorth.toFixed(2),
        taxesPaid: projection.taxesPaid.toFixed(2),
        cumulativeTax: projection.cumulativeTax.toFixed(2)
      });
      
      // Create account balances for this snapshot
      for (const account of projection.accounts) {
        await storage.createAccountBalance({
          snapshotId: snapshot.id,
          accountType: account.type,
          accountName: account.name,
          balance: account.balance.toFixed(2),
          contribution: account.contribution.toFixed(2),
          withdrawal: account.withdrawal.toFixed(2),
          growth: account.growth.toFixed(2)
        });
      }
    }
  }

  private async createStandardMilestones(): Promise<void> {
    const currentYear = new Date().getFullYear();
    
    // Create key retirement milestones
    const milestonesToCreate: InsertMilestone[] = [
      {
        planId: this.plan.id,
        userId: this.plan.userId,
        milestoneType: "personal",
        title: "Retirement Begins",
        description: "Start of retirement phase",
        targetYear: currentYear + (this.plan.retirementAge - this.plan.startAge),
        targetAge: this.plan.retirementAge,
        category: "retirement",
        color: "#10b981",
        icon: "calendar"
      },
      {
        planId: this.plan.id,
        userId: this.plan.userId,
        milestoneType: "personal",
        title: "Medicare Eligibility",
        description: "Eligible for Medicare benefits",
        targetYear: currentYear + (65 - this.plan.startAge),
        targetAge: 65,
        category: "healthcare",
        color: "#ef4444",
        icon: "shield"
      },
      {
        planId: this.plan.id,
        userId: this.plan.userId,
        milestoneType: "personal",
        title: "Social Security Eligibility",
        description: "Eligible for Social Security benefits",
        targetYear: currentYear + (62 - this.plan.startAge),
        targetAge: 62,
        category: "retirement",
        color: "#3b82f6",
        icon: "dollar-sign"
      }
    ];
    
    // Only create milestones that fall within the plan timeline
    for (const milestone of milestonesToCreate) {
      if (milestone.targetAge && milestone.targetAge >= this.plan.startAge && milestone.targetAge <= this.plan.endAge) {
        await storage.createMilestone(milestone);
      }
    }
  }
}

export async function generateRetirementPlan(plan: RetirementPlan, options?: PlanGenerationOptions): Promise<void> {
  const generator = new RetirementPlanGenerator(plan);
  await generator.generateFullPlan(options);
}