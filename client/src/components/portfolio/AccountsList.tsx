import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InvestmentAccount {
  id: number;
  accountName: string;
  accountType: string;
  balance: number;
  contributionAmount: number;
  contributionFrequency: string;
  annualReturn: number;
  fees: number;
  isRetirementAccount: boolean;
}

interface AccountsListProps {
  accounts: InvestmentAccount[];
  onDeleteAccount: (id: number) => void;
}

const AccountsList = ({ accounts, onDeleteAccount }: AccountsListProps) => {
  const [expandedAccount, setExpandedAccount] = useState<number | null>(null);

  const toggleAccountDetails = (accountId: number) => {
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
                  <CardTitle className="text-lg">{account.accountName}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Badge variant="outline" className={`mr-2 ${getAccountTypeColor(account.accountType)}`}>
                      {formatAccountType(account.accountType)}
                    </Badge>
                    {account.isRetirementAccount && (
                      <Badge variant="outline" className="bg-teal-100 text-teal-800">
                        Retirement
                      </Badge>
                    )}
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
                
                <AssetAllocationForAccount accountId={account.id} />
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-2 pt-0">
                <Button size="sm" variant="outline" className="flex items-center">
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
const AssetAllocationForAccount = ({ accountId }: { accountId: number }) => {
  const { data: allocations, isLoading, error } = useQuery({
    queryKey: [`/api/investment-accounts/${accountId}/asset-allocations`],
  });

  if (isLoading) {
    return <div className="py-2">Loading asset allocations...</div>;
  }

  if (error || !allocations || allocations.length === 0) {
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
        {allocations.map((allocation: any) => (
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
