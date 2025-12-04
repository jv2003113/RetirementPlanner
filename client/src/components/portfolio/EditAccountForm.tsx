import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schema for editing an investment account
const accountFormSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  accountType: z.string().min(1, "Account type is required"),
  balance: z.coerce.number().min(0, "Balance cannot be negative"),
  contributionAmount: z.coerce.number().min(0, "Contribution amount cannot be negative"),
  contributionFrequency: z.string().min(1, "Contribution frequency is required"),
  annualReturn: z.coerce.number().min(0, "Annual return cannot be negative"),
  fees: z.coerce.number().min(0, "Fees cannot be negative"),
  isRetirementAccount: z.boolean().default(true),
  accountOwner: z.string().default("primary"),
});

interface InvestmentAccount {
  id: string;
  userId: string;
  accountName: string;
  accountType: string;
  balance: number;
  contributionAmount: number;
  contributionFrequency: string;
  annualReturn: number;
  fees: number;
  isRetirementAccount: boolean;
  accountOwner?: string;
}

interface EditAccountFormProps {
  account: InvestmentAccount;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditAccountForm = ({ account, onSuccess, onCancel }: EditAccountFormProps) => {
  // Create form with default values from the account
  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      accountName: account.accountName,
      accountType: account.accountType,
      balance: account.balance,
      contributionAmount: account.contributionAmount,
      contributionFrequency: account.contributionFrequency,
      annualReturn: account.annualReturn,
      fees: account.fees,
      isRetirementAccount: account.isRetirementAccount,
      accountOwner: account.accountOwner || "primary",
    },
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async (data: z.infer<typeof accountFormSchema>) => {
      // Ensure all numeric fields are properly formatted as strings for the server
      const formattedData = {
        ...data,
        balance: String(data.balance),
        contributionAmount: String(data.contributionAmount),
        annualReturn: String(data.annualReturn),
        fees: String(data.fees),
      };
      console.log("Submitting data:", formattedData);
      return await apiRequest("PATCH", `/api/investment-accounts/${account.id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${account.userId}/investment-accounts`] });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error("Error updating account:", error);
    },
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof accountFormSchema>) => {
    updateAccountMutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Investment Account</CardTitle>
        <CardDescription>
          Update the details of your investment account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 401(k), Roth IRA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="401k">401(k)</SelectItem>
                        <SelectItem value="roth_ira">Roth IRA</SelectItem>
                        <SelectItem value="traditional_ira">Traditional IRA</SelectItem>
                        <SelectItem value="brokerage">Brokerage Account</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contributionAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contributionFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                        <SelectItem value="none">No Contributions</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="annualReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Annual Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Historical average is 7% for a balanced portfolio
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Fees (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      Include expense ratios and management fees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="accountOwner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Owner</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account owner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="primary">Primary (You)</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="joint">Joint</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Who owns this account? This helps with retirement planning calculations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRetirementAccount"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Retirement Account</FormLabel>
                    <FormDescription>
                      Is this account specifically for retirement?
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateAccountMutation.isPending}
              >
                {updateAccountMutation.isPending ? "Updating..." : "Update Account"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditAccountForm;