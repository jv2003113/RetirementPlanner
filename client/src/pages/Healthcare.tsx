import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { HeartPulse, Activity, Stethoscope, Pill, BadgeAlert, CheckCircle } from "lucide-react";

const healthcareEstimatorSchema = z.object({
  currentAge: z.coerce.number().min(40, "Age must be at least 40").max(100, "Age must be less than 100"),
  retirementAge: z.coerce.number().min(55, "Retirement age must be at least 55").max(75, "Retirement age must be less than 75"),
  healthStatus: z.enum(["excellent", "good", "fair", "poor"]),
  hasMedicalConditions: z.boolean().default(false),
  hasLongevityHistory: z.boolean().default(false),
  anticipatedHealthcareNeeds: z.enum(["low", "moderate", "high"]),
  desiredCoverageLevel: z.coerce.number().min(1).max(10),
});

type HealthcareEstimatorValues = z.infer<typeof healthcareEstimatorSchema>;

const Healthcare = () => {
  const [activeTab, setActiveTab] = useState("estimator");
  
  // Example health expense data for visualization
  const [healthExpenses, setHealthExpenses] = useState([
    { name: "Medicare Premiums", value: 170 * 12, color: "#1E88E5" },
    { name: "Supplemental Insurance", value: 200 * 12, color: "#43A047" },
    { name: "Out-of-Pocket Costs", value: 150 * 12, color: "#FFA000" },
    { name: "Dental & Vision", value: 80 * 12, color: "#9C27B0" },
    { name: "Prescription Drugs", value: 120 * 12, color: "#F44336" },
  ]);

  // For the healthcare estimator
  const form = useForm<HealthcareEstimatorValues>({
    resolver: zodResolver(healthcareEstimatorSchema),
    defaultValues: {
      currentAge: 40,
      retirementAge: 67,
      healthStatus: "good",
      hasMedicalConditions: false,
      hasLongevityHistory: false,
      anticipatedHealthcareNeeds: "moderate",
      desiredCoverageLevel: 7,
    },
  });

  // Calculate healthcare cost estimates based on form values
  const calculateHealthcareCosts = (values: HealthcareEstimatorValues) => {
    // Base monthly costs
    const baseMedicarePremium = 170;
    const baseSupplementalInsurance = 200;
    const baseOutOfPocket = 150;
    const baseDentalVision = 80;
    const basePrescriptionDrugs = 120;
    
    // Multipliers based on health status
    let healthMultiplier = 1.0;
    switch (values.healthStatus) {
      case "excellent": healthMultiplier = 0.8; break;
      case "good": healthMultiplier = 1.0; break;
      case "fair": healthMultiplier = 1.3; break;
      case "poor": healthMultiplier = 1.6; break;
    }
    
    // Adjustments for medical conditions and longevity
    if (values.hasMedicalConditions) healthMultiplier += 0.2;
    if (values.hasLongevityHistory) healthMultiplier += 0.1;
    
    // Adjustments for anticipated needs
    let needsMultiplier = 1.0;
    switch (values.anticipatedHealthcareNeeds) {
      case "low": needsMultiplier = 0.8; break;
      case "moderate": needsMultiplier = 1.0; break;
      case "high": needsMultiplier = 1.4; break;
    }
    
    // Adjustments for desired coverage level (1-10 scale)
    const coverageMultiplier = 0.7 + (values.desiredCoverageLevel * 0.05);
    
    // Calculate adjusted monthly costs
    const adjustedMedicarePremium = baseMedicarePremium * healthMultiplier;
    const adjustedSupplementalInsurance = baseSupplementalInsurance * healthMultiplier * coverageMultiplier;
    const adjustedOutOfPocket = baseOutOfPocket * healthMultiplier * needsMultiplier;
    const adjustedDentalVision = baseDentalVision * coverageMultiplier;
    const adjustedPrescriptionDrugs = basePrescriptionDrugs * healthMultiplier * needsMultiplier;
    
    // Update the health expenses state for the chart
    setHealthExpenses([
      { name: "Medicare Premiums", value: Math.round(adjustedMedicarePremium * 12), color: "#1E88E5" },
      { name: "Supplemental Insurance", value: Math.round(adjustedSupplementalInsurance * 12), color: "#43A047" },
      { name: "Out-of-Pocket Costs", value: Math.round(adjustedOutOfPocket * 12), color: "#FFA000" },
      { name: "Dental & Vision", value: Math.round(adjustedDentalVision * 12), color: "#9C27B0" },
      { name: "Prescription Drugs", value: Math.round(adjustedPrescriptionDrugs * 12), color: "#F44336" },
    ]);
    
    // Return total monthly and annual costs
    const monthlyTotal = adjustedMedicarePremium + adjustedSupplementalInsurance + 
                          adjustedOutOfPocket + adjustedDentalVision + adjustedPrescriptionDrugs;
    const annualTotal = monthlyTotal * 12;
    
    return {
      monthlyTotal: Math.round(monthlyTotal),
      annualTotal: Math.round(annualTotal),
      lifetimeTotal: Math.round(annualTotal * (95 - values.retirementAge))
    };
  };

  const onSubmit = (values: HealthcareEstimatorValues) => {
    const estimates = calculateHealthcareCosts(values);
    setCostEstimates(estimates);
  };

  // Calculate costs based on current form values using useEffect to prevent infinite re-renders
  const [costEstimates, setCostEstimates] = useState({
    monthlyTotal: 720,
    annualTotal: 8640,
    lifetimeTotal: 241920
  });
  
  // Only recalculate when the component mounts
  useEffect(() => {
    const estimates = calculateHealthcareCosts(form.getValues());
    setCostEstimates(estimates);
  }, []);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Healthcare Planning</h1>
        <p className="mt-1 text-sm text-gray-600">
          Plan for healthcare costs in retirement and understand your Medicare options.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Estimated Monthly Healthcare Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(costEstimates.monthlyTotal)}
            </div>
            <p className="text-sm text-gray-500 mt-1">in retirement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Estimated Annual Healthcare Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(costEstimates.annualTotal)}
            </div>
            <p className="text-sm text-gray-500 mt-1">in retirement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Lifetime Healthcare Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(costEstimates.lifetimeTotal)}
            </div>
            <p className="text-sm text-gray-500 mt-1">estimated until age 95</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="estimator" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estimator">Cost Estimator</TabsTrigger>
          <TabsTrigger value="medicare">Medicare Basics</TabsTrigger>
          <TabsTrigger value="strategies">Cost-Saving Strategies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="estimator" className="mt-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Healthcare Cost Estimator</CardTitle>
                <CardDescription>
                  Estimate your healthcare costs in retirement based on your personal factors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="healthStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Health Status</FormLabel>
                          <div className="grid grid-cols-4 gap-2">
                            <Button
                              type="button"
                              variant={field.value === "excellent" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => form.setValue("healthStatus", "excellent")}
                            >
                              Excellent
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "good" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => form.setValue("healthStatus", "good")}
                            >
                              Good
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "fair" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => form.setValue("healthStatus", "fair")}
                            >
                              Fair
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "poor" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => form.setValue("healthStatus", "poor")}
                            >
                              Poor
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hasMedicalConditions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Existing Medical Conditions</FormLabel>
                              <FormDescription>
                                Do you have any chronic health conditions?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hasLongevityHistory"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Family Longevity</FormLabel>
                              <FormDescription>
                                Do your parents/grandparents live past 85?
                              </FormDescription>
                            </div>
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
                    
                    <FormField
                      control={form.control}
                      name="anticipatedHealthcareNeeds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anticipated Healthcare Needs</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              type="button"
                              variant={field.value === "low" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => form.setValue("anticipatedHealthcareNeeds", "low")}
                            >
                              Low
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "moderate" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => form.setValue("anticipatedHealthcareNeeds", "moderate")}
                            >
                              Moderate
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "high" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => form.setValue("anticipatedHealthcareNeeds", "high")}
                            >
                              High
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="desiredCoverageLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desired Coverage Level: {field.value}/10</FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value]}
                              min={1}
                              max={10}
                              step={1}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Higher coverage = higher premiums but lower out-of-pocket costs
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">Update Estimates</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Healthcare Expense Breakdown</CardTitle>
                <CardDescription>
                  Estimated annual costs based on your inputs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthExpenses}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {healthExpenses.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Annual Cost:</span>
                    <span className="font-bold">{formatCurrency(costEstimates.annualTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Monthly Cost:</span>
                    <span className="font-bold">{formatCurrency(costEstimates.monthlyTotal)}</span>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Important Note</h3>
                  <p className="text-sm text-gray-700">
                    These estimates are based on current costs and may change due to inflation, 
                    policy changes, or changes in your health status. It's recommended to review 
                    and update your healthcare cost projections annually.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="medicare" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Understanding Medicare</CardTitle>
              <CardDescription>
                Learn about the different parts of Medicare and what they cover.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="bg-blue-50">
                    <div className="flex items-center">
                      <HeartPulse className="h-8 w-8 text-blue-500 mr-2" />
                      <CardTitle>Medicare Part A</CardTitle>
                    </div>
                    <CardDescription>Hospital Insurance</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Hospital inpatient care</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Skilled nursing facility care</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Hospice care</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Home health care</span>
                      </li>
                    </ul>
                    <div className="mt-4 text-sm">
                      <p><strong>Cost:</strong> Most people don't pay a premium for Part A if they or their spouse paid Medicare taxes while working.</p>
                      <p className="mt-2"><strong>Deductible:</strong> $1,600 per benefit period (2023)</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-green-50">
                    <div className="flex items-center">
                      <Stethoscope className="h-8 w-8 text-green-500 mr-2" />
                      <CardTitle>Medicare Part B</CardTitle>
                    </div>
                    <CardDescription>Medical Insurance</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Doctor visits and services</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Outpatient care</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Preventive services</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Medical equipment</span>
                      </li>
                    </ul>
                    <div className="mt-4 text-sm">
                      <p><strong>Cost:</strong> Standard premium is $164.90/month (2023), but may be higher based on income.</p>
                      <p className="mt-2"><strong>Deductible:</strong> $226 per year (2023)</p>
                      <p className="mt-2"><strong>Coinsurance:</strong> 20% of Medicare-approved amount after deductible</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-yellow-50">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-yellow-500 mr-2" />
                      <CardTitle>Medicare Part C</CardTitle>
                    </div>
                    <CardDescription>Medicare Advantage Plans</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>All Part A and Part B coverage</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Usually includes Part D (prescription coverage)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>May include additional benefits (vision, dental, hearing)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Offered by private insurance companies</span>
                      </li>
                    </ul>
                    <div className="mt-4 text-sm">
                      <p><strong>Cost:</strong> Varies by plan. You continue to pay your Part B premium plus any additional premium for the plan.</p>
                      <p className="mt-2"><strong>Network:</strong> Most plans have network restrictions (HMO or PPO)</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-purple-50">
                    <div className="flex items-center">
                      <Pill className="h-8 w-8 text-purple-500 mr-2" />
                      <CardTitle>Medicare Part D</CardTitle>
                    </div>
                    <CardDescription>Prescription Drug Coverage</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Prescription medication coverage</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Offered by private insurance companies</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Each plan has its own formulary (list of covered drugs)</span>
                      </li>
                    </ul>
                    <div className="mt-4 text-sm">
                      <p><strong>Cost:</strong> Varies by plan, national average is about $32/month (2023)</p>
                      <p className="mt-2"><strong>Coverage Gap:</strong> Also known as the "donut hole" - begins when you and your plan have spent a certain amount</p>
                      <p className="mt-2"><strong>Late Enrollment Penalty:</strong> If you don't sign up when first eligible, you may pay a permanent penalty</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <Card>
                  <CardHeader className="bg-red-50">
                    <div className="flex items-center">
                      <BadgeAlert className="h-8 w-8 text-red-500 mr-2" />
                      <CardTitle>Medicare Supplements (Medigap)</CardTitle>
                    </div>
                    <CardDescription>Additional coverage to fill "gaps" in Original Medicare</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="mb-4">
                      Medigap policies are sold by private companies and can help pay for some of the costs that Original Medicare doesn't cover, like copayments, coinsurance, and deductibles.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">Key Features:</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Standardized plans (A through N)</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Help with out-of-pocket costs</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Works with Original Medicare (not Medicare Advantage)</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Cost Considerations:</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Monthly premium in addition to Part B</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Premiums vary by plan type, company, and location</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Best time to buy is during your 6-month Medigap Open Enrollment Period</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Learn More About Medicare Options</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="strategies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Cost-Saving Strategies</CardTitle>
              <CardDescription>
                Effective approaches to manage and reduce healthcare costs in retirement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-lg">Before Retirement</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-blue-600">1</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Maximize HSA Contributions</h3>
                          <p className="text-sm mt-1">
                            Health Savings Accounts offer triple tax advantages. Contribute the maximum allowed and invest the funds for future healthcare expenses.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-blue-600">2</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Stay Healthy</h3>
                          <p className="text-sm mt-1">
                            Invest in preventive care, regular exercise, and a healthy diet. Better health now can lead to lower healthcare costs in retirement.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-blue-600">3</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Budget for Healthcare</h3>
                          <p className="text-sm mt-1">
                            Include healthcare costs in your retirement savings plan. Set aside funds specifically for medical expenses.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-blue-600">4</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Consider Long-Term Care Insurance</h3>
                          <p className="text-sm mt-1">
                            Purchase long-term care insurance in your 50s or early 60s when premiums are lower and before health issues arise.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="bg-green-50">
                      <CardTitle className="text-lg">During Retirement</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-green-600">1</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Choose the Right Medicare Plan</h3>
                          <p className="text-sm mt-1">
                            Compare Original Medicare with Medicare Advantage and select the option that best fits your healthcare needs and budget.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-green-600">2</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Review Coverage Annually</h3>
                          <p className="text-sm mt-1">
                            During open enrollment, review your Medicare coverage to ensure it still meets your needs and is cost-effective.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-green-600">3</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Use In-Network Providers</h3>
                          <p className="text-sm mt-1">
                            Stay within your plan's network to avoid higher out-of-pocket costs for care.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-green-600">4</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Use Prescription Savings Strategies</h3>
                          <p className="text-sm mt-1">
                            Ask about generic alternatives, use mail-order pharmacies, and check for assistance programs to save on medications.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader className="bg-amber-50">
                    <CardTitle className="text-lg">Additional Cost-Management Strategies</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Take Advantage of Preventive Services</h3>
                            <p className="text-sm mt-1">
                              Medicare covers many preventive services at no cost. Use these benefits to catch health issues early.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Consider Location</h3>
                            <p className="text-sm mt-1">
                              Healthcare costs vary significantly by location. Factor this into retirement location decisions.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Look into Veteran Benefits</h3>
                            <p className="text-sm mt-1">
                              If you're a veteran, explore VA healthcare benefits which can supplement Medicare.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Ask About Discounts</h3>
                            <p className="text-sm mt-1">
                              Many providers offer senior discounts or cash payment discounts. Don't hesitate to ask.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Check for Assistance Programs</h3>
                            <p className="text-sm mt-1">
                              Various programs help with healthcare costs, including Medicare Savings Programs and Extra Help for prescription drugs.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Review Medical Bills Carefully</h3>
                            <p className="text-sm mt-1">
                              Billing errors are common. Always review your medical bills and EOBs for accuracy.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Download Healthcare Planning Guide</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Healthcare;
