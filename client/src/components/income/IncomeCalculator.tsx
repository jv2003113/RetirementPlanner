import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  calculateFutureValue,
  calculateMonthlyRetirementIncome,
  estimateSocialSecurityBenefits
} from "@/lib/retirement-calculations";

interface IncomeCalculatorProps {
  userData: any;
  accountsData: any[];
}

const IncomeCalculator = ({ userData, accountsData }: IncomeCalculatorProps) => {
  // Initialize state with user data
  const [currentAge, setCurrentAge] = useState(userData?.currentAge || 40);
  const [retirementAge, setRetirementAge] = useState(userData?.targetRetirementAge || 67);
  const [currentSavings, setCurrentSavings] = useState(
    accountsData?.reduce((total: number, account: any) =>
      total + (account.isRetirementAccount ? Number(account.balance) : 0), 0) || 100000
  );
  const [monthlyContribution, setMonthlyContribution] = useState(
    accountsData?.reduce((total: number, account: any) =>
      total + (account.contributionFrequency === "monthly" && account.isRetirementAccount ?
        Number(account.contributionAmount) : 0), 0) || 500
  );
  const [annualReturn, setAnnualReturn] = useState(7);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [currentIncome, setCurrentIncome] = useState(userData?.currentIncome || 75000);

  // Calculate projections
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const futurePortfolioValue = calculateFutureValue(
    currentSavings,
    annualReturn / 100,
    yearsToRetirement,
    monthlyContribution
  );
  const monthlyPortfolioIncome = calculateMonthlyRetirementIncome(
    futurePortfolioValue,
    withdrawalRate / 100
  );
  const monthlySocialSecurity = estimateSocialSecurityBenefits(
    currentAge,
    currentIncome,
    retirementAge
  );
  const totalMonthlyIncome = monthlyPortfolioIncome + monthlySocialSecurity;
  const incomeReplacementRate = Math.round((totalMonthlyIncome / (currentIncome / 12)) * 100);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retirement Income Calculator</CardTitle>
        <CardDescription>
          Adjust the parameters below to see how they affect your projected retirement income.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Current Age: {currentAge}</label>
                <span className="text-sm text-gray-500">{currentAge} years</span>
              </div>
              <Slider
                value={[currentAge]}
                min={20}
                max={80}
                step={1}
                onValueChange={(value) => setCurrentAge(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Retirement Age: {retirementAge}</label>
                <span className="text-sm text-gray-500">{retirementAge} years</span>
              </div>
              <Slider
                value={[retirementAge]}
                min={55}
                max={75}
                step={1}
                onValueChange={(value) => setRetirementAge(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Current Retirement Savings</label>
                <span className="text-sm text-gray-500">{formatCurrency(currentSavings)}</span>
              </div>
              <Input
                type="number"
                min="0"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Monthly Contribution</label>
                <span className="text-sm text-gray-500">{formatCurrency(monthlyContribution)}</span>
              </div>
              <Input
                type="number"
                min="0"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Annual Return: {annualReturn}%</label>
                <span className="text-sm text-gray-500">{annualReturn}%</span>
              </div>
              <Slider
                value={[annualReturn]}
                min={1}
                max={12}
                step={0.5}
                onValueChange={(value) => setAnnualReturn(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Withdrawal Rate: {withdrawalRate}%</label>
                <span className="text-sm text-gray-500">{withdrawalRate}%</span>
              </div>
              <Slider
                value={[withdrawalRate]}
                min={2}
                max={6}
                step={0.1}
                onValueChange={(value) => setWithdrawalRate(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Current Annual Income</label>
                <span className="text-sm text-gray-500">{formatCurrency(currentIncome)}</span>
              </div>
              <Input
                type="number"
                min="0"
                value={currentIncome}
                onChange={(e) => setCurrentIncome(Number(e.target.value))}
              />
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Quick Tip</h3>
              <p className="text-sm text-gray-700">
                The 4% rule is a common guideline for retirement withdrawals. It suggests you can withdraw 4% of your
                portfolio in the first year of retirement, then adjust that amount for inflation each year, with a high
                probability of not running out of money for at least 30 years.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500">Future Portfolio Value</h3>
                <div className="text-2xl font-bold mt-1">{formatCurrency(futurePortfolioValue)}</div>
                <p className="text-xs text-gray-500 mt-1">at age {retirementAge}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500">Projected Monthly Income</h3>
                <div className="text-2xl font-bold mt-1">{formatCurrency(totalMonthlyIncome)}</div>
                <div className="flex justify-center space-x-2 text-xs text-gray-500 mt-1">
                  <span>{formatCurrency(monthlyPortfolioIncome)} portfolio</span>
                  <span>+</span>
                  <span>{formatCurrency(monthlySocialSecurity)} social security</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500">Income Replacement</h3>
                <div className="text-2xl font-bold mt-1">{incomeReplacementRate}%</div>
                <p className="text-xs text-gray-500 mt-1">of pre-retirement income</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        <Button>Generate Detailed Report</Button>
      </CardFooter>
    </Card>
  );
};

export default IncomeCalculator;
