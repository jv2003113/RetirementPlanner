import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { runMonteCarloSimulation, MonteCarloParams, MonteCarloResult } from "@/lib/monte-carlo";

// Simulation form schema
const simulationFormSchema = z.object({
  currentAge: z.coerce.number().min(18, "Age must be at least 18").max(100, "Age must be no more than 100"),
  retirementAge: z.coerce.number().min(50, "Retirement age must be at least 50").max(100, "Retirement age must be no more than 100"),
  lifeExpectancy: z.coerce.number().min(50, "Life expectancy must be at least 50").max(120, "Life expectancy must be no more than 120"),
  initialBalance: z.coerce.number().min(0, "Initial balance cannot be negative"),
  annualContribution: z.coerce.number().min(0, "Annual contribution cannot be negative"),
  desiredAnnualIncome: z.coerce.number().min(0, "Desired annual income cannot be negative"),
  simulationRuns: z.coerce.number().min(100, "At least 100 simulation runs required").max(10000, "Maximum 10,000 simulation runs allowed"),
  inflationRate: z.coerce.number().min(0, "Inflation rate cannot be negative").max(0.2, "Inflation rate must be less than 20%"),
  meanReturn: z.coerce.number().min(-0.1, "Mean return must be greater than -10%").max(0.25, "Mean return must be less than 25%"),
  standardDeviation: z.coerce.number().min(0.01, "Standard deviation must be positive").max(0.5, "Standard deviation must be less than 50%"),
  includePreRetirement: z.boolean().default(true),
  adjustWithdrawalsForInflation: z.boolean().default(true),
  socialSecurityIncome: z.coerce.number().min(0, "Social Security income cannot be negative"),
  otherIncome: z.coerce.number().min(0, "Other income cannot be negative"),
});

type SimulationFormValues = z.infer<typeof simulationFormSchema>;

interface MonteCarloSimulationProps {
  userId: number;
}

const MonteCarloSimulation = ({ userId }: MonteCarloSimulationProps) => {
  const { toast } = useToast();
  const [simulationResult, setSimulationResult] = useState<MonteCarloResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("chart");
  
  // Fetch user data and investment accounts
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const { data: accountsData, isLoading: isAccountsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/investment-accounts`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Type declaration for user data
  interface UserData {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    age?: number;
    retirementAge?: number;
  }
  
  // Calculate total portfolio value
  const calculateTotalPortfolio = () => {
    if (!accountsData || !Array.isArray(accountsData)) return 0;
    return accountsData.reduce((total, account) => total + Number(account.balance), 0);
  };
  
  // Calculate total annual contributions
  const calculateAnnualContributions = () => {
    if (!accountsData || !Array.isArray(accountsData)) return 0;
    
    // Convert contribution frequencies to annual multipliers
    const frequencyMultipliers: Record<string, number> = {
      monthly: 12,
      bi_weekly: 26,
      weekly: 52,
      quarterly: 4,
      annually: 1,
      none: 0
    };
    
    return accountsData.reduce((total, account) => {
      const frequency = account.contributionFrequency || 'none';
      const multiplier = frequencyMultipliers[frequency] || 0;
      return total + (Number(account.contributionAmount) * multiplier);
    }, 0);
  };
  
  // Create form
  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: {
      currentAge: (userData as UserData)?.age || 35,
      retirementAge: 65,
      lifeExpectancy: 90,
      initialBalance: calculateTotalPortfolio(),
      annualContribution: calculateAnnualContributions(),
      desiredAnnualIncome: 70000,
      simulationRuns: 1000,
      inflationRate: 0.025,
      meanReturn: 0.07,
      standardDeviation: 0.15,
      includePreRetirement: true,
      adjustWithdrawalsForInflation: true,
      socialSecurityIncome: 24000, // Default $2000/month
      otherIncome: 0,
    },
  });
  
  // Update form values when user data and accounts data are loaded
  useEffect(() => {
    if (!isUserLoading && !isAccountsLoading && userData && accountsData) {
      form.setValue('initialBalance', calculateTotalPortfolio());
      form.setValue('annualContribution', calculateAnnualContributions());
      const typedUserData = userData as UserData;
      if (typedUserData.age) {
        form.setValue('currentAge', typedUserData.age);
      }
    }
  }, [userData, accountsData, isUserLoading, isAccountsLoading, form]);
  
  // Run simulation
  const runSimulation = (values: SimulationFormValues) => {
    setIsRunning(true);
    
    // Convert form values to simulation parameters
    const params: MonteCarloParams = {
      currentAge: values.currentAge,
      retirementAge: values.retirementAge,
      lifeExpectancy: values.lifeExpectancy,
      initialBalance: values.initialBalance,
      annualContribution: values.annualContribution,
      desiredAnnualIncome: values.desiredAnnualIncome,
      simulationRuns: values.simulationRuns,
      inflationRate: values.inflationRate,
      historicalReturns: {
        mean: values.meanReturn,
        standardDeviation: values.standardDeviation,
      },
      includePreRetirement: values.includePreRetirement,
      adjustWithdrawalsForInflation: values.adjustWithdrawalsForInflation,
      socialSecurityIncome: values.socialSecurityIncome,
      otherIncome: values.otherIncome,
    };
    
    // Use setTimeout to prevent UI from freezing during computation
    setTimeout(() => {
      try {
        const result = runMonteCarloSimulation(params);
        setSimulationResult(result);
        toast({
          title: "Simulation Complete",
          description: `Ran ${values.simulationRuns} simulations with a ${(result.successRate * 100).toFixed(1)}% success rate.`,
        });
      } catch (error) {
        console.error('Error running simulation:', error);
        toast({
          title: "Simulation Error",
          description: "An error occurred while running the simulation. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsRunning(false);
      }
    }, 100);
  };
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Format percentage for display
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Format number for display
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  // Get success rate color based on the rate
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.85) return "bg-green-100 text-green-800";
    if (rate >= 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  
  // Prepare data for charts
  const prepareChartData = () => {
    if (!simulationResult) return [];
    
    const { confidenceIntervals } = simulationResult;
    const { optimistic, median, pessimistic } = confidenceIntervals;
    
    // Find the maximum length among the three arrays
    const maxLength = Math.max(
      optimistic.length,
      median.length,
      pessimistic.length
    );
    
    // Create an array of chart data points
    return Array.from({ length: maxLength }).map((_, i) => ({
      year: i,
      age: (optimistic[i]?.age || median[i]?.age || pessimistic[i]?.age) || 0,
      optimistic: optimistic[i]?.portfolioValue || 0,
      median: median[i]?.portfolioValue || 0,
      pessimistic: pessimistic[i]?.portfolioValue || 0,
    }));
  };
  
  const chartData = prepareChartData();
  
  // Submit handler
  const onSubmit = (values: SimulationFormValues) => {
    // Validate retirement age is greater than current age
    if (values.retirementAge <= values.currentAge) {
      form.setError("retirementAge", {
        type: "manual",
        message: "Retirement age must be greater than current age",
      });
      return;
    }
    
    // Validate life expectancy is greater than retirement age
    if (values.lifeExpectancy <= values.retirementAge) {
      form.setError("lifeExpectancy", {
        type: "manual",
        message: "Life expectancy must be greater than retirement age",
      });
      return;
    }
    
    runSimulation(values);
  };
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Monte Carlo Retirement Simulation
          </CardTitle>
          <CardDescription>
            Project your retirement portfolio under different market conditions using Monte Carlo simulation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="currentAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Age</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="retirementAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retirement Age</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lifeExpectancy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Life Expectancy</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Simulation Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="simulationRuns"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Simulations</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select number of simulations" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="100">100 (Fast)</SelectItem>
                                <SelectItem value="500">500</SelectItem>
                                <SelectItem value="1000">1000 (Recommended)</SelectItem>
                                <SelectItem value="5000">5000</SelectItem>
                                <SelectItem value="10000">10000 (Slow)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            More simulations give better results but take longer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="includePreRetirement"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0">
                            <FormLabel>Include Pre-Retirement</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="adjustWithdrawalsForInflation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0">
                            <FormLabel>Adjust Withdrawals for Inflation</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="initialBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Portfolio Value ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Total value of all your investment accounts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="annualContribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Contribution ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Total amount you contribute to all accounts yearly
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="desiredAnnualIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desired Retirement Income ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Annual income needed in retirement
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Market Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="meanReturn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Annual Return ({formatPercentage(field.value)})</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={0.15}
                              step={0.005}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Average annual portfolio return (historical S&P 500: ~7%)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="standardDeviation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Market Volatility ({formatPercentage(field.value)})</FormLabel>
                          <FormControl>
                            <Slider
                              min={0.05}
                              max={0.25}
                              step={0.01}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Standard deviation of returns (higher = more volatile)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="inflationRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inflation Rate ({formatPercentage(field.value)})</FormLabel>
                          <FormControl>
                            <Slider
                              min={0.01}
                              max={0.04}
                              step={0.0025}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Expected annual inflation rate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Additional Income</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="socialSecurityIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Social Security Income ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Expected annual Social Security benefits
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="otherIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Other Income ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Income from part-time work, pension, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isRunning}
                  size="lg"
                >
                  {isRunning ? "Running Simulation..." : "Run Monte Carlo Simulation"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {simulationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
            <CardDescription>
              Based on {formatNumber(simulationResult.simulationRuns.length)} simulated market scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Success Rate</div>
                <div className="flex items-center">
                  <Badge className={getSuccessRateColor(simulationResult.successRate)}>
                    {formatPercentage(simulationResult.successRate)}
                  </Badge>
                  <span className="text-sm ml-2">
                    ({Math.round(simulationResult.successRate * simulationResult.simulationRuns.length)} out of {simulationResult.simulationRuns.length})
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Scenarios where funds lasted through retirement
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Median Final Balance</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(simulationResult.medianEndBalance)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  At the end of retirement (50th percentile)
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Balance Range</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(simulationResult.minimumBalance)} - {formatCurrency(simulationResult.maximumBalance)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Min to max final portfolio values
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="chart">Portfolio Projection</TabsTrigger>
                <TabsTrigger value="details">Simulation Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="pt-4">
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="age" 
                        label={{ value: 'Age', position: 'insideBottomRight', offset: 0 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value.toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })}`}
                        label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
                      />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(value) => `Age: ${value}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="optimistic" 
                        name="Optimistic (90%)" 
                        stroke="#22c55e" 
                        fillOpacity={1} 
                        fill="url(#colorOptimistic)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="median" 
                        name="Median (50%)" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorMedian)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="pessimistic" 
                        name="Pessimistic (10%)" 
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#colorPessimistic)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Input Parameters</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-slate-500">Current Age:</div>
                        <div className="text-sm font-medium">{form.getValues().currentAge}</div>
                        
                        <div className="text-sm text-slate-500">Retirement Age:</div>
                        <div className="text-sm font-medium">{form.getValues().retirementAge}</div>
                        
                        <div className="text-sm text-slate-500">Life Expectancy:</div>
                        <div className="text-sm font-medium">{form.getValues().lifeExpectancy}</div>
                        
                        <div className="text-sm text-slate-500">Initial Portfolio:</div>
                        <div className="text-sm font-medium">{formatCurrency(form.getValues().initialBalance)}</div>
                        
                        <div className="text-sm text-slate-500">Annual Contribution:</div>
                        <div className="text-sm font-medium">{formatCurrency(form.getValues().annualContribution)}</div>
                        
                        <div className="text-sm text-slate-500">Desired Income:</div>
                        <div className="text-sm font-medium">{formatCurrency(form.getValues().desiredAnnualIncome)}</div>
                        
                        <div className="text-sm text-slate-500">Expected Return:</div>
                        <div className="text-sm font-medium">{formatPercentage(form.getValues().meanReturn)}</div>
                        
                        <div className="text-sm text-slate-500">Market Volatility:</div>
                        <div className="text-sm font-medium">{formatPercentage(form.getValues().standardDeviation)}</div>
                        
                        <div className="text-sm text-slate-500">Inflation Rate:</div>
                        <div className="text-sm font-medium">{formatPercentage(form.getValues().inflationRate)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Success Analysis</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-slate-500">Minimum Balance:</div>
                        <div className="text-sm font-medium">{formatCurrency(simulationResult.minimumBalance)}</div>
                        
                        <div className="text-sm text-slate-500">Maximum Balance:</div>
                        <div className="text-sm font-medium">{formatCurrency(simulationResult.maximumBalance)}</div>
                        
                        <div className="text-sm text-slate-500">Median Balance:</div>
                        <div className="text-sm font-medium">{formatCurrency(simulationResult.medianEndBalance)}</div>
                        
                        <div className="text-sm text-slate-500">Retirement Length:</div>
                        <div className="text-sm font-medium">
                          {form.getValues().lifeExpectancy - form.getValues().retirementAge} years
                        </div>
                        
                        <div className="text-sm text-slate-500">Social Security:</div>
                        <div className="text-sm font-medium">
                          {formatCurrency(form.getValues().socialSecurityIncome)}/year
                        </div>
                        
                        <div className="text-sm text-slate-500">Other Income:</div>
                        <div className="text-sm font-medium">
                          {formatCurrency(form.getValues().otherIncome)}/year
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Interpretation</h3>
                    
                    {simulationResult.successRate >= 0.85 ? (
                      <Alert className="bg-green-50 border-green-200">
                        <AlertTitle className="text-green-800">High Success Rate: {formatPercentage(simulationResult.successRate)}</AlertTitle>
                        <AlertDescription className="text-green-700">
                          Your retirement plan has a high probability of success. Your savings and investment strategy appears to be on track to meet your retirement goals.
                        </AlertDescription>
                      </Alert>
                    ) : simulationResult.successRate >= 0.7 ? (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertTitle className="text-yellow-800">Moderate Success Rate: {formatPercentage(simulationResult.successRate)}</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                          Your retirement plan has a moderate chance of success. Consider increasing your savings rate, adjusting your retirement age, or reducing your desired retirement income to improve your odds.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertTitle className="text-red-800">Low Success Rate: {formatPercentage(simulationResult.successRate)}</AlertTitle>
                        <AlertDescription className="text-red-700">
                          Your current plan has a high risk of running out of funds during retirement. Consider significant adjustments to your savings rate, retirement age, or desired retirement income.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="text-sm mt-4">
                      <p><strong>What this means:</strong> Monte Carlo simulation uses randomization to model the uncertainty in market returns. The simulation was run {formatNumber(simulationResult.simulationRuns.length)} times with different potential market conditions.</p>
                      <p className="mt-2"><strong>Success rate</strong> represents the percentage of scenarios where your money lasts through your expected retirement duration.</p>
                      <p className="mt-2"><strong>Confidence intervals</strong> shown on the chart represent the range of potential outcomes:</p>
                      <ul className="list-disc list-inside mt-1 ml-4">
                        <li className="text-green-600">Optimistic (90th percentile): Better than 90% of simulated outcomes</li>
                        <li className="text-blue-600">Median (50th percentile): Middle of all simulated outcomes</li>
                        <li className="text-red-600">Pessimistic (10th percentile): Worse than 90% of simulated outcomes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MonteCarloSimulation;