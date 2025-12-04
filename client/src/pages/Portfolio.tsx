import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AccountsList from "@/components/portfolio/AccountsList";
import AddAccountForm from "@/components/portfolio/AddAccountForm";
import EditAccountForm from "@/components/portfolio/EditAccountForm";
import SecurityHoldingForm from "@/components/portfolio/SecurityHoldingForm";
import AssetAllocationPieChart from "@/components/portfolio/AssetAllocationPieChart";

// Define interface for investment account
interface SecurityHolding {
  id: string;
  accountId: string;
  ticker: string;
  name: string | null;
  percentage: string;
  assetClass: string | null;
  region: string | null;
}

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

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const [accountToEdit, setAccountToEdit] = useState<InvestmentAccount | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  // Fetch investment accounts
  const {
    data: accountsData,
    isLoading: isLoadingAccounts,
    error: accountsError
  } = useQuery<InvestmentAccount[]>({
    queryKey: [`/api/users/${userId}/investment-accounts`],
    enabled: !!userId,
  });

  // Function to calculate total portfolio value
  const calculateTotalPortfolioValue = () => {
    if (!accountsData || !Array.isArray(accountsData)) return 0;
    return accountsData.reduce((total: number, account: InvestmentAccount) => total + Number(account.balance), 0);
  };

  // Handle editing an account
  const handleEditAccount = (account: InvestmentAccount) => {
    setAccountToEdit(account);
    setActiveTab("edit");
  };

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return await apiRequest("DELETE", `/api/investment-accounts/${accountId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/investment-accounts`] });
      toast({
        title: "Account Deleted",
        description: "The investment account has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      deleteAccountMutation.mutate(accountId);
    }
  };

  if (isLoadingAccounts) {
    return (
      <div className="py-4">
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-[600px] mb-8" />
      </div>
    );
  }

  if (accountsError) {
    return <div className="py-4">Error loading portfolio data</div>;
  }

  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Portfolio Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track and manage your investment accounts and asset allocations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${calculateTotalPortfolioValue().toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Number of Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(accountsData) ? accountsData.length : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Monthly Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Array.isArray(accountsData)
                ? accountsData.reduce((total: number, account: InvestmentAccount) =>
                  total + (account.contributionFrequency === "monthly" ? Number(account.contributionAmount) : 0), 0).toLocaleString()
                : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Investment Accounts</TabsTrigger>
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="add">Add New Account</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4">
          {Array.isArray(accountsData) && accountsData.length > 0 ? (
            <AccountsList
              accounts={accountsData}
              onDeleteAccount={handleDeleteAccount}
              onEditAccount={handleEditAccount}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-10">
                <p className="mb-4 text-center text-gray-500">
                  You haven't added any investment accounts yet.
                </p>
                <Button onClick={() => setActiveTab("add")}>
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          {accountToEdit && (
            <EditAccountForm
              account={accountToEdit}
              onSuccess={() => {
                setAccountToEdit(null);
                setActiveTab("accounts");
                toast({
                  title: "Account Updated",
                  description: "Your investment account has been successfully updated."
                });
              }}
              onCancel={() => {
                setAccountToEdit(null);
                setActiveTab("accounts");
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="allocation" className="mt-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Overall Asset Allocation</CardTitle>
                <CardDescription>
                  View how your investments are allocated across different asset classes.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {Array.isArray(accountsData) && accountsData.length > 0 ? (
                  <div className="h-[400px] w-full max-w-md">
                    <AssetAllocationPieChart accounts={accountsData} />
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No investment accounts to display asset allocation.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allocation Recommendations</CardTitle>
                <CardDescription>
                  Based on your age and risk profile, we recommend the following asset allocation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                      <span>Stocks</span>
                    </div>
                    <div className="font-medium">60%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                      <span>Bonds</span>
                    </div>
                    <div className="font-medium">30%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                      <span>Real Estate</span>
                    </div>
                    <div className="font-medium">5%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>
                      <span>Cash</span>
                    </div>
                    <div className="font-medium">5%</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium mb-2">Why this allocation?</h4>
                  <p className="text-sm text-gray-600">
                    Based on your target retirement age of 67 and current age, this balanced allocation provides
                    growth potential while gradually reducing risk as you approach retirement.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Review Risk Profile</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <AddAccountForm
            userId={userId}
            onSuccess={() => {
              setActiveTab("accounts");
              toast({
                title: "Account Added",
                description: "Your investment account has been successfully added."
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Portfolio;
