/**
 * Calculates the future value of an investment
 * @param principal - The initial investment amount
 * @param annualRate - Annual interest rate (as a decimal)
 * @param years - Number of years
 * @param monthlyContribution - Monthly contribution amount
 * @returns The future value of the investment
 */
export function calculateFutureValue(
  principal: number,
  annualRate: number,
  years: number,
  monthlyContribution: number = 0
): number {
  const monthlyRate = annualRate / 12;
  let futureValue = principal;
  
  for (let i = 0; i < years * 12; i++) {
    futureValue = futureValue * (1 + monthlyRate) + monthlyContribution;
  }
  
  return Math.round(futureValue);
}

/**
 * Calculates the monthly retirement income from a retirement portfolio
 * @param portfolioValue - Total retirement portfolio value
 * @param withdrawalRate - Annual withdrawal rate (as a decimal)
 * @returns Monthly retirement income
 */
export function calculateMonthlyRetirementIncome(
  portfolioValue: number,
  withdrawalRate: number = 0.04 // 4% withdrawal rate is a common rule of thumb
): number {
  const annualIncome = portfolioValue * withdrawalRate;
  return Math.round(annualIncome / 12);
}

/**
 * Estimates Social Security benefits based on current income and age
 * @param currentAge - Current age
 * @param currentIncome - Current annual income
 * @param retirementAge - Expected retirement age
 * @returns Estimated monthly Social Security benefit
 */
export function estimateSocialSecurityBenefits(
  currentAge: number,
  currentIncome: number,
  retirementAge: number = 67
): number {
  // This is a very simplified estimation
  // Social Security calculations are complex and depend on lifetime earnings
  
  // Apply a replacement rate based on income level
  // Lower incomes have higher replacement rates
  let replacementRate = 0;
  
  if (currentIncome <= 30000) {
    replacementRate = 0.45; // 45% for lower incomes
  } else if (currentIncome <= 60000) {
    replacementRate = 0.40; // 40% for middle incomes
  } else if (currentIncome <= 100000) {
    replacementRate = 0.35; // 35% for upper-middle incomes
  } else {
    replacementRate = 0.30; // 30% for high incomes
  }
  
  // Cap the benefit at a reasonable maximum
  const maxMonthlyBenefit = 3500;
  
  // Adjust based on retirement age (simplified)
  let ageAdjustment = 1.0;
  if (retirementAge < 67) {
    ageAdjustment = 0.93; // Penalty for early retirement
  } else if (retirementAge > 67) {
    ageAdjustment = 1.08; // Bonus for delayed retirement
  }
  
  const estimatedMonthlyBenefit = (currentIncome * replacementRate / 12) * ageAdjustment;
  
  return Math.min(Math.round(estimatedMonthlyBenefit), maxMonthlyBenefit);
}

/**
 * Calculates retirement readiness score
 * @param currentAge - Current age
 * @param retirementAge - Target retirement age
 * @param currentSavings - Current retirement savings
 * @param annualContributions - Annual retirement contributions
 * @param currentIncome - Current annual income
 * @param desiredReplacementRate - Desired income replacement rate in retirement (as a decimal)
 * @returns A retirement readiness score from 0-100
 */
export function calculateRetirementReadinessScore(
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  annualContributions: number,
  currentIncome: number,
  desiredReplacementRate: number = 0.8 // 80% is a common target
): number {
  // Calculate years until retirement
  const yearsUntilRetirement = Math.max(0, retirementAge - currentAge);
  
  // Estimate future portfolio value
  const portfolioValue = calculateFutureValue(
    currentSavings,
    0.07, // Assumed 7% annual return
    yearsUntilRetirement,
    annualContributions / 12
  );
  
  // Calculate required retirement savings
  const annualExpenses = currentIncome * desiredReplacementRate;
  const requiredSavings = annualExpenses * 25; // 25x annual expenses (4% rule)
  
  // Calculate Social Security benefit to reduce required savings
  const monthlySocialSecurity = estimateSocialSecurityBenefits(
    currentAge,
    currentIncome,
    retirementAge
  );
  const annualSocialSecurity = monthlySocialSecurity * 12;
  
  // Adjust required savings based on Social Security
  const adjustedRequiredSavings = Math.max(0, requiredSavings - (annualSocialSecurity * 25));
  
  // Calculate readiness score as a percentage
  const readinessScore = Math.min(100, (portfolioValue / adjustedRequiredSavings) * 100);
  
  return Math.round(readinessScore);
}

/**
 * Projects retirement income over time
 * @param retirementAge - Retirement age
 * @param portfolioValue - Initial retirement portfolio value
 * @param withdrawalRate - Annual withdrawal rate
 * @param inflationRate - Expected annual inflation rate
 * @param socialSecurityBenefit - Monthly Social Security benefit
 * @param yearsToProject - Number of years to project
 * @returns Array of yearly income projections
 */
export function projectRetirementIncome(
  retirementAge: number,
  portfolioValue: number,
  withdrawalRate: number = 0.04,
  inflationRate: number = 0.025,
  socialSecurityBenefit: number,
  yearsToProject: number = 30
): Array<{ age: number; portfolioIncome: number; socialSecurity: number; total: number }> {
  const projections = [];
  let currentPortfolioValue = portfolioValue;
  let currentSocialSecurityBenefit = socialSecurityBenefit;
  
  for (let year = 0; year < yearsToProject; year++) {
    const age = retirementAge + year;
    
    // Calculate portfolio income (adjusted for inflation)
    const withdrawalAmount = currentPortfolioValue * withdrawalRate;
    const monthlyPortfolioIncome = withdrawalAmount / 12;
    
    // Adjust portfolio value after withdrawal
    currentPortfolioValue = (currentPortfolioValue - withdrawalAmount) * (1 + 0.06); // Assumed 6% return
    
    // Adjust Social Security for inflation
    if (year > 0) {
      currentSocialSecurityBenefit *= (1 + inflationRate);
    }
    
    projections.push({
      age,
      portfolioIncome: Math.round(monthlyPortfolioIncome),
      socialSecurity: Math.round(currentSocialSecurityBenefit),
      total: Math.round(monthlyPortfolioIncome + currentSocialSecurityBenefit)
    });
  }
  
  return projections;
}
