import { InitialData, YearlyData } from "@shared/schema";

// Helper function to calculate RMD
export function calculateRMD(balance: number, age: number): number {
    if (age < 73) return 0;
    // Simplified RMD calculation: balance / (115 - age)
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
        let isPreRetirement = age < data.primaryRetireAge; // Simplified check

        if (isPreRetirement) {
            // Pre-Retirement Phase
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
        const rmdCalculated = calculateRMD(current401k, age);

        // 4. Withdrawal Strategy
        let remainingNeed = currentAnnualSpending - totalFixedIncome;

        // CRITICAL FIX: During pre-retirement, we must also subtract the current salary income
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
        if (rmdTaken > current401k) {
            rmdTaken = current401k;
        }

        current401k -= rmdTaken;
        totalTaxableWithdrawals += rmdTaken;
        totalGrossWithdrawal += rmdTaken;
        withdrawals['401k'] += rmdTaken;

        // Tax on RMD
        const taxOnRMD = rmdTaken * 0.15;
        estimatedTax += taxOnRMD;
        const rmdNet = rmdTaken - taxOnRMD;

        remainingNeed = Math.max(0, remainingNeed - rmdNet);

        // 1. Brokerage
        if (remainingNeed > 0 && currentBrokerage > 0) {
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
            const grossNeeded = remainingNeed;
            let withdrawAmount = Math.min(currentRothIRA, grossNeeded);
            currentRothIRA -= withdrawAmount;
            totalGrossWithdrawal += withdrawAmount;
            withdrawals.RothIRA += withdrawAmount;

            const netWithdrawal = withdrawAmount;
            remainingNeed = Math.max(0, remainingNeed - netWithdrawal);
        }

        // 4. Savings
        if (remainingNeed > 0 && currentSavings > 0) {
            const grossNeeded = remainingNeed;
            let withdrawAmount = Math.min(currentSavings, grossNeeded);
            currentSavings -= withdrawAmount;
            totalGrossWithdrawal += withdrawAmount;
            withdrawals.Savings += withdrawAmount;
            remainingNeed = Math.max(0, remainingNeed - withdrawAmount);
        }

        const isDepleted = remainingNeed > 1;

        // 5. Asset Growth
        if (!isDepleted) {
            current401k *= (1 + data.portfolioGrowthRate);
            currentRothIRA *= (1 + data.portfolioGrowthRate);
            currentBrokerage *= (1 + data.portfolioGrowthRate);
            currentSavings *= (1 + data.portfolioGrowthRate);
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
            currentIncome: isPreRetirement ? data.currentIncome * Math.pow(1 + data.expectedIncomeGrowth, age - data.currentAge) : 0,
            spouseCurrentIncome: isPreRetirement ? data.spouseCurrentIncome * Math.pow(1 + data.expectedIncomeGrowth, age - data.currentAge) : 0,
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
            totalLiabilities_eoy: currentMortgageBalance,
            withdrawals,
            assets: [
                { type: '401k', name: '401(k)', balance: current401k, growth: current401k * data.portfolioGrowthRate, contribution: 0, withdrawal: withdrawals['401k'] },
                { type: 'roth_ira', name: 'Roth IRA', balance: currentRothIRA, growth: currentRothIRA * data.portfolioGrowthRate, contribution: 0, withdrawal: withdrawals.RothIRA },
                { type: 'brokerage', name: 'Brokerage', balance: currentBrokerage, growth: currentBrokerage * data.portfolioGrowthRate, contribution: 0, withdrawal: withdrawals.Brokerage },
                { type: 'savings', name: 'Savings', balance: currentSavings, growth: currentSavings * data.portfolioGrowthRate, contribution: 0, withdrawal: withdrawals.Savings }
            ],
            liabilities: currentMortgageBalance > 0 ? [
                { type: 'mortgage', name: 'Home Mortgage', balance: currentMortgageBalance, payment: annualMortgagePayment }
            ] : [],
            income: [
                ...(socialSecurityIncome > 0 ? [{ source: 'social_security', amount: socialSecurityIncome }] : []),
                ...(pensionIncome > 0 ? [{ source: 'pension', amount: pensionIncome }] : []),
                ...(isPreRetirement ? [{ source: 'salary', amount: data.currentIncome * Math.pow(1 + data.expectedIncomeGrowth, age - data.currentAge) }] : [])
            ],
            expenses: [
                { category: 'living', amount: currentLivingExpenses },
                ...(mortgagePaymentThisYear > 0 ? [{ category: 'housing', amount: mortgagePaymentThisYear }] : []),
                { category: 'taxes', amount: estimatedTax }
            ],
            isDepleted
        });

        if (isDepleted) {
            break;
        }
    }

    return projection;
}
