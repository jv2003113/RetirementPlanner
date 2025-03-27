/**
 * Monte Carlo Simulation for Retirement Portfolio Projections
 * 
 * This utility provides functions for running Monte Carlo simulations
 * to project retirement portfolio outcomes with various market conditions.
 * 
 * The implementation is based on historical market data patterns and
 * includes randomization to account for market volatility.
 */

/**
 * Represents a year's simulation result
 */
export interface YearResult {
  year: number;
  age: number;
  portfolioValue: number;
  withdrawalAmount: number;
  cumulativeInflation: number;
  realPortfolioValue: number; // Adjusted for inflation
}

/**
 * Represents a single simulation run
 */
export interface SimulationRun {
  id: number;
  years: YearResult[];
  endBalance: number;
  realEndBalance: number;
  success: boolean; // Whether funds lasted through retirement
}

/**
 * Parameters for running a Monte Carlo simulation
 */
export interface MonteCarloParams {
  // Personal data
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  
  // Portfolio data
  initialBalance: number;
  annualContribution: number; // Pre-retirement annual contribution
  desiredAnnualIncome: number; // Annual withdrawal during retirement
  
  // Simulation parameters
  simulationRuns: number; // Number of simulations to run
  
  // Market parameters
  inflationRate?: number; // Default: 2.5%
  historicalReturns?: {
    mean: number; // Average annual return, e.g., 7%
    standardDeviation: number; // Standard deviation of returns, e.g., 15%
  };
  
  // Additional variables
  includePreRetirement?: boolean; // Include pre-retirement years in results
  adjustWithdrawalsForInflation?: boolean; // Adjust withdrawals for inflation
  socialSecurityIncome?: number; // Annual Social Security income (adjusted for inflation)
  otherIncome?: number; // Other annual income (adjusted for inflation)
}

/**
 * Result of a Monte Carlo simulation
 */
export interface MonteCarloResult {
  simulationRuns: SimulationRun[];
  successRate: number; // Percentage of runs where funds lasted through retirement
  medianEndBalance: number;
  minimumBalance: number;
  maximumBalance: number;
  confidenceIntervals: {
    optimistic: YearResult[]; // 90th percentile
    median: YearResult[]; // 50th percentile
    pessimistic: YearResult[]; // 10th percentile
  };
}

/**
 * Generate a random return based on a normal distribution
 * @param mean Mean of the normal distribution
 * @param stdDev Standard deviation of the normal distribution
 * @returns A random value from the normal distribution
 */
function generateRandomReturn(mean: number, stdDev: number): number {
  // Box-Muller transform to generate normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  
  // Generate a value from normal distribution with given mean and stdDev
  return z0 * stdDev + mean;
}

/**
 * Run a single simulation with the given parameters
 * @param params Parameters for the simulation
 * @param runId ID for this simulation run
 * @returns Results of the simulation run
 */
function runSingleSimulation(params: MonteCarloParams, runId: number): SimulationRun {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    initialBalance,
    annualContribution,
    desiredAnnualIncome,
    inflationRate = 0.025, // Default 2.5%
    historicalReturns = { mean: 0.07, standardDeviation: 0.15 }, // Default 7% return with 15% standard deviation
    includePreRetirement = true,
    adjustWithdrawalsForInflation = true,
    socialSecurityIncome = 0,
    otherIncome = 0
  } = params;
  
  // Determine number of years for simulation
  const preRetirementYears = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;
  const totalYears = includePreRetirement ? (preRetirementYears + retirementYears) : retirementYears;
  
  // Initialize results
  const years: YearResult[] = [];
  let portfolioValue = initialBalance;
  let isRetired = !includePreRetirement;
  let yearCounter = includePreRetirement ? 0 : preRetirementYears;
  let age = includePreRetirement ? currentAge : retirementAge;
  let cumulativeInflation = 1.0;
  let success = true; // Assume success until proven otherwise
  
  // Run simulation year by year
  for (let i = 0; i < totalYears; i++) {
    // Apply inflation
    cumulativeInflation *= (1 + inflationRate);
    
    // Generate random market return for this year
    const marketReturn = generateRandomReturn(historicalReturns.mean, historicalReturns.standardDeviation);
    
    // Update portfolio based on whether we're in retirement phase
    if (!isRetired) {
      // Pre-retirement: add contributions and apply growth
      portfolioValue = portfolioValue * (1 + marketReturn) + annualContribution;
      
      // Check if we're entering retirement next year
      if (age + 1 >= retirementAge) {
        isRetired = true;
      }
    } else {
      // Retirement: withdraw income and apply growth
      
      // Calculate withdrawal amount, adjusted for inflation if specified
      const withdrawalAmount = adjustWithdrawalsForInflation
        ? desiredAnnualIncome * cumulativeInflation
        : desiredAnnualIncome;
      
      // Calculate additional income sources
      const totalAdditionalIncome = (socialSecurityIncome + otherIncome) * cumulativeInflation;
      
      // Calculate net withdrawal (reduced by additional income)
      const netWithdrawal = Math.max(withdrawalAmount - totalAdditionalIncome, 0);
      
      // Check if we have enough in the portfolio
      if (portfolioValue < netWithdrawal) {
        // Not enough funds
        success = false;
        portfolioValue = 0;
      } else {
        // Withdraw income and apply growth
        portfolioValue = (portfolioValue - netWithdrawal) * (1 + marketReturn);
      }
      
      years.push({
        year: yearCounter,
        age,
        portfolioValue,
        withdrawalAmount: netWithdrawal,
        cumulativeInflation,
        realPortfolioValue: portfolioValue / cumulativeInflation
      });
    }
    
    // Increment counters
    yearCounter++;
    age++;
    
    // If portfolio runs out, exit the loop
    if (portfolioValue <= 0) {
      break;
    }
  }
  
  // Calculate real end balance (adjusted for inflation)
  const realEndBalance = portfolioValue / cumulativeInflation;
  
  return {
    id: runId,
    years,
    endBalance: portfolioValue,
    realEndBalance,
    success
  };
}

/**
 * Run a Monte Carlo simulation with the given parameters
 * @param params Parameters for the simulation
 * @returns Results of the simulation
 */
export function runMonteCarloSimulation(params: MonteCarloParams): MonteCarloResult {
  const { simulationRuns = 1000 } = params;
  
  // Run simulations
  const runs: SimulationRun[] = [];
  for (let i = 0; i < simulationRuns; i++) {
    runs.push(runSingleSimulation(params, i));
  }
  
  // Calculate success rate
  const successfulRuns = runs.filter(run => run.success);
  const successRate = successfulRuns.length / simulationRuns;
  
  // Calculate statistics
  const endBalances = runs.map(run => run.endBalance);
  const sortedEndBalances = [...endBalances].sort((a, b) => a - b);
  
  const minimumBalance = sortedEndBalances[0];
  const maximumBalance = sortedEndBalances[sortedEndBalances.length - 1];
  const medianEndBalance = sortedEndBalances[Math.floor(sortedEndBalances.length / 2)];
  
  // Generate confidence intervals
  // Create year-by-year percentiles
  const { 
    currentAge,
    retirementAge,
    lifeExpectancy,
    includePreRetirement = true 
  } = params;
  
  const preRetirementYears = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;
  const totalYears = includePreRetirement ? (preRetirementYears + retirementYears) : retirementYears;
  
  // Initialize year-by-year values for percentile calculations
  const yearlyValues: number[][] = Array(totalYears).fill(0).map(() => []);
  
  // Collect portfolio values for each year across all simulations
  runs.forEach(run => {
    run.years.forEach(year => {
      const yearIndex = includePreRetirement 
        ? year.year 
        : year.year - preRetirementYears;
        
      if (yearIndex >= 0 && yearIndex < totalYears) {
        yearlyValues[yearIndex].push(year.portfolioValue);
      }
    });
  });
  
  // Sort values for each year and calculate percentiles
  const confidence = {
    optimistic: [] as YearResult[],
    median: [] as YearResult[],
    pessimistic: [] as YearResult[]
  };
  
  yearlyValues.forEach((values, yearIndex) => {
    if (values.length > 0) {
      // Sort values for this year
      const sortedValues = [...values].sort((a, b) => a - b);
      
      // Calculate percentiles
      const p10Index = Math.max(0, Math.floor(values.length * 0.1) - 1);
      const p50Index = Math.floor(values.length * 0.5);
      const p90Index = Math.min(values.length - 1, Math.floor(values.length * 0.9));
      
      const age = includePreRetirement 
        ? currentAge + yearIndex 
        : retirementAge + yearIndex;
      
      // Create YearResult objects for each percentile
      const createYearResult = (value: number): YearResult => ({
        year: yearIndex + (includePreRetirement ? 0 : preRetirementYears),
        age,
        portfolioValue: value,
        withdrawalAmount: 0, // Cannot determine this here
        cumulativeInflation: 1, // Cannot determine this here
        realPortfolioValue: value // Cannot adjust for inflation here
      });
      
      confidence.pessimistic.push(createYearResult(sortedValues[p10Index]));
      confidence.median.push(createYearResult(sortedValues[p50Index]));
      confidence.optimistic.push(createYearResult(sortedValues[p90Index]));
    }
  });
  
  return {
    simulationRuns: runs,
    successRate,
    medianEndBalance,
    minimumBalance,
    maximumBalance,
    confidenceIntervals: confidence
  };
}