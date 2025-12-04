import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, UserIcon, Users2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SecurityHoldings from "./SecurityHoldings";

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

interface SecurityHolding {
  id: string;
  accountId: string;
  ticker: string;
  name: string | null;
  percentage: string;
  assetClass: string | null;
  region: string | null;
}

interface AccountsListProps {
  accounts: InvestmentAccount[];
  onDeleteAccount: (id: string) => void;
  onEditAccount: (account: InvestmentAccount) => void;
  onAddHolding?: (accountId: string) => void;
  onEditHolding?: (holding: SecurityHolding) => void;
  onDeleteHolding?: (holdingId: string) => void;
}

const AccountsList = ({
  accounts,
  onDeleteAccount,
  onEditAccount,
  onAddHolding,
  onEditHolding,
  onDeleteHolding
}: AccountsListProps) => {
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});

  const toggleAccountDetails = (accountId: string) => {
    setExpandedAccount(expandedAccount === accountId ? null : accountId);
  };

  const formatAccountType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case '401k':
        return 'bg-blue-100 text-blue-800';
      case 'roth_ira':
      case 'traditional_ira':
        return 'bg-green-100 text-green-800';
      case 'brokerage':
        return 'bg-purple-100 text-purple-800';
      case 'real_estate':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountOwnerIcon = (owner?: string) => {
    switch (owner) {
      case 'spouse':
        return <UserIcon className="h-4 w-4 mr-1 text-pink-500" />;
      case 'joint':
        return <Users2Icon className="h-4 w-4 mr-1 text-purple-500" />;
      default:
        return <UserIcon className="h-4 w-4 mr-1 text-blue-500" />;
    }
  };

  const getAccountOwnerLabel = (owner?: string) => {
    switch (owner) {
      case 'spouse':
        return 'Spouse';
      case 'joint':
        return 'Joint';
      default:
        return 'Primary';
    }
  };

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <Collapsible
          key={account.id}
          open={expandedAccount === account.id}
          onOpenChange={() => toggleAccountDetails(account.id)}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1">
                    {getAccountOwnerIcon(account.accountOwner)}
                    <CardTitle className="text-lg">{account.accountName}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center mt-1">
                    <Badge variant="outline" className={`mr-2 ${getAccountTypeColor(account.accountType)}`}>
                      {formatAccountType(account.accountType)}
                    </Badge>
                    {account.isRetirementAccount && (
                      <Badge variant="outline" className="bg-teal-100 text-teal-800 mr-2">
                        Retirement
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      {getAccountOwnerLabel(account.accountOwner)}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${Number(account.balance).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    {account.contributionAmount > 0 && (
                      <span>${Number(account.contributionAmount).toLocaleString()}/{account.contributionFrequency}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  {expandedAccount === account.id ? 'Hide Details' : 'Show Details'}
                  {expandedAccount === account.id ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </CardContent>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div>
                    <div className="text-sm text-gray-500">Annual Return</div>
                    <div className="font-medium">{account.annualReturn}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Fees</div>
                    <div className="font-medium">{account.fees}%</div>
                  </div>
                </div>

                <div className="mt-4">
                  <Tabs
                    value={activeTab[account.id] || "allocation"}
                    onValueChange={(value) => setActiveTab({ ...activeTab, [account.id]: value })}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
                      <TabsTrigger value="securities">Security Holdings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="allocation">
                      <AssetAllocationForAccount accountId={account.id} />
                    </TabsContent>
                    <TabsContent value="securities">
                      {onAddHolding && onEditHolding && onDeleteHolding ? (
                        <SecurityHoldings
                          accountId={account.id}
                          accountName={account.accountName}
                          onAddHolding={onAddHolding}
                          onEditHolding={onEditHolding}
                          onDeleteHolding={onDeleteHolding}
                        />
                      ) : (
                        <div className="py-2 text-sm text-gray-500">Securities management not available</div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end space-x-2 pt-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center"
                  onClick={() => onEditAccount(account)}
                >
                  <PencilIcon className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex items-center"
                  onClick={() => onDeleteAccount(account.id)}
                >
                  <TrashIcon className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
};

// Component to show asset allocation for a specific account
const AssetAllocationForAccount = ({ accountId }: { accountId: string }) => {
  const { data: allocations, isLoading, error } = useQuery({
    queryKey: [`/api/investment-accounts/${accountId}/asset-allocations`],
  });

  if (isLoading) {
    return <div className="py-2">Loading asset allocations...</div>;
  }

  if (error) {
    return <div className="py-2 text-sm text-gray-500">Error loading asset allocations.</div>;
  }

  const allocationData = allocations as Array<{
    id: string;
    assetCategory: string;
    percentage: number;
  }> || [];

  if (allocationData.length === 0) {
    return <div className="py-2 text-sm text-gray-500">No asset allocation data available.</div>;
  }

  // Color mapping for asset categories
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'stocks':
        return 'bg-blue-500';
      case 'bonds':
        return 'bg-green-500';
      case 'real_estate':
        return 'bg-yellow-500';
      case 'cash':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="mt-2">
      <div className="text-sm font-medium mb-2">Asset Allocation</div>
      <div className="space-y-2">
        {allocationData.map((allocation) => (
          <div key={allocation.id} className="flex items-center">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-4 ${getCategoryColor(allocation.assetCategory)}`}
                style={{ width: `${allocation.percentage}%` }}
              ></div>
            </div>
            <div className="ml-2 flex items-center min-w-[120px]">
              <span className={`h-3 w-3 rounded-full ${getCategoryColor(allocation.assetCategory)} mr-1`}></span>
              <span className="text-sm capitalize">{allocation.assetCategory.replace('_', ' ')}</span>
              <span className="text-sm ml-auto">{allocation.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountsList;
