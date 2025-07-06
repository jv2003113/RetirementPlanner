-- init_db.sql

-- First, drop existing tables in correct order (due to dependencies)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS retirement_expenses CASCADE;
DROP TABLE IF EXISTS security_holdings CASCADE;
DROP TABLE IF EXISTS asset_allocations CASCADE;
DROP TABLE IF EXISTS investment_accounts CASCADE;
DROP TABLE IF EXISTS retirement_goals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    current_age INTEGER,
    target_retirement_age INTEGER,
    current_location TEXT,
    marital_status TEXT,
    dependents INTEGER,
    current_income DECIMAL(10,2),
    expected_future_income DECIMAL(10,2),
    desired_lifestyle TEXT,
    has_spouse BOOLEAN DEFAULT false,
    spouse_first_name TEXT,
    spouse_last_name TEXT,
    spouse_current_age INTEGER,
    spouse_target_retirement_age INTEGER,
    spouse_current_income DECIMAL(10,2),
    spouse_expected_future_income DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE retirement_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    target_monthly_income DECIMAL(10,2),
    description TEXT,
    category TEXT,
    frequency TEXT DEFAULT 'monthly',
    priority INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE investment_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    balance DECIMAL(12,2) NOT NULL,
    contribution_amount DECIMAL(10,2),
    contribution_frequency TEXT,
    annual_return DECIMAL(5,2),
    fees DECIMAL(5,2),
    is_retirement_account BOOLEAN DEFAULT true,
    account_owner TEXT DEFAULT 'primary',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE asset_allocations (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES investment_accounts(id) NOT NULL,
    asset_category TEXT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_holdings (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES investment_accounts(id) ON DELETE CASCADE NOT NULL,
    ticker TEXT NOT NULL,
    name TEXT,
    percentage TEXT NOT NULL,
    asset_class TEXT,
    region TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE retirement_expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    category TEXT NOT NULL,
    estimated_monthly_amount DECIMAL(10,2) NOT NULL,
    is_essential BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    activity_type TEXT NOT NULL,
    title TEXT,
    description TEXT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE TABLE roth_conversion_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    plan_name TEXT NOT NULL,
    current_age INTEGER NOT NULL,
    retirement_age INTEGER NOT NULL,
    traditional_ira_balance DECIMAL(12,2) NOT NULL,
    current_tax_rate DECIMAL(5,2) NOT NULL,
    expected_retirement_tax_rate DECIMAL(5,2) NOT NULL,
    annual_income DECIMAL(10,2) NOT NULL,
    conversion_amount DECIMAL(12,2) NOT NULL,
    years_to_convert INTEGER NOT NULL,
    expected_return DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roth_conversion_scenarios (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES roth_conversion_plans(id) ON DELETE CASCADE NOT NULL,
    year INTEGER NOT NULL,
    age INTEGER NOT NULL,
    conversion_amount DECIMAL(12,2) NOT NULL,
    tax_cost DECIMAL(12,2) NOT NULL,
    traditional_balance DECIMAL(12,2) NOT NULL,
    roth_balance DECIMAL(12,2) NOT NULL,
    total_tax_paid DECIMAL(12,2) NOT NULL,
    net_worth DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

    -- Insert demo data
-- Default user
INSERT INTO users (
    username, password, first_name, last_name, email, 
    current_age, target_retirement_age, current_location, 
    marital_status, dependents, current_income, 
    expected_future_income, desired_lifestyle
) VALUES (
    'john.doe', 'password123', 'John', 'Doe', 'john.doe@example.com',
    40, 67, 'New York', 'married', 2, 120000,
    150000, 'comfortable'
) RETURNING id;

-- Retirement goals
INSERT INTO retirement_goals (user_id, target_monthly_income, description, category, priority)
VALUES 
    (1, 6000, 'Monthly income during retirement', 'income', 1),
    (1, NULL, 'Travel to Europe', 'travel', 2);

-- Investment accounts
INSERT INTO investment_accounts (
    user_id, account_name, account_type, balance,
    contribution_amount, contribution_frequency,
    annual_return, fees, is_retirement_account
) VALUES 
    (1, '401(k)', '401k', 300000, 1000, 'monthly', 7, 0.05, true),
    (1, 'Roth IRA', 'roth_ira', 150000, 500, 'monthly', 6.5, 0.03, true),
    (1, 'Brokerage Account', 'brokerage', 200000, 1000, 'monthly', 8, 0.1, false),
    (1, 'Real Estate Investments', 'real_estate', 150000, 0, 'none', 5, 1, false);

-- Asset allocations
INSERT INTO asset_allocations (account_id, asset_category, percentage, value)
VALUES 
    -- 401(k) allocations
    (1, 'stocks', 70, 210000),
    (1, 'bonds', 25, 75000),
    (1, 'cash', 5, 15000),
    -- IRA allocations
    (2, 'stocks', 80, 120000),
    (2, 'bonds', 15, 22500),
    (2, 'cash', 5, 7500),
    -- Brokerage allocations
    (3, 'stocks', 60, 120000),
    (3, 'bonds', 20, 40000),
    (3, 'cash', 20, 40000),
    -- Real estate allocations
    (4, 'real_estate', 100, 150000);

-- Security holdings
INSERT INTO security_holdings (account_id, ticker, name, percentage, asset_class, region)
VALUES
    -- Brokerage account holdings
    (3, 'VTI', 'Vanguard Total Stock Market ETF', '25', 'stock', 'domestic'),
    (3, 'VXUS', 'Vanguard Total International Stock ETF', '15', 'stock', 'international'),
    (3, 'BND', 'Vanguard Total Bond Market ETF', '20', 'bond', 'domestic'),
    (3, 'BNDX', 'Vanguard Total International Bond ETF', '10', 'bond', 'international'),
    (3, 'VNQ', 'Vanguard Real Estate ETF', '10', 'real_estate', 'domestic'),
    (3, 'CASH', 'Cash & Money Market', '20', 'cash', 'global'),
    -- IRA account holdings
    (2, 'VOO', 'Vanguard S&P 500 ETF', '40', 'stock', 'domestic'),
    (2, 'VEA', 'Vanguard FTSE Developed Markets ETF', '20', 'stock', 'international'),
    (2, 'VWO', 'Vanguard FTSE Emerging Markets ETF', '20', 'stock', 'emerging'),
    (2, 'BSV', 'Vanguard Short-Term Bond ETF', '15', 'bond', 'domestic'),
    (2, 'CASH', 'Cash & Money Market', '5', 'cash', 'global');

-- Retirement expenses
INSERT INTO retirement_expenses (user_id, category, estimated_monthly_amount, is_essential, notes)
VALUES 
    (1, 'housing', 2000, true, 'Mortgage will be paid off by retirement'),
    (1, 'healthcare', 800, true, 'Includes Medicare premiums and supplemental insurance'),
    (1, 'food', 600, true, 'Groceries and dining out'),
    (1, 'transportation', 400, true, 'Car maintenance, gas, insurance'),
    (1, 'travel', 1000, false, 'Budget for vacations and trips');

-- Activities
INSERT INTO activities (user_id, activity_type, title, description, date, metadata)
VALUES 
    (1, 'profile_setup', 'Profile Setup', 'Set up retirement goals', CURRENT_TIMESTAMP - INTERVAL '3 months', 
     '{"targetRetirementAge": 67, "targetMonthlyIncome": 6000}'::jsonb),
    (1, 'assessment', 'Retirement Assessment', 'Completed retirement assessment', CURRENT_TIMESTAMP - INTERVAL '2 months',
     '{"oldScore": 72, "newScore": 78}'::jsonb),
    (1, 'contribution_update', 'Contribution Update', 'Updated 401(k) contribution rate', CURRENT_TIMESTAMP - INTERVAL '2 weeks',
     '{"oldRate": 12, "newRate": 15}'::jsonb),
    (1, 'goal', 'Retirement Goal Added', 'Added a new retirement goal for travel to Europe', CURRENT_TIMESTAMP - INTERVAL '1 month',
     '{"category": "travel", "priority": 2}'::jsonb);

-- Roth conversion plans
INSERT INTO roth_conversion_plans (
    user_id, plan_name, current_age, retirement_age, traditional_ira_balance,
    current_tax_rate, expected_retirement_tax_rate, annual_income,
    conversion_amount, years_to_convert, expected_return, notes
) VALUES (
    1, 'Conservative Roth Conversion Strategy', 55, 67, 300000,
    24.0, 15.0, 120000, 50000, 5, 7.0,
    'Converting $50k over 5 years to reduce future RMDs and tax burden'
);

-- Roth conversion scenarios (sample data for the plan above)
INSERT INTO roth_conversion_scenarios (
    plan_id, year, age, conversion_amount, tax_cost, traditional_balance, 
    roth_balance, total_tax_paid, net_worth
) VALUES 
    (1, 1, 55, 10000, 2400, 310000, 7600, 2400, 317600),
    (1, 2, 56, 10000, 2400, 321000, 16120, 4800, 337120),
    (1, 3, 57, 10000, 2400, 332100, 25628, 7200, 357728),
    (1, 4, 58, 10000, 2400, 343410, 36172, 9600, 379582),
    (1, 5, 59, 10000, 2400, 354941, 47804, 12000, 402745);