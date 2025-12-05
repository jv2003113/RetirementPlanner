# Database Schema Documentation

This document provides a detailed overview of the database schema used in the Retirement Planner application. It outlines the purpose of each table, its key data points, and the application screens that utilize it.

## Core Tables

### `users`
- **Description**: Stores user profile information, authentication credentials, and primary financial data (current assets, income, basic expenses).
- **Key Data**:
    - `username`, `password`, `email`: Authentication.
    - `currentAge`, `retirementAge`: Timeline basics.
    - `currentIncome`, `savingsBalance`, `investmentBalance`: Financial snapshot.
    - `mortgageBalance`, `mortgagePayment`: Liability details.
- **Screens**:
    - **Profile**: Users view and edit their personal and financial details.
    - **Onboarding**: Initial data collection.
    - **Retirement Plan**: Source for default projection parameters.

### `retirement_plans`
- **Description**: Stores specific retirement scenarios created by the user. Allows for multiple "what-if" plans (e.g., "Retire Early", "Work Longer").
- **Key Data**:
    - `planName`, `planType`: Identification.
    - `retirementAge`, `socialSecurityStartAge`: Scenario parameters.
    - `desiredAnnualRetirementSpending`: Target spending goal.
    - `portfolioGrowthRate`, `inflationRate`: Economic assumptions.
- **Screens**:
    - **Retirement Plan**: The main entity for the projection engine.
    - **Dashboard**: Lists available plans.

### `annual_snapshots`
- **Description**: Stores the year-by-year financial projection results for a specific `retirement_plan`.
- **Key Data**:
    - `year`, `age`: Timeline reference.
    - `totalAssets`, `netWorth`: Aggregated financial health.
    - `grossIncome`, `totalExpenses`: Cash flow summary.
- **Screens**:
    - **Retirement Plan (Projection Tab)**: Source for the "Net Worth over Time" chart and projection table.
    - **Retirement Plan (Dashboard Tab)**: Source for the timeline year selector.

### `account_balances`
- **Description**: Detailed breakdown of asset balances for each `annual_snapshot`.
- **Key Data**:
    - `accountType` (e.g., 401k, Brokerage): Categorization.
    - `balance`: Projected amount.
    - `withdrawal`, `contribution`: Cash flow details for that specific account.
- **Screens**:
    - **Retirement Plan (Dashboard Tab)**: Displays the "Financial Dashboard" cards showing balances for the selected year.

### `liabilities`
- **Description**: Detailed breakdown of debts (e.g., Mortgage) for each `annual_snapshot`.
- **Key Data**:
    - `liabilityType`: Type of debt.
    - `balance`: Remaining amount.
    - `monthlyPayment`: Cash flow impact.
- **Screens**:
    - **Retirement Plan (Dashboard Tab)**: Displays liability reduction over time.

### `milestones`
- **Description**: Significant life events or financial goals plotted on the timeline.
- **Key Data**:
    - `title`, `year`, `age`: Event details.
    - `milestoneType`: Personal or Standard.
- **Screens**:
    - **Retirement Plan**: displayed on the `InteractiveTimeline`.

## Portfolio & Investment Tables

### `investment_accounts`
- **Description**: Detailed real-world investment accounts linked to the user (more granular than the summary fields in `users`).
- **Key Data**:
    - `accountName`, `accountType`: Identification.
    - `balance`: Current value.
- **Screens**:
    - **Portfolio**: Main list of accounts.

### `security_holdings`
- **Description**: Specific assets held within an `investment_account`.
- **Key Data**:
    - `ticker`, `name`: Asset identification.
    - `percentage`, `assetClass`: Allocation details.
- **Screens**:
    - **Portfolio**: "Holdings" view within an account.

### `asset_allocations`
- **Description**: High-level categorization of assets within an account (e.g., 60% Stocks, 40% Bonds).
- **Key Data**:
    - `assetCategory`: Category name.
    - `percentage`: Allocation weight.
- **Screens**:
    - **Portfolio**: "Allocation" pie charts.

## Planning & Goals Tables

### `retirement_goals`
- **Description**: Specific financial objectives (e.g., "Travel to Europe", "Buy a Boat").
- **Key Data**:
    - `description`, `targetMonthlyIncome`: Goal specifics.
    - `priority`: Importance level.
- **Screens**:
    - **Onboarding (Retirement Goals Step)**: User input.
    - **Dashboard**: Goal tracking (if implemented).

### `retirement_expenses`
- **Description**: Detailed breakdown of expected retirement spending categories.
- **Key Data**:
    - `category` (e.g., Housing, Healthcare).
    - `estimatedMonthlyAmount`: Budgeting.
    - `isEssential`: For "Needs vs. Wants" analysis.
- **Screens**:
    - **Onboarding (Current Expenses Step)**: User input.

### `activities`
- **Description**: Audit log or activity feed of user actions.
- **Key Data**:
    - `activityType`, `description`: Event details.
    - `date`: Timestamp.
- **Screens**:
    - **Dashboard**: "Recent Activity" timeline.

## Specialized Tables

### `roth_conversion_plans`
- **Description**: Scenarios for converting Traditional IRA funds to Roth IRA.
- **Key Data**:
    - `conversionAmount`, `yearsToConvert`: Strategy parameters.
    - `totalTaxPaid`, `netWorth`: Outcome metrics.
- **Screens**:
    - **Tax Planning / Roth Conversion**: Analysis tool.

### `roth_conversion_scenarios`
- **Description**: Year-by-year simulation results for a `roth_conversion_plan`.
- **Key Data**:
    - `year`, `taxCost`, `traditionalBalance`, `rothBalance`.
- **Screens**:
    - **Tax Planning / Roth Conversion**: Charts and tables comparing strategies.

### `multi_step_form_progress`
- **Description**: Tracks the user's progress through the initial onboarding wizard.
- **Key Data**:
    - `currentStep`, `completedSteps`: Navigation state.
    - `formData`: Temporary storage of partial inputs.
- **Screens**:
    - **Onboarding**: Resuming sessions.
