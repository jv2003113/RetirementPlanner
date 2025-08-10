import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  id: serial("id").primaryKey(),
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
  expectedFutureIncome: decimal("expected_future_income", { precision: 10, scale: 2 }),
  desiredLifestyle: text("desired_lifestyle"), // frugal, comfortable, luxurious
  // Spouse information
  hasSpouse: boolean("has_spouse").default(false),
  spouseFirstName: text("spouse_first_name"),
  spouseLastName: text("spouse_last_name"),
  spouseCurrentAge: integer("spouse_current_age"),
  spouseTargetRetirementAge: integer("spouse_target_retirement_age"),
  spouseCurrentIncome: decimal("spouse_current_income", { precision: 10, scale: 2 }),
  spouseExpectedFutureIncome: decimal("spouse_expected_future_income", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Retirement goals schema
export const retirementGoals = pgTable("retirement_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  targetMonthlyIncome: decimal("target_monthly_income", { precision: 10, scale: 2 }),
  description: text("description"),
  category: text("category"), // travel, hobbies, healthcare, etc.
  frequency: text("frequency").default("monthly"), // monthly, yearly, one-time
  priority: integer("priority"), // 1-5
  createdAt: timestamp("created_at").defaultNow(),
});

// Investment accounts schema
export const investmentAccounts = pgTable("investment_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
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
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => investmentAccounts.id).notNull(),
  assetCategory: text("asset_category").notNull(), // stocks, bonds, real estate, cash
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Retirement expenses schema
export const retirementExpenses = pgTable("retirement_expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  category: text("category").notNull(), // housing, healthcare, travel, etc.
  estimatedMonthlyAmount: decimal("estimated_monthly_amount", { precision: 10, scale: 2 }).notNull(),
  isEssential: boolean("is_essential").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at",{ mode: "date" }).defaultNow(),
});

// Activities schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(),
  title: text("title"),
  description: text("description").notNull(),
  date: timestamp("date",{ mode: "date" }).defaultNow(),
  metadata: jsonb("metadata"),
});


// Define insert schemas

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertRetirementGoalSchema = createInsertSchema(retirementGoals).omit({
  id: true,
  createdAt: true,
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

export const insertRetirementExpenseSchema = createInsertSchema(retirementExpenses).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

// Define types

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type RetirementGoal = typeof retirementGoals.$inferSelect;
export type InsertRetirementGoal = z.infer<typeof insertRetirementGoalSchema>;

export type InvestmentAccount = typeof investmentAccounts.$inferSelect;
export type InsertInvestmentAccount = z.infer<typeof insertInvestmentAccountSchema>;

export type AssetAllocation = typeof assetAllocations.$inferSelect;
export type InsertAssetAllocation = z.infer<typeof insertAssetAllocationSchema>;

// Add new schema for security holdings
export const securityHoldings = pgTable("security_holdings", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => investmentAccounts.id, { onDelete: "cascade" }).notNull(),
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

export type RetirementExpense = typeof retirementExpenses.$inferSelect;
export type InsertRetirementExpense = z.infer<typeof insertRetirementExpenseSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Roth conversion plans schema
export const rothConversionPlans = pgTable("roth_conversion_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
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
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => rothConversionPlans.id, { onDelete: "cascade" }).notNull(),
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
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
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
