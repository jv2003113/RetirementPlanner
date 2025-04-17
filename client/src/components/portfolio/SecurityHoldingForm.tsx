import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { fetchSecurityData } from "@/lib/securities-api";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Schema for security holdings form
const securityHoldingFormSchema = z.object({
  accountId: z.number(),
  ticker: z.string().min(1, "Ticker symbol is required"),
  name: z.string().nullable().optional(),
  percentage: z.string().min(1, "Allocation percentage is required"),
  assetClass: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
});

type SecurityHoldingFormValues = z.infer<typeof securityHoldingFormSchema>;

interface SecurityHoldingFormProps {
  accountId: number;
  holding?: {
    id: number;
    accountId: number;
    ticker: string;
    name: string | null;
    percentage: string;
    assetClass: string | null;
    region: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const SecurityHoldingForm = ({
  accountId,
  holding,
  onSuccess,
  onCancel,
}: SecurityHoldingFormProps) => {
  const [isLookingUpTicker, setIsLookingUpTicker] = useState(false);
  const isEditMode = !!holding;

  // Initialize form with default values or existing holding data
  const form = useForm<SecurityHoldingFormValues>({
    resolver: zodResolver(securityHoldingFormSchema),
    defaultValues: holding
      ? {
          accountId: holding.accountId,
          ticker: holding.ticker,
          name: holding.name,
          percentage: holding.percentage,
          assetClass: holding.assetClass,
          region: holding.region,
        }
      : {
          accountId,
          ticker: "",
          name: null,
          percentage: "",
          assetClass: null,
          region: null,
        },
  });

  // Mutations for creating or updating a security holding
  const createMutation = useMutation({
    mutationFn: async (data: SecurityHoldingFormValues) => {
      return await apiRequest("POST", "/api/security-holdings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/investment-accounts/${accountId}/security-holdings`] });
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SecurityHoldingFormValues) => {
      if (!holding) throw new Error("Holding ID not found");
      return await apiRequest("PATCH", `/api/security-holdings/${holding.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/investment-accounts/${accountId}/security-holdings`] });
      onSuccess();
    },
  });

  // Look up ticker information when ticker field changes
  const handleTickerLookup = async (ticker: string) => {
    if (!ticker || ticker.length < 1) return;
    
    try {
      setIsLookingUpTicker(true);
      const securityData = await fetchSecurityData(ticker);
      
      if (securityData) {
        // Update form fields with fetched data
        form.setValue("name", securityData.name);
        form.setValue("assetClass", securityData.assetClass);
        form.setValue("region", securityData.region);
      }
    } catch (error) {
      console.error("Error fetching security data:", error);
    } finally {
      setIsLookingUpTicker(false);
    }
  };

  // Watch the ticker field for changes
  const ticker = form.watch("ticker");
  
  useEffect(() => {
    // Only fetch data if in add mode (not editing) and ticker has a value
    if (!isEditMode && ticker && ticker.length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        handleTickerLookup(ticker);
      }, 1000);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [ticker, isEditMode]);

  // Handle form submission
  const onSubmit = (values: SecurityHoldingFormValues) => {
    if (isEditMode) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Security" : "Add New Security"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticker Symbol</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        placeholder="e.g., VTI, AAPL"
                        {...field}
                        disabled={isEditMode || isLookingUpTicker}
                      />
                    </FormControl>
                    {isLookingUpTicker && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                  <FormDescription>
                    Enter the ticker symbol of the security
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Vanguard Total Stock Market ETF"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Name of the security (will be auto-filled when possible)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocation Percentage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 25"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What percentage of this account is allocated to this security
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assetClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Class</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="bond">Bond</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="domestic">Domestic</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                        <SelectItem value="emerging">Emerging Markets</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Update Security" : "Add Security"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SecurityHoldingForm;