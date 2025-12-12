import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, varchar, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { uuidv7 } from "uuidv7";

// Define additional schemas for non-persistent data structures
export const recommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  impact: z.enum(["high", "medium", "info"]),
  actionText: z.string(),
  actionLink: z.string()
});

export const resourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.enum(["book", "healthcare", "estate"]),
  buttonText: z.string(),
  buttonLink: z.string(),
  color: z.string()
});

export type Recommendation = z.infer<typeof recommendationSchema>;
export type Resource = z.infer<typeof resourceSchema>;

// User profile schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  currentAge: integer("current_age"),
  targetRetirementAge: integer("target_retirement_age"),
  currentLocation: text("current_location"),
  maritalStatus: text("marital_status"),
  dependents: integer("dependents"),
  currentIncome: decimal("current_income", { precision: 10, scale: 2 }),
  desiredLifestyle: text("desired_lifestyle"), // frugal, comfortable, luxurious
  // Spouse information
  hasSpouse: boolean("has_spouse").default(false),
  spouseFirstName: text("spouse_first_name"),
  spouseLastName: text("spouse_last_name"),
  spouseCurrentAge: integer("spouse_current_age"),
  spouseTargetRetirementAge: integer("spouse_target_retirement_age"),
  spouseCurrentIncome: decimal("spouse_current_income", { precision: 10, scale: 2 }),
  // Additional Income Sources
  otherIncomeSource1: text("other_income_source_1"),
  otherIncomeAmount1: decimal("other_income_amount_1", { precision: 10, scale: 2 }),
  otherIncomeSource2: text("other_income_source_2"),
  otherIncomeAmount2: decimal("other_income_amount_2", { precision: 10, scale: 2 }),
  expectedIncomeGrowth: decimal("expected_income_growth", { precision: 5, scale: 2 }),
  spouseExpectedIncomeGrowth: decimal("spouse_expected_income_growth", { precision: 5, scale: 2 }),
  // Current Expenses (stored as JSON array)
  expenses: jsonb("expenses"),
  totalMonthlyExpenses: decimal("total_monthly_expenses", { precision: 10, scale: 2 }),
  // Current Assets
  savingsBalance: decimal("savings_balance", { precision: 12, scale: 2 }),
  checkingBalance: decimal("checking_balance", { precision: 12, scale: 2 }),
  investmentBalance: decimal("investment_balance", { precision: 12, scale: 2 }),
  retirementAccount401k: decimal("retirement_account_401k", { precision: 12, scale: 2 }),
  retirementAccountIRA: decimal("retirement_account_ira", { precision: 12, scale: 2 }),
  retirementAccountRoth: decimal("retirement_account_roth", { precision: 12, scale: 2 }),
  realEstateValue: decimal("real_estate_value", { precision: 12, scale: 2 }),
  otherAssetsValue: decimal("other_assets_value", { precision: 12, scale: 2 }),
  // Liabilities
  mortgageBalance: decimal("mortgage_balance", { precision: 12, scale: 2 }),
  mortgagePayment: decimal("mortgage_payment", { precision: 10, scale: 2 }),
  mortgageRate: decimal("mortgage_rate", { precision: 5, scale: 2 }),
  mortgageYearsLeft: integer("mortgage_years_left"),
  creditCardDebt: decimal("credit_card_debt", { precision: 12, scale: 2 }),
  studentLoanDebt: decimal("student_loan_debt", { precision: 12, scale: 2 }),
  otherDebt: decimal("other_debt", { precision: 12, scale: 2 }),
  totalMonthlyDebtPayments: decimal("total_monthly_debt_payments", { precision: 10, scale: 2 }),
  // Retirement Goals

  // Risk Assessment
  investmentExperience: text("investment_experience"),
  riskTolerance: text("risk_tolerance"),
  investmentTimeline: text("investment_timeline"),
  preferredInvestmentTypes: jsonb("preferred_investment_types"),
  marketVolatilityComfort: text("market_volatility_comfort"),
  investmentRebalancingPreference: text("investment_rebalancing_preference"),
  createdAt: timestamp("created_at").defaultNow(),
});



// Investment accounts schema
export const investmentAccounts = pgTable("investment_accounts", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  userId: uuid("user_id").references(() => users.id).notNull(),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(), // 401k, IRA, brokerage, etc.
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  contributionAmount: decimal("contribution_amount", { precision: 10, scale: 2 }),
  contributionFrequency: text("contribution_frequency"), // monthly, bi-weekly, etc.
  annualReturn: decimal("annual_return", { precision: 5, scale: 2 }),
  fees: decimal("fees", { precision: 5, scale: 2 }),
  isRetirementAccount: boolean("is_retirement_account").default(true),
  accountOwner: text("account_owner").default("primary"), // primary, spouse, joint
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Asset allocations schema
export const assetAllocations = pgTable("asset_allocations", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  accountId: uuid("account_id").references(() => investmentAccounts.id).notNull(),
  assetCategory: text("asset_category").notNull(), // stocks, bonds, real estate, cash
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Activities schema
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  userId: uuid("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(),
  title: text("title"),
  description: text("description").notNull(),
  date: timestamp("date", { mode: "date" }).defaultNow(),
  metadata: jsonb("metadata"),
});


// Define insert schemas

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  // Coerce decimal fields to strings to handle both number and string inputs
  expectedIncomeGrowth: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  mortgageRate: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  currentIncome: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  spouseCurrentIncome: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  spouseExpectedIncomeGrowth: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  otherIncomeAmount1: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  otherIncomeAmount2: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  totalMonthlyExpenses: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  savingsBalance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  checkingBalance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  investmentBalance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  retirementAccount401k: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  retirementAccountIRA: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  retirementAccountRoth: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  realEstateValue: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  otherAssetsValue: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  mortgageBalance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  mortgagePayment: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  creditCardDebt: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  studentLoanDebt: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  otherDebt: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  totalMonthlyDebtPayments: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),

  // Coerce integer fields to numbers to handle string inputs
  currentAge: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val).optional(),
  targetRetirementAge: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val).optional(),
  dependents: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val).optional(),
  spouseCurrentAge: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val).optional(),
  spouseTargetRetirementAge: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val).optional(),
  mortgageYearsLeft: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val).optional(),
});



export const insertInvestmentAccountSchema = createInsertSchema(investmentAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetAllocationSchema = createInsertSchema(assetAllocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

// Define types

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;



export type InvestmentAccount = typeof investmentAccounts.$inferSelect;
export type InsertInvestmentAccount = z.infer<typeof insertInvestmentAccountSchema>;

export type AssetAllocation = typeof assetAllocations.$inferSelect;
export type InsertAssetAllocation = z.infer<typeof insertAssetAllocationSchema>;

// Add new schema for security holdings
export const securityHoldings = pgTable("security_holdings", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  accountId: uuid("account_id").references(() => investmentAccounts.id, { onDelete: "cascade" }).notNull(),
  ticker: text("ticker").notNull(),
  name: text("name"),
  percentage: text("percentage").notNull(), // Stored as string for precision
  assetClass: text("asset_class"),
  region: text("region"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSecurityHoldingSchema = createInsertSchema(securityHoldings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SecurityHolding = typeof securityHoldings.$inferSelect;
export type InsertSecurityHolding = z.infer<typeof insertSecurityHoldingSchema>;



export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Roth conversion plans schema
export const rothConversionPlans = pgTable("roth_conversion_plans", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  userId: uuid("user_id").references(() => users.id).notNull(),
  planName: text("plan_name").notNull(),
  currentAge: integer("current_age").notNull(),
  retirementAge: integer("retirement_age").notNull(),
  traditionalIraBalance: decimal("traditional_ira_balance", { precision: 12, scale: 2 }).notNull(),
  currentTaxRate: decimal("current_tax_rate", { precision: 5, scale: 2 }).notNull(),
  expectedRetirementTaxRate: decimal("expected_retirement_tax_rate", { precision: 5, scale: 2 }).notNull(),
  annualIncome: decimal("annual_income", { precision: 10, scale: 2 }).notNull(),
  conversionAmount: decimal("conversion_amount", { precision: 12, scale: 2 }).notNull(),
  yearsToConvert: integer("years_to_convert").notNull(),
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Roth conversion scenarios schema (for storing calculated scenarios)
export const rothConversionScenarios = pgTable("roth_conversion_scenarios", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  planId: uuid("plan_id").references(() => rothConversionPlans.id, { onDelete: "cascade" }).notNull(),
  year: integer("year").notNull(),
  age: integer("age").notNull(),
  conversionAmount: decimal("conversion_amount", { precision: 12, scale: 2 }).notNull(),
  taxCost: decimal("tax_cost", { precision: 12, scale: 2 }).notNull(),
  traditionalBalance: decimal("traditional_balance", { precision: 12, scale: 2 }).notNull(),
  rothBalance: decimal("roth_balance", { precision: 12, scale: 2 }).notNull(),
  totalTaxPaid: decimal("total_tax_paid", { precision: 12, scale: 2 }).notNull(),
  netWorth: decimal("net_worth", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define insert schemas for Roth conversion plans
export const insertRothConversionPlanSchema = createInsertSchema(rothConversionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRothConversionScenarioSchema = createInsertSchema(rothConversionScenarios).omit({
  id: true,
  createdAt: true,
});

// Define types for Roth conversion plans
export type RothConversionPlan = typeof rothConversionPlans.$inferSelect;
export type InsertRothConversionPlan = z.infer<typeof insertRothConversionPlanSchema>;

export type RothConversionScenario = typeof rothConversionScenarios.$inferSelect;
export type InsertRothConversionScenario = z.infer<typeof insertRothConversionScenarioSchema>;

// Multi-step form progress tracking schema
export const multiStepFormProgress = pgTable("multi_step_form_progress", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  userId: uuid("user_id").references(() => users.id).notNull(),
  currentStep: integer("current_step").default(1).notNull(),
  completedSteps: jsonb("completed_steps").default([]).notNull(), // Array of completed step numbers
  formData: jsonb("form_data").default({}).notNull(), // Temporary storage for incomplete form data
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
});

export const insertMultiStepFormProgressSchema = createInsertSchema(multiStepFormProgress).omit({
  id: true,
  lastUpdated: true,
});

export type MultiStepFormProgress = typeof multiStepFormProgress.$inferSelect;
export type InsertMultiStepFormProgress = z.infer<typeof insertMultiStepFormProgressSchema>;

// Retirement plan schema
export const retirementPlans = pgTable("retirement_plans", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  userId: uuid("user_id").references(() => users.id).notNull(),
  planName: text("plan_name").notNull(),
  planType: text("plan_type").default("comprehensive"), // comprehensive, roth_conversion, etc.

  // Age & Timeline Parameters
  startAge: integer("start_age").notNull(),
  retirementAge: integer("retirement_age").notNull(),
  endAge: integer("end_age").default(95).notNull(), // Life expectancy
  spouseStartAge: integer("spouse_start_age"), // For married couples
  spouseRetirementAge: integer("spouse_retirement_age"),
  spouseEndAge: integer("spouse_end_age"), // Spouse life expectancy

  // Social Security Parameters
  socialSecurityStartAge: integer("social_security_start_age").default(67), // When to start SS
  spouseSocialSecurityStartAge: integer("spouse_social_security_start_age"), // Spouse SS start age
  estimatedSocialSecurityBenefit: decimal("estimated_social_security_benefit", { precision: 10, scale: 2 }).default("0"), // Annual SS benefit
  spouseEstimatedSocialSecurityBenefit: decimal("spouse_estimated_social_security_benefit", { precision: 10, scale: 2 }).default("0"), // Spouse annual SS benefit

  // Economic Assumptions
  portfolioGrowthRate: decimal("portfolio_growth_rate", { precision: 5, scale: 2 }).default("7.0"), // Expected annual portfolio growth %
  inflationRate: decimal("inflation_rate", { precision: 5, scale: 2 }).default("3.0"), // Annual inflation rate %

  // Retirement Income Sources
  pensionIncome: decimal("pension_income", { precision: 10, scale: 2 }).default("0"), // Annual pension income
  spousePensionIncome: decimal("spouse_pension_income", { precision: 10, scale: 2 }).default("0"), // Spouse annual pension
  otherRetirementIncome: decimal("other_retirement_income", { precision: 10, scale: 2 }).default("0"), // Other annual income (rental, part-time, etc.)

  // Retirement Spending
  desiredAnnualRetirementSpending: decimal("desired_annual_retirement_spending", { precision: 10, scale: 2 }).default("80000").notNull(), // Target annual spending
  majorOneTimeExpenses: decimal("major_one_time_expenses", { precision: 12, scale: 2 }).default("0"), // One-time expenses (home, trips, etc.)
  majorExpensesDescription: text("major_expenses_description"), // Description of major expenses

  // Legacy fields (for backwards compatibility)
  bondGrowthRate: decimal("bond_growth_rate", { precision: 5, scale: 2 }).default("4.0"), // Keep for existing data
  initialNetWorth: decimal("initial_net_worth", { precision: 12, scale: 2 }).default("0"), // Keep for existing data
  totalLifetimeTax: decimal("total_lifetime_tax", { precision: 12, scale: 2 }).default("0"), // Keep for existing data

  // Plan metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Annual financial snapshot schema - stores the financial picture for each year of the plan
export const annualSnapshots = pgTable("annual_snapshots", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  planId: uuid("plan_id").references(() => retirementPlans.id, { onDelete: "cascade" }).notNull(),
  year: integer("year").notNull(),
  age: integer("age").notNull(),
  grossIncome: decimal("gross_income", { precision: 12, scale: 2 }).default("0"),
  netIncome: decimal("net_income", { precision: 12, scale: 2 }).default("0"),
  totalExpenses: decimal("total_expenses", { precision: 12, scale: 2 }).default("0"),
  totalAssets: decimal("total_assets", { precision: 12, scale: 2 }).notNull(),
  totalLiabilities: decimal("total_liabilities", { precision: 12, scale: 2 }).default("0"),
  netWorth: decimal("net_worth", { precision: 12, scale: 2 }).notNull(),
  taxesPaid: decimal("taxes_paid", { precision: 12, scale: 2 }).default("0"),
  cumulativeTax: decimal("cumulative_tax", { precision: 12, scale: 2 }).default("0"),
  incomeBreakdown: jsonb("income_breakdown"),
  expenseBreakdown: jsonb("expense_breakdown"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Annual Snapshot Child Tables

export const annualSnapshotsAssets = pgTable("annual_snapshots_assets", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  snapshotId: uuid("snapshot_id").references(() => annualSnapshots.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 401k, savings, brokerage, etc.
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  growth: decimal("growth", { precision: 10, scale: 2 }).default("0"),
  contribution: decimal("contribution", { precision: 10, scale: 2 }).default("0"),
  withdrawal: decimal("withdrawal", { precision: 10, scale: 2 }).default("0"),
});

export const annualSnapshotsLiabilities = pgTable("annual_snapshots_liabilities", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  snapshotId: uuid("snapshot_id").references(() => annualSnapshots.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // mortgage, credit_card, etc.
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  payment: decimal("payment", { precision: 10, scale: 2 }).default("0"),
});

export const annualSnapshotsIncome = pgTable("annual_snapshots_income", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  snapshotId: uuid("snapshot_id").references(() => annualSnapshots.id, { onDelete: "cascade" }).notNull(),
  source: text("source").notNull(), // salary, social_security, pension, etc.
  amount: decimal("amount", { precision: 12, scale: 2 }).default("0").notNull(),
});

export const annualSnapshotsExpenses = pgTable("annual_snapshots_expenses", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  snapshotId: uuid("snapshot_id").references(() => annualSnapshots.id, { onDelete: "cascade" }).notNull(),
  category: text("category").notNull(), // living, housing, taxes, etc.
  amount: decimal("amount", { precision: 12, scale: 2 }).default("0").notNull(),
});

// Milestones schema - both personal and standard milestones
export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  planId: uuid("plan_id").references(() => retirementPlans.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id), // null for standard milestones
  milestoneType: text("milestone_type").notNull(), // personal, standard
  title: text("title").notNull(),
  description: text("description"),
  targetYear: integer("target_year"),
  targetAge: integer("target_age"),
  category: text("category"), // retirement, healthcare, financial, family, etc.
  isCompleted: boolean("is_completed").default(false),
  color: text("color").default("#3b82f6"), // Color for timeline display
  icon: text("icon"), // Icon name for display
  createdAt: timestamp("created_at").defaultNow(),
});

// Standard milestones schema - general milestones that apply to all users
export const standardMilestones = pgTable("standard_milestones", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetAge: integer("target_age").notNull(),
  category: text("category").notNull(), // retirement, healthcare, financial, etc.
  icon: text("icon").notNull(), // Icon name for display
  isActive: boolean("is_active").default(true), // Allow enabling/disabling milestones
  sortOrder: integer("sort_order").default(0), // For ordering milestones at same age
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertRetirementPlanSchema = createInsertSchema(retirementPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnnualSnapshotSchema = createInsertSchema(annualSnapshots).omit({
  id: true,
  createdAt: true,
});

export const insertAnnualSnapshotAssetSchema = createInsertSchema(annualSnapshotsAssets).omit({
  id: true,
});

export const insertAnnualSnapshotLiabilitySchema = createInsertSchema(annualSnapshotsLiabilities).omit({
  id: true,
});

export const insertAnnualSnapshotIncomeSchema = createInsertSchema(annualSnapshotsIncome).omit({
  id: true,
});

export const insertAnnualSnapshotExpenseSchema = createInsertSchema(annualSnapshotsExpenses).omit({
  id: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
});

export const insertStandardMilestoneSchema = createInsertSchema(standardMilestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type RetirementPlan = typeof retirementPlans.$inferSelect;
export type InsertRetirementPlan = z.infer<typeof insertRetirementPlanSchema>;

export type AnnualSnapshot = typeof annualSnapshots.$inferSelect;
export type InsertAnnualSnapshot = z.infer<typeof insertAnnualSnapshotSchema>;

export type AnnualSnapshotAsset = typeof annualSnapshotsAssets.$inferSelect;
export type InsertAnnualSnapshotAsset = z.infer<typeof insertAnnualSnapshotAssetSchema>;

export type AnnualSnapshotLiability = typeof annualSnapshotsLiabilities.$inferSelect;
export type InsertAnnualSnapshotLiability = z.infer<typeof insertAnnualSnapshotLiabilitySchema>;

export type AnnualSnapshotIncome = typeof annualSnapshotsIncome.$inferSelect;
export type InsertAnnualSnapshotIncome = z.infer<typeof insertAnnualSnapshotIncomeSchema>;

export type AnnualSnapshotExpense = typeof annualSnapshotsExpenses.$inferSelect;
export type InsertAnnualSnapshotExpense = z.infer<typeof insertAnnualSnapshotExpenseSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type StandardMilestone = typeof standardMilestones.$inferSelect;
export type InsertStandardMilestone = z.infer<typeof insertStandardMilestoneSchema>;

// Projection Types
export interface InitialData {
  currentAge: number;
  primaryRetireAge: number;
  primarySSStartAge: number;
  primarySSBenefit: number; // Annual
  spouseRetireAge: number;
  spouseSSStartAge: number;
  spouseSSBenefit: number; // Annual
  lifeExpectancy: number;
  portfolioGrowthRate: number; // e.g., 0.07 (7%)
  inflationRate: number; // e.g., 0.03 (3%)
  initialAnnualSpending: number; // Retirement spending goal
  initialAssets: {
    '401k': number;
    RothIRA: number;
    Brokerage: number;
    Savings: number;
  };
  // Mortgage Details
  mortgageBalance: number;
  mortgagePayment: number; // Monthly
  mortgageInterestRate: number; // e.g., 0.04 for 4%
  mortgageYearsLeft: number;
  // Additional Income
  pensionIncome: number;
  spousePensionIncome: number;
  otherRetirementIncome: number;
  // Pre-Retirement Income
  currentIncome: number;
  spouseCurrentIncome: number;
  expectedIncomeGrowth: number;
  spouseExpectedIncomeGrowth: number;
}

export interface YearlyData {
  year: number;
  age: number;

  // Expenses (Inflation Adjusted)
  inflationAdjustedSpending: number;
  livingExpenses: number;
  mortgagePayment: number;

  // Income Sources
  socialSecurityIncome: number;
  pensionIncome: number; // Sum of Pension + Other
  currentIncome: number; // For pre-retirement
  spouseCurrentIncome: number; // For pre-retirement
  rmdCalculated: number; // Required Minimum Distribution from 401k
  totalGrossWithdrawal: number; // Total amount pulled from accounts

  // Tax
  taxableWithdrawals: number; // Sum of RMD, 401k, and Brokerage withdrawals
  estimatedTax: number;

  // Asset Balances (End of Year - EOY)
  '401k_eoy': number;
  rothIRA_eoy: number;
  brokerage_eoy: number;
  savings_eoy: number;
  totalAssets_eoy: number;

  // Liabilities (End of Year)
  mortgageBalance_eoy: number;
  totalLiabilities_eoy: number;

  // Withdrawals Breakdown
  withdrawals: {
    '401k': number;
    RothIRA: number;
    Brokerage: number;
    Savings: number;
  };

  // Detailed Normalized Data
  assets: {
    name: string;
    type: string;
    balance: number;
    growth: number;
    contribution: number;
    withdrawal: number;
  }[];

  liabilities: {
    name: string;
    type: string;
    balance: number;
    payment: number;
  }[];

  income: {
    source: string;
    amount: number;
  }[];

  expenses: {
    category: string;
    amount: number;
  }[];

  // Aggregated Accounts Data (Legacy support if needed, but we'll try to use 'assets' now)
  accounts?: {
    type: string;
    name: string;
    balance: number;
    contribution: number;
    withdrawal: number;
    growth: number;
  }[];

  // Status
  isDepleted: boolean;
}
