// Define the structure for all necessary user inputs
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
}

// Define the structure for the yearly output data, optimized for retiree viewing
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

    // Status
    isDepleted: boolean;
}

// Helper function to calculate RMD
export function calculateRMD(balance: number, age: number): number {
    if (age < 73) return 0;
    // Simplified RMD calculation: balance / (115 - age)
    // Note: The actual IRS Uniform Lifetime Table is more complex, but this is a reasonable approximation for projection.
    // We'll use a slightly more robust divisor approximation if needed, but the prompt specified balance / (115 - age).
    // However, let's ensure the divisor doesn't go to zero or negative.
    const divisor = Math.max(1, 115 - age);
    return balance / divisor;
}

export function calculateRetirementProjection(data: InitialData): YearlyData[] {
    const projection: YearlyData[] = [];
    const currentYear = new Date().getFullYear();

    let current401k = data.initialAssets['401k'];
    let currentRothIRA = data.initialAssets.RothIRA;
    let currentBrokerage = data.initialAssets.Brokerage;
    let currentSavings = data.initialAssets.Savings;

    // Mortgage State
    let currentMortgageBalance = data.mortgageBalance;
    let mortgageYearsRemaining = data.mortgageYearsLeft;
    const annualMortgagePayment = data.mortgagePayment * 12;

    // Pre-Retirement Income State
    let currentTotalIncome = data.currentIncome + data.spouseCurrentIncome;

    // Initial spending breakdown
    // We assume initialAnnualSpending INCLUDES the mortgage payment.
    // So Base Living Expenses = Total - Mortgage
    let currentLivingExpenses = Math.max(0, data.initialAnnualSpending - (currentMortgageBalance > 0 ? annualMortgagePayment : 0));

    for (let age = data.currentAge; age <= data.lifeExpectancy; age++) {
        const year = currentYear + (age - data.currentAge);

        // 1. Inflation & Spending & Income Growth
        if (age > data.currentAge) {
            currentLivingExpenses = currentLivingExpenses * (1 + data.inflationRate);
            currentTotalIncome = currentTotalIncome * (1 + data.expectedIncomeGrowth);
        }

        // Calculate Total Spending for this year
        let mortgagePaymentThisYear = 0;

        // Mortgage Payoff Logic
        if (currentMortgageBalance > 0 && mortgageYearsRemaining > 0) {
            mortgagePaymentThisYear = annualMortgagePayment;

            // Calculate Interest
            const interestPayment = currentMortgageBalance * data.mortgageInterestRate;
            const principalPayment = Math.min(currentMortgageBalance, annualMortgagePayment - interestPayment);

            currentMortgageBalance -= principalPayment;
            if (currentMortgageBalance < 0) currentMortgageBalance = 0;

            mortgageYearsRemaining--;
        }

        const currentAnnualSpending = currentLivingExpenses + mortgagePaymentThisYear;


        // 2. Income
        let socialSecurityIncome = 0;
        let pensionIncome = 0;
        let isPreRetirement = age < data.primaryRetireAge; // Simplified check, could be more complex if spouse retires at different time

        if (isPreRetirement) {
            // Pre-Retirement Phase: Income covers expenses, surplus reinvested
            // We assume "currentTotalIncome" is the gross income available.
            // Note: In a real app, we'd handle taxes on this income more precisely.
            // Here we treat it as net or assume taxes are part of expenses/handled simply.

            // We do NOT map it to pensionIncome anymore, to avoid duplication in the dashboard.
            // The dashboard will use 'currentIncome' and 'spouseCurrentIncome' for display.
            // The ProjectionTable needs to be aware of this change if it relies on pensionIncome for the "Fixed Income" column.
            pensionIncome = 0;
        } else {
            // Post-Retirement Phase
            if (age >= data.primarySSStartAge) {
                socialSecurityIncome += data.primarySSBenefit;
            }
            if (age >= data.spouseSSStartAge) {
                socialSecurityIncome += data.spouseSSBenefit;
            }

            if (age >= data.primaryRetireAge) {
                pensionIncome += data.pensionIncome;
                pensionIncome += data.otherRetirementIncome;
            }
            if (age >= data.spouseRetireAge) {
                pensionIncome += data.spousePensionIncome;
            }
        }

        const totalFixedIncome = socialSecurityIncome + pensionIncome;

        // 3. RMD Calculation
        // RMDs only apply to 401k (Pre-Tax) balance.
        // RMD is calculated based on the balance at the START of the year (which is current401k here).
        const rmdCalculated = calculateRMD(current401k, age);

        // 4. Withdrawal Strategy
        // Net Withdrawal Need = (Inflation-Adjusted Spending) - (Total SS Income) - (RMD)
        // Note: RMD is a forced withdrawal, so it counts towards covering the spending needs.
        // However, RMD is taxable, so we need to account for taxes on it.

        // Let's refine the logic:
        // We need to cover 'currentAnnualSpending'.
        // We have 'socialSecurityIncome' (tax-free in this simplified model? Prompt didn't specify SS tax, but usually it's partially taxable. 
        // The prompt says "Assume a simplified, flat 15% tax rate on all taxable withdrawals (RMD and any other withdrawals from 401k or Brokerage)."
        // It implies SS is not taxed or handled separately. Let's assume SS covers spending directly.

        // Remaining need after Fixed Income:
        let remainingNeed = currentAnnualSpending - totalFixedIncome;

        // CRITICAL FIX: During pre-retirement, we must also subtract the current salary income
        // from the remaining need, otherwise the system will think we need to withdraw from the portfolio.
        if (isPreRetirement) {
            remainingNeed -= currentTotalIncome;
        }

        // Handle Surplus (Income > Spending)
        if (remainingNeed < 0) {
            // Surplus! Reinvest into Brokerage.
            const surplus = Math.abs(remainingNeed);
            currentBrokerage += surplus;
            remainingNeed = 0;
        }

        // We have RMD which MUST be taken.
        // RMD is taxable.
        // Tax on RMD = rmdCalculated * 0.15
        // Net RMD available for spending = rmdCalculated - Tax on RMD = rmdCalculated * 0.85

        // Actually, the prompt says:
        // "The total Gross Withdrawal must cover the Net Withdrawal Need after taxes."
        // And "Tax Assumption: Assume a simplified, flat 15% tax rate on all taxable withdrawals".

        // Let's track total withdrawals and taxes.
        let totalTaxableWithdrawals = 0;
        let totalGrossWithdrawal = 0;
        let estimatedTax = 0;

        const withdrawals = {
            '401k': 0,
            RothIRA: 0,
            Brokerage: 0,
            Savings: 0
        };

        // First, take RMD
        let rmdTaken = rmdCalculated;
        // If RMD is more than current 401k balance (unlikely with the formula, but possible if balance is low), cap it.
        if (rmdTaken > current401k) {
            rmdTaken = current401k;
        }

        current401k -= rmdTaken;
        totalTaxableWithdrawals += rmdTaken;
        totalGrossWithdrawal += rmdTaken;
        withdrawals['401k'] += rmdTaken;

        // How much spending is covered by RMD (after tax)?
        // Tax on RMD
        const taxOnRMD = rmdTaken * 0.15;
        estimatedTax += taxOnRMD;
        const rmdNet = rmdTaken - taxOnRMD;

        remainingNeed = Math.max(0, remainingNeed - rmdNet);

        // If we still have remaining need, we need to withdraw more.
        // We need to withdraw enough Gross to cover 'remainingNeed' + Taxes on that Gross.
        // If withdrawing from Taxable (Brokerage) or 401k:
        // Gross = Net / (1 - 0.15)
        // If withdrawing from Roth:
        // Gross = Net (no tax)

        // Withdrawal Order:
        // 1. Taxable Brokerage
        // 2. 401k (Pre-Tax)
        // 3. Roth IRA (Tax-Free)

        // 1. Brokerage
        if (remainingNeed > 0 && currentBrokerage > 0) {
            // Need to cover 'remainingNeed' from Brokerage (taxable)
            // Gross needed = remainingNeed / 0.85
            const grossNeeded = remainingNeed / 0.85;

            let withdrawAmount = Math.min(currentBrokerage, grossNeeded);
            currentBrokerage -= withdrawAmount;
            totalTaxableWithdrawals += withdrawAmount;
            totalGrossWithdrawal += withdrawAmount;
            withdrawals.Brokerage += withdrawAmount;

            const taxOnWithdrawal = withdrawAmount * 0.15;
            estimatedTax += taxOnWithdrawal;
            const netWithdrawal = withdrawAmount - taxOnWithdrawal;

            remainingNeed = Math.max(0, remainingNeed - netWithdrawal);
        }

        // 2. 401k (Pre-Tax)
        if (remainingNeed > 0 && current401k > 0) {
            // Need to cover 'remainingNeed' from 401k (taxable)
            // Gross needed = remainingNeed / 0.85
            const grossNeeded = remainingNeed / 0.85;

            let withdrawAmount = Math.min(current401k, grossNeeded);
            current401k -= withdrawAmount;
            totalTaxableWithdrawals += withdrawAmount;
            totalGrossWithdrawal += withdrawAmount;
            withdrawals['401k'] += withdrawAmount;

            const taxOnWithdrawal = withdrawAmount * 0.15;
            estimatedTax += taxOnWithdrawal;
            const netWithdrawal = withdrawAmount - taxOnWithdrawal;

            remainingNeed = Math.max(0, remainingNeed - netWithdrawal);
        }

        // 3. Roth IRA (Tax-Free)
        if (remainingNeed > 0 && currentRothIRA > 0) {
            // Need to cover 'remainingNeed' from Roth (tax-free)
            // Gross needed = remainingNeed
            const grossNeeded = remainingNeed;

            let withdrawAmount = Math.min(currentRothIRA, grossNeeded);
            currentRothIRA -= withdrawAmount;
            // Roth withdrawals are NOT taxable withdrawals in this model
            totalGrossWithdrawal += withdrawAmount;
            withdrawals.RothIRA += withdrawAmount;

            // No tax
            const netWithdrawal = withdrawAmount;
            remainingNeed = Math.max(0, remainingNeed - netWithdrawal);
        }

        // 4. Savings (Tax-Free? Prompt didn't specify Savings tax treatment, but usually savings interest is taxed annually, withdrawals are principal. 
        // The prompt listed "Savings" in initial assets but didn't specify it in the withdrawal order: "Taxable Brokerage: Withdraw first. 401k (Pre-Tax): Withdraw second. Roth IRA (Tax-Free): Withdraw last".
        // It omitted Savings from the withdrawal order instructions.
        // However, it included 'Savings' in initialAssets.
        // I will assume Savings is accessed LAST or FIRST? 
        // Usually Savings is cash and accessed first. But strict adherence to prompt:
        // "Withdrawal Order... Taxable Brokerage... 401k... Roth IRA... Failure Condition: If all accounts are depleted..."
        // It implies Savings might be ignored or lumped with Brokerage?
        // Or maybe I should add it as a 4th step or 0th step.
        // Given "Taxable Brokerage" is explicitly named, and "Savings" is separate in InitialData.
        // I will treat Savings as a backup after Roth, or maybe it should be before Brokerage?
        // Let's put it after Roth for now to strictly follow the "Withdrawal Order" list which didn't mention it, but use it before declaring "isDepleted".
        // Actually, let's treat it as "Taxable Brokerage" equivalent or just cash.
        // Let's put it LAST to be safe, or ask? No, I must decide.
        // I'll put it after Roth IRA to ensure we use all assets before failing.
        // And assume it's tax-free withdrawal (principal) or taxed like brokerage?
        // Let's assume tax-free (cash) for simplicity unless it's significant.

        if (remainingNeed > 0 && currentSavings > 0) {
            const grossNeeded = remainingNeed; // Assume cash is tax free to withdraw (already taxed)
            let withdrawAmount = Math.min(currentSavings, grossNeeded);
            currentSavings -= withdrawAmount;
            totalGrossWithdrawal += withdrawAmount;
            withdrawals.Savings += withdrawAmount;
            remainingNeed = Math.max(0, remainingNeed - withdrawAmount);
        }

        const isDepleted = remainingNeed > 1; // Allow for small rounding errors

        // 5. Asset Growth
        // "At the end of the year, apply the portfolioGrowthRate to the remaining balance of each asset"
        if (!isDepleted) {
            current401k *= (1 + data.portfolioGrowthRate);
            currentRothIRA *= (1 + data.portfolioGrowthRate);
            currentBrokerage *= (1 + data.portfolioGrowthRate);
            currentSavings *= (1 + data.portfolioGrowthRate); // Assume savings also grows? Or maybe lower rate? Prompt says "apply the portfolioGrowthRate to the remaining balance of each asset". So yes.
        }

        const totalAssets_eoy = current401k + currentRothIRA + currentBrokerage + currentSavings;

        projection.push({
            year,
            age,
            inflationAdjustedSpending: currentAnnualSpending,
            livingExpenses: currentLivingExpenses,
            mortgagePayment: mortgagePaymentThisYear,
            socialSecurityIncome,
            pensionIncome,
            currentIncome: isPreRetirement ? data.currentIncome * Math.pow(1 + data.expectedIncomeGrowth, age - data.currentAge) : 0, // Approximate for display
            spouseCurrentIncome: isPreRetirement ? data.spouseCurrentIncome * Math.pow(1 + data.expectedIncomeGrowth, age - data.currentAge) : 0, // Approximate for display
            rmdCalculated,
            totalGrossWithdrawal,
            taxableWithdrawals: totalTaxableWithdrawals,
            estimatedTax,
            '401k_eoy': current401k,
            rothIRA_eoy: currentRothIRA,
            brokerage_eoy: currentBrokerage,
            savings_eoy: currentSavings,
            totalAssets_eoy,
            mortgageBalance_eoy: currentMortgageBalance,
            totalLiabilities_eoy: currentMortgageBalance, // Add other liabilities if we had them tracked separately
            withdrawals,
            isDepleted
        });

        if (isDepleted) {
            // Stop projection if depleted? Prompt says "mark the year as isDepleted: true and stop the projection."
            // So we break the loop.
            break;
        }
    }

    return projection;
}
