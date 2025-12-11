import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Home,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnnualSnapshot, AnnualSnapshotAsset, AnnualSnapshotLiability } from "@shared/schema";

interface YearDetailViewProps {
  yearData: {
    snapshot: AnnualSnapshot;
    accountBalances: AnnualSnapshotAsset[];
    liabilities: AnnualSnapshotLiability[];
  } | null;
  selectedYear: number | null;
  isLoading: boolean;
  onYearChange: (year: number) => void;
  planDetails: any;
}

export default function YearDetailView({
  yearData,
  selectedYear,
  isLoading,
  onYearChange,
  planDetails
}: YearDetailViewProps) {
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [showAllLiabilities, setShowAllLiabilities] = useState(false);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatPercent = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toFixed(1)}%`;
  };

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case '401k':
      case 'traditional_ira':
      case 'roth_ira':
        return <PiggyBank className="h-4 w-4" />;
      case 'brokerage':
        return <TrendingUp className="h-4 w-4" />;
      case 'savings':
      case 'checking':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getAccountTypeColor = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case '401k':
        return 'bg-blue-100 text-blue-800';
      case 'traditional_ira':
        return 'bg-green-100 text-green-800';
      case 'roth_ira':
        return 'bg-purple-100 text-purple-800';
      case 'brokerage':
        return 'bg-orange-100 text-orange-800';
      case 'savings':
        return 'bg-teal-100 text-teal-800';
      case 'checking':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-indigo-100 text-indigo-800';
    }
  };

  const getLiabilityIcon = (liabilityType: string) => {
    switch (liabilityType.toLowerCase()) {
      case 'mortgage':
        return <Home className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getLiabilityColor = (liabilityType: string) => {
    switch (liabilityType.toLowerCase()) {
      case 'mortgage':
        return 'bg-red-100 text-red-800';
      case 'car_loan':
        return 'bg-yellow-100 text-yellow-800';
      case 'credit_card':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedYear) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Year Details</CardTitle>
          <CardDescription>
            Select a year from the timeline above to view detailed financial information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No year selected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Year Details - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!yearData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Year Details - {selectedYear}</CardTitle>
          <CardDescription>
            No detailed data available for {selectedYear}. Data is available for every 5th year in the plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Try selecting a year with available data from the timeline</p>
              <p className="text-sm mt-1">Look for the small dots on the timeline</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { snapshot, accountBalances, liabilities } = yearData;
  const visibleAccounts = showAllAccounts ? accountBalances : accountBalances.slice(0, 6);
  const visibleLiabilities = showAllLiabilities ? liabilities : liabilities.slice(0, 4);

  const totalAssets = accountBalances.reduce((sum, account) => sum + parseFloat(account.balance), 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + parseFloat(liability.balance), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Financial Snapshot - {selectedYear}
            </CardTitle>
            <CardDescription>
              Age {snapshot.age} • Complete financial overview for this year
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onYearChange(selectedYear - 1)}
              disabled={!planDetails?.snapshots?.some((s: any) => s.year === selectedYear - 1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onYearChange(selectedYear + 1)}
              disabled={!planDetails?.snapshots?.some((s: any) => s.year === selectedYear + 1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Net Worth</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(snapshot.netWorth)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Assets</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(snapshot.totalAssets)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Income</p>
                <p className="text-2xl font-bold text-orange-700">
                  {formatCurrency(snapshot.grossIncome || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Expenses</p>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(snapshot.totalExpenses || 0)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Account Balances */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Account Balances</h3>
            {accountBalances.length > 6 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllAccounts(!showAllAccounts)}
              >
                {showAllAccounts ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showAllAccounts ? 'Show Less' : `Show All (${accountBalances.length})`}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleAccounts.map((account, index) => (
              <Card key={index} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getAccountTypeIcon(account.type)}
                      <Badge variant="secondary" className={getAccountTypeColor(account.type)}>
                        {account.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {account.name && (
                      <p className="font-medium text-gray-700">{account.name}</p>
                    )}
                    <p className="text-xl font-bold">{formatCurrency(account.balance)}</p>

                    <div className="flex justify-between text-sm text-gray-600">
                      {parseFloat(account.contribution || '0') > 0 && (
                        <span className="text-green-600">
                          +{formatCurrency(account.contribution || 0)} contrib.
                        </span>
                      )}
                      {parseFloat(account.withdrawal || '0') > 0 && (
                        <span className="text-red-600">
                          -{formatCurrency(account.withdrawal || 0)} withdrawal
                        </span>
                      )}
                      {parseFloat(account.growth || '0') > 0 && (
                        <span className="text-blue-600">
                          +{formatCurrency(account.growth || 0)} growth
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Liabilities */}
        {liabilities.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Liabilities</h3>
                {liabilities.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllLiabilities(!showAllLiabilities)}
                  >
                    {showAllLiabilities ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {showAllLiabilities ? 'Show Less' : `Show All (${liabilities.length})`}
                  </Button>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Liability</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleLiabilities.map((liability, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLiabilityIcon(liability.type)}
                          <div>
                            <p className="font-medium">{liability.name}</p>
                            <Badge variant="secondary" className="text-xs">
                              {liability.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(liability.balance)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {liability.payment ? formatCurrency(liability.payment) + '/mo' : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Tax Information */}
        {(parseFloat(snapshot.taxesPaid || '0') > 0 || parseFloat(snapshot.cumulativeTax || '0') > 0) && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4">Tax Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-600">Taxes Paid This Year</p>
                  <p className="text-xl font-bold text-yellow-700">
                    {formatCurrency(snapshot.taxesPaid || 0)}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-orange-600">Cumulative Tax Paid</p>
                  <p className="text-xl font-bold text-orange-700">
                    {formatCurrency(snapshot.cumulativeTax || 0)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card >
  );
}