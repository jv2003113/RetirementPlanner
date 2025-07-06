import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calculator, TrendingUp, AlertTriangle, Info, Save } from "lucide-react";

// Form schema for Roth conversion inputs
const rothConversionSchema = z.object({
  currentAge: z.coerce.number().min(18).max(100),
  retirementAge: z.coerce.number().min(50).max(100),
  traditionalIraBalance: z.coerce.number().min(0),
  currentTaxRate: z.coerce.number().min(0).max(50),
  expectedRetirementTaxRate: z.coerce.number().min(0).max(50),
  annualIncome: z.coerce.number().min(0),
  conversionAmount: z.coerce.number().min(0),
  yearsToConvert: z.coerce.number().min(1).max(20),
  expectedReturn: z.coerce.number().min(0).max(20),
});

type RothConversionFormValues = z.infer<typeof rothConversionSchema>;

interface ConversionScenario {
  year: number;
  age: number;
  conversionAmount: number;
  taxCost: number;
  traditionalBalance: number;
  rothBalance: number;
  totalTaxPaid: number;
  netWorth: number;
}

interface RothConversionCalculatorProps {
  userId?: number;
}

const RothConversionCalculator = ({ userId = 1 }: RothConversionCalculatorProps) => {
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<ConversionScenario[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch user data and investment accounts
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: accountsData } = useQuery({
    queryKey: [`/api/users/${userId}/investment-accounts`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Save plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest("POST", "/api/roth-conversion-plans", planData);
    },
    onSuccess: (response) => {
      const plan = response as any;
      // Save scenarios for the plan
      if (scenarios.length > 0) {
        apiRequest("POST", `/api/roth-conversion-plans/${plan.id}/scenarios`, {
          scenarios: scenarios.map(scenario => ({
            year: scenario.year,
            age: scenario.age,
            conversionAmount: scenario.conversionAmount,
            taxCost: scenario.taxCost,
            traditionalBalance: scenario.traditionalBalance,
            rothBalance: scenario.rothBalance,
            totalTaxPaid: scenario.totalTaxPaid,
            netWorth: scenario.netWorth,
          }))
        });
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/roth-conversion-plans`] });
      toast({
        title: "Plan Saved",
        description: "Your Roth conversion plan has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save the Roth conversion plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate traditional IRA balance from accounts
  const getTraditionalIraBalance = () => {
    if (!accountsData || !Array.isArray(accountsData)) return 0;
    return accountsData
      .filter((account: any) => 
        account.accountType === 'traditional_ira' || 
        account.accountType === '401k' ||
        account.accountType === '403b'
      )
      .reduce((total: number, account: any) => total + Number(account.balance), 0);
  };

  // Calculate current tax rate based on income
  const calculateTaxRate = (income: number): number => {
    if (income <= 11600) return 10;
    if (income <= 47150) return 12;
    if (income <= 100525) return 22;
    if (income <= 191950) return 24;
    if (income <= 243725) return 32;
    if (income <= 609350) return 35;
    return 37;
  };

  const form = useForm<RothConversionFormValues>({
    resolver: zodResolver(rothConversionSchema),
    defaultValues: {
      currentAge: userData?.currentAge || 55,
      retirementAge: userData?.targetRetirementAge || 67,
      traditionalIraBalance: getTraditionalIraBalance(),
      currentTaxRate: calculateTaxRate(userData?.currentIncome || 75000),
      expectedRetirementTaxRate: 15, // Conservative estimate
      annualIncome: userData?.currentIncome || 75000,
      conversionAmount: 50000,
      yearsToConvert: 5,
      expectedReturn: 7,
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (userData && accountsData) {
      form.setValue('currentAge', userData.currentAge || 55);
      form.setValue('retirementAge', userData.targetRetirementAge || 67);
      form.setValue('traditionalIraBalance', getTraditionalIraBalance());
      form.setValue('currentTaxRate', calculateTaxRate(userData.currentIncome || 75000));
      form.setValue('annualIncome', userData.currentIncome || 75000);
    }
  }, [userData, accountsData, form]);

  const calculateConversionScenarios = (values: RothConversionFormValues) => {
    const scenarios: ConversionScenario[] = [];
    let traditionalBalance = values.traditionalIraBalance;
    let rothBalance = 0;
    let totalTaxPaid = 0;

    for (let year = 1; year <= values.yearsToConvert; year++) {
      const age = values.currentAge + year - 1;
      
      // Calculate conversion amount for this year
      const annualConversion = Math.min(
        values.conversionAmount / values.yearsToConvert,
        traditionalBalance
      );

      // Calculate tax on conversion
      const taxCost = annualConversion * (values.currentTaxRate / 100);

      // Update balances
      traditionalBalance -= annualConversion;
      rothBalance += annualConversion - taxCost;
      totalTaxPaid += taxCost;

      // Apply growth to both accounts
      traditionalBalance *= (1 + values.expectedReturn / 100);
      rothBalance *= (1 + values.expectedReturn / 100);

      scenarios.push({
        year,
        age,
        conversionAmount: annualConversion,
        taxCost,
        traditionalBalance,
        rothBalance,
        totalTaxPaid,
        netWorth: traditionalBalance + rothBalance,
      });
    }

    // Add years after conversion is complete
    const yearsAfterConversion = values.retirementAge - values.currentAge - values.yearsToConvert;
    for (let year = values.yearsToConvert + 1; year <= yearsAfterConversion; year++) {
      const age = values.currentAge + year - 1;
      
      // Apply growth to both accounts
      traditionalBalance *= (1 + values.expectedReturn / 100);
      rothBalance *= (1 + values.expectedReturn / 100);

      scenarios.push({
        year,
        age,
        conversionAmount: 0,
        taxCost: 0,
        traditionalBalance,
        rothBalance,
        totalTaxPaid,
        netWorth: traditionalBalance + rothBalance,
      });
    }

    return scenarios;
  };

  const onSubmit = (values: RothConversionFormValues) => {
    if (values.retirementAge <= values.currentAge) {
      toast({
        title: "Invalid Input",
        description: "Retirement age must be greater than current age.",
        variant: "destructive",
      });
      return;
    }

    const calculatedScenarios = calculateConversionScenarios(values);
    setScenarios(calculatedScenarios);
    setShowResults(true);

    toast({
      title: "Analysis Complete",
      description: `Calculated ${calculatedScenarios.length} years of conversion scenarios.`,
    });
  };

  const handleSavePlan = () => {
    if (scenarios.length === 0) {
      toast({
        title: "No Plan to Save",
        description: "Please calculate a conversion strategy first.",
        variant: "destructive",
      });
      return;
    }

    const formValues = form.getValues();
    const planData = {
      userId,
      planName: `Roth Conversion Plan - ${new Date().toLocaleDateString()}`,
      currentAge: formValues.currentAge,
      retirementAge: formValues.retirementAge,
      traditionalIraBalance: formValues.traditionalIraBalance,
      currentTaxRate: formValues.currentTaxRate,
      expectedRetirementTaxRate: formValues.expectedRetirementTaxRate,
      annualIncome: formValues.annualIncome,
      conversionAmount: formValues.conversionAmount,
      yearsToConvert: formValues.yearsToConvert,
      expectedReturn: formValues.expectedReturn,
      notes: `Roth conversion plan created on ${new Date().toLocaleDateString()}`,
    };

    savePlanMutation.mutate(planData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTaxBracketColor = (rate: number) => {
    if (rate <= 12) return "bg-green-100 text-green-800";
    if (rate <= 22) return "bg-blue-100 text-blue-800";
    if (rate <= 24) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Roth Conversion Calculator
            </CardTitle>
            <CardDescription>
              Calculate the tax implications and benefits of converting traditional IRA funds to Roth IRA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentAge">Current Age</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    {...form.register("currentAge")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retirementAge">Retirement Age</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    {...form.register("retirementAge")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="traditionalIraBalance">Traditional IRA Balance</Label>
                <Input
                  id="traditionalIraBalance"
                  type="number"
                  {...form.register("traditionalIraBalance")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualIncome">Current Annual Income</Label>
                <Input
                  id="annualIncome"
                  type="number"
                  {...form.register("annualIncome")}
                />
                <div className="text-sm text-gray-500">
                  Current tax bracket:{" "}
                  <Badge className={getTaxBracketColor(form.watch("currentTaxRate"))}>
                    {formatPercentage(form.watch("currentTaxRate"))}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversionAmount">Total Conversion Amount</Label>
                <Input
                  id="conversionAmount"
                  type="number"
                  {...form.register("conversionAmount")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsToConvert">Years to Spread Conversion</Label>
                <Input
                  id="yearsToConvert"
                  type="number"
                  {...form.register("yearsToConvert")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedRetirementTaxRate">
                  Expected Retirement Tax Rate ({formatPercentage(form.watch("expectedRetirementTaxRate"))})
                </Label>
                <Slider
                  min={0}
                  max={37}
                  step={1}
                  value={[form.watch("expectedRetirementTaxRate")]}
                  onValueChange={(values) => form.setValue("expectedRetirementTaxRate", values[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedReturn">
                  Expected Annual Return ({formatPercentage(form.watch("expectedReturn"))})
                </Label>
                <Slider
                  min={0}
                  max={15}
                  step={0.5}
                  value={[form.watch("expectedReturn")]}
                  onValueChange={(values) => form.setValue("expectedReturn", values[0])}
                />
              </div>

              <Button type="submit" className="w-full">
                Calculate Conversion Strategy
              </Button>
              
              {showResults && scenarios.length > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleSavePlan}
                  disabled={savePlanMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savePlanMutation.isPending ? "Saving..." : "Save Plan"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Roth conversions are most beneficial when you expect to be in a higher tax bracket in retirement.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-medium">When to Consider Roth Conversions:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>During low-income years (early retirement, job loss)</li>
                <li>Before Required Minimum Distributions (RMDs) begin</li>
                <li>When you expect higher tax rates in retirement</li>
                <li>To reduce future RMD amounts</li>
                <li>To leave tax-free inheritance to heirs</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Important Considerations:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Conversions are taxable in the year they occur</li>
                <li>Consider spreading conversions over multiple years</li>
                <li>Monitor your tax bracket to avoid pushing into higher rates</li>
                <li>Factor in other income sources (Social Security, pensions)</li>
                <li>Consider state tax implications</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {showResults && scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Conversion Analysis Results
            </CardTitle>
            <CardDescription>
              Projected outcomes of your Roth conversion strategy over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chart">Portfolio Growth</TabsTrigger>
                <TabsTrigger value="taxes">Tax Analysis</TabsTrigger>
                <TabsTrigger value="comparison">Before vs After</TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="mt-4">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scenarios}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="traditionalBalance"
                        name="Traditional IRA"
                        stroke="#1E88E5"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="rothBalance"
                        name="Roth IRA"
                        stroke="#43A047"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="netWorth"
                        name="Total Net Worth"
                        stroke="#9C27B0"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="taxes" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scenarios.filter(s => s.conversionAmount > 0)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                        <Bar dataKey="conversionAmount" name="Conversion Amount" fill="#1E88E5" />
                        <Bar dataKey="taxCost" name="Tax Cost" fill="#F44336" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900">Total Tax Paid</h3>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatCurrency(scenarios[scenarios.length - 1]?.totalTaxPaid || 0)}
                      </div>
                      <p className="text-sm text-blue-700">
                        Over {form.getValues("yearsToConvert")} years of conversions
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-900">Final Roth Balance</h3>
                      <div className="text-2xl font-bold text-green-900">
                        {formatCurrency(scenarios[scenarios.length - 1]?.rothBalance || 0)}
                      </div>
                      <p className="text-sm text-green-700">
                        Tax-free withdrawals in retirement
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Without Roth Conversion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500">Traditional IRA at Retirement</div>
                          <div className="text-xl font-bold">
                            {formatCurrency(
                              form.getValues("traditionalIraBalance") * 
                              Math.pow(1 + form.getValues("expectedReturn") / 100, 
                                form.getValues("retirementAge") - form.getValues("currentAge")
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Tax on Withdrawals</div>
                          <div className="text-xl font-bold text-red-600">
                            {formatCurrency(
                              (form.getValues("traditionalIraBalance") * 
                              Math.pow(1 + form.getValues("expectedReturn") / 100, 
                                form.getValues("retirementAge") - form.getValues("currentAge")
                              )) * (form.getValues("expectedRetirementTaxRate") / 100)
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>With Roth Conversion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500">Traditional IRA at Retirement</div>
                          <div className="text-xl font-bold">
                            {formatCurrency(scenarios[scenarios.length - 1]?.traditionalBalance || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Roth IRA at Retirement</div>
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(scenarios[scenarios.length - 1]?.rothBalance || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Tax Already Paid</div>
                          <div className="text-xl font-bold text-blue-600">
                            {formatCurrency(scenarios[scenarios.length - 1]?.totalTaxPaid || 0)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RothConversionCalculator; 