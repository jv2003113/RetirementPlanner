import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { User, RetirementGoal } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Form schema for profile
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  currentAge: z.coerce.number().min(18, "Age must be at least 18").max(100, "Age must be less than 100"),
  targetRetirementAge: z.coerce.number().min(50, "Retirement age must be at least 50").max(100, "Retirement age must be less than 100"),
  currentLocation: z.string().optional(),
  maritalStatus: z.string().optional(),
  dependents: z.coerce.number().min(0, "Dependents cannot be negative").optional(),
  currentIncome: z.string().transform((val) => val === "" ? "0" : val), // Handle as string for API compatibility
  expectedFutureIncome: z.string().optional().transform((val) => val === "" ? "0" : val), // Handle as string for API compatibility
  desiredLifestyle: z.string().optional(),
  hasSpouse: z.boolean().default(false),
  spouseFirstName: z.string().optional(),
  spouseLastName: z.string().optional(),
  spouseCurrentAge: z.coerce.number().min(18).max(100).optional(),
  spouseTargetRetirementAge: z.coerce.number().min(50).max(100).optional(),
  spouseCurrentIncome: z.string().optional().transform((val) => val === "" ? "0" : val),
  spouseExpectedFutureIncome: z.string().optional().transform((val) => val === "" ? "0" : val),
});

// Form schema for retirement goals
const goalFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  frequency: z.string().min(1, "Frequency is required"),
  targetMonthlyIncome: z.string().transform((val) => val === "" ? "0" : val),  // Handle as string for API compatibility
  description: z.string().min(1, "Description is required"),
  priority: z.coerce.number().min(1, "Priority must be at least 1").max(5, "Priority cannot exceed 5"),
});

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingGoal, setEditingGoal] = useState<any | null>(null);
  const { toast } = useToast();
  const userId = 1; // For demo purposes

  // Fetch user profile data
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  // Fetch retirement goals
  const { data: goalsData, isLoading: isLoadingGoals } = useQuery<RetirementGoal[]>({
    queryKey: [`/api/users/${userId}/retirement-goals`],
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create retirement goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/retirement-goals", {
        ...data,
        userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/retirement-goals`] });
      goalForm.reset();
      toast({
        title: "Goal Created",
        description: "Your retirement goal has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update and delete goal mutations
  const updateGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/retirement-goals/${editingGoal.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/retirement-goals`] });
      setEditingGoal(null);
      goalForm.reset();
      toast({
        title: "Goal Updated",
        description: "Your retirement goal has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      return await apiRequest("DELETE", `/api/retirement-goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/retirement-goals`] });
      toast({
        title: "Goal Deleted",
        description: "Your retirement goal has been deleted.",
      });
      if (editingGoal) {
        setEditingGoal(null);
        goalForm.reset();
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      currentAge: 0,
      targetRetirementAge: 0,
      currentLocation: "",
      maritalStatus: "",
      dependents: 0,
      currentIncome: "0", // String for API compatibility
      expectedFutureIncome: "0", // String for API compatibility
      desiredLifestyle: "",
      hasSpouse: false,
      spouseFirstName: "",
      spouseLastName: "",
      spouseCurrentAge: undefined,
      spouseTargetRetirementAge: undefined,
      spouseCurrentIncome: "0",
      spouseExpectedFutureIncome: "0",
    },
  });

  // Goal form
  const goalForm = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      category: "",
      frequency: "monthly", // Default to monthly
      targetMonthlyIncome: "0", // String for API compatibility
      description: "",
      priority: 3,
    },
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (userData) {
      profileForm.reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        currentAge: userData.currentAge || 0,
        targetRetirementAge: userData.targetRetirementAge || 65,
        currentLocation: userData.currentLocation || "",
        maritalStatus: userData.maritalStatus || "",
        dependents: userData.dependents || 0,
        currentIncome: String(userData.currentIncome || "0"), // Convert to string
        expectedFutureIncome: String(userData.expectedFutureIncome || "0"), // Convert to string
        desiredLifestyle: userData.desiredLifestyle || "",
        hasSpouse: userData.hasSpouse || false,
        spouseFirstName: userData.spouseFirstName || "",
        spouseLastName: userData.spouseLastName || "",
        spouseCurrentAge: userData.spouseCurrentAge || undefined,
        spouseTargetRetirementAge: userData.spouseTargetRetirementAge || undefined,
        spouseCurrentIncome: String(userData.spouseCurrentIncome || "0"),
        spouseExpectedFutureIncome: String(userData.spouseExpectedFutureIncome || "0"),
      });
    }
  }, [userData]);

  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(values);
  };

  const onGoalSubmit = (values: z.infer<typeof goalFormSchema>) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ ...values, userId });
    } else {
      createGoalMutation.mutate(values);
    }
  };

  if (isLoadingUser || isLoadingGoals) {
    return (
      <div className="py-4">
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-[600px] mb-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Profile & Goals</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your personal information and retirement goals.</p>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Personal Profile</TabsTrigger>
          <TabsTrigger value="goals">Retirement Goals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences for retirement planning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="currentAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Age</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="targetRetirementAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Retirement Age</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="currentLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marital Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select marital status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                              <SelectItem value="widowed">Widowed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="dependents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Dependents</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="currentIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Annual Income ($)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="expectedFutureIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Future Income ($)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="desiredLifestyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired Retirement Lifestyle</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lifestyle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="frugal">Frugal</SelectItem>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                            <SelectItem value="luxurious">Luxurious</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="hasSpouse"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-2">
                        <div className="space-y-0.5">
                          <FormLabel>Include Spouse in Retirement Planning</FormLabel>
                          <FormDescription>
                            Enable this if you want to include your spouse's information in your retirement plan.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {profileForm.watch("hasSpouse") && (
                    <div className="border rounded-lg p-4 bg-slate-50 mt-2">
                      <div className="font-medium mb-2">Spouse Information</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="spouseFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spouse First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="spouseLastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spouse Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <FormField
                          control={profileForm.control}
                          name="spouseCurrentAge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spouse Current Age</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="spouseTargetRetirementAge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spouse Target Retirement Age</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <FormField
                          control={profileForm.control}
                          name="spouseCurrentIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spouse Current Annual Income ($)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="spouseExpectedFutureIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spouse Expected Future Income ($)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals" className="mt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Retirement Goal</CardTitle>
                <CardDescription>
                  Define specific goals for your retirement planning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...goalForm}>
                  <form onSubmit={goalForm.handleSubmit(onGoalSubmit)} className="space-y-4">
                    <FormField
                      control={goalForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedCategory(value);
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="income">Income</SelectItem>
                              <SelectItem value="travel">Travel</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="housing">Housing</SelectItem>
                              <SelectItem value="hobbies">Hobbies</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Select the type of retirement goal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={goalForm.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                              <SelectItem value="one-time">One-time</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>How often you'll spend on this goal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={goalForm.control}
                      name="targetMonthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {selectedCategory === "income" 
                              ? "Target Income ($)" 
                              : selectedCategory === "travel" || selectedCategory === "hobbies" || selectedCategory === "education"
                                ? "Estimated Cost ($)"
                                : selectedCategory === "healthcare" || selectedCategory === "housing"
                                  ? "Estimated Cost ($)"
                                  : "Estimated Amount ($)"}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormDescription>
                            {selectedCategory === "income" 
                              ? "Your desired income during retirement"
                              : selectedCategory === "travel" || selectedCategory === "hobbies" || selectedCategory === "education"
                                ? "The amount you expect to spend on this goal"
                                : selectedCategory === "healthcare" || selectedCategory === "housing" 
                                  ? "Your estimated expenses for this category"
                                  : "The amount you expect to allocate for this goal"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={goalForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={goalForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority (1-5)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="5" />
                          </FormControl>
                          <FormDescription>1 = Highest Priority, 5 = Lowest Priority</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                    >
                      {editingGoal
                        ? (updateGoalMutation.isPending ? "Saving..." : "Save Changes")
                        : (createGoalMutation.isPending ? "Adding Goal..." : "Add Goal")}
                    </Button>
                    {editingGoal && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                          setEditingGoal(null);
                          goalForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Retirement Goals</CardTitle>
                <CardDescription>
                  Review and manage your retirement goals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {goalsData && goalsData.length > 0 ? (
                  <div className="space-y-4">
                    {[...goalsData]
                      // Sort by priority (lowest number = highest priority)
                      .sort((a, b) => (a.priority || 5) - (b.priority || 5))
                      .map((goal: any) => (
                        <Card key={goal.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">{goal.description}</div>
                              <div className="text-sm bg-gray-100 px-2 py-1 rounded-md capitalize">
                                {goal.category}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-sm text-gray-500">
                                Priority: {goal.priority}
                              </div>
                              <div className="text-xs bg-slate-50 px-2 py-1 rounded-md capitalize">
                                {goal.frequency || 'monthly'}
                              </div>
                            </div>
                            {goal.targetMonthlyIncome && (
                              <div className="text-sm font-medium">
                                {goal.category === "income" 
                                  ? `Target Income: $${goal.targetMonthlyIncome || '0'}${goal.frequency !== 'one-time' ? `/${goal.frequency || 'monthly'}` : ''}` 
                                  : goal.category === "travel" || goal.category === "hobbies" || goal.category === "education"
                                    ? `Cost: $${goal.targetMonthlyIncome || '0'}${goal.frequency !== 'one-time' ? ` (${goal.frequency || 'monthly'})` : ''}`
                                    : goal.category === "healthcare" || goal.category === "housing" 
                                      ? `Cost: $${goal.targetMonthlyIncome || '0'}${goal.frequency !== 'one-time' ? `/${goal.frequency || 'monthly'}` : ''}`
                                      : `Amount: $${goal.targetMonthlyIncome || '0'}${goal.frequency !== 'one-time' ? ` (${goal.frequency || 'monthly'})` : ''}`}
                              </div>
                            )}
                            <div className="flex gap-2 mt-4">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingGoal(goal);
                                  setSelectedCategory(goal.category);
                                  goalForm.reset({
                                    category: goal.category,
                                    frequency: goal.frequency,
                                    targetMonthlyIncome: String(goal.targetMonthlyIncome || "0"),
                                    description: goal.description,
                                    priority: goal.priority,
                                  });
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this goal?")) {
                                    deleteGoalMutation.mutate(goal.id);
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No retirement goals added yet. Add your first goal to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
