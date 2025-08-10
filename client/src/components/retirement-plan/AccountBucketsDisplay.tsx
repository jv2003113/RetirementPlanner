import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from "recharts";
import { 
  PiggyBank, 
  TrendingUp, 
  DollarSign, 
  Calculator,
  Wallet,
  CreditCard,
  Home,
  Building
} from "lucide-react";
import type { AnnualSnapshot, AccountBalance } from "@shared/schema";

interface AccountBucketsDisplayProps {
  snapshots: AnnualSnapshot[];
  retirementAge: number;
  detailed?: boolean;
}

interface BucketData {
  type: string;
  displayName: string;
  icon: React.ReactNode;
  color: string;
  endBalance: number;
  retirementBalance: number;
  totalContributions: number;
  totalGrowth: number;
  description: string;
}

const ACCOUNT_TYPE_CONFIG: Record<string, { 
  displayName: string; 
  icon: React.ReactNode; 
  color: string; 
  category: 'retirement' | 'taxable' | 'cash';
  description: string;
}> = {
  '401k': {
    displayName: '401(k)',
    icon: <Building className="h-4 w-4" />,
    color: '#3b82f6',
    category: 'retirement',
    description: 'Pre-tax employer-sponsored retirement account'
  },
  'traditional_ira': {
    displayName: 'Traditional IRA',
    icon: <PiggyBank className="h-4 w-4" />,
    color: '#10b981',
    category: 'retirement',
    description: 'Pre-tax individual retirement account'
  },
  'roth_ira': {
    displayName: 'Roth IRA',
    icon: <PiggyBank className="h-4 w-4" />,
    color: '#8b5cf6',
    category: 'retirement',
    description: 'After-tax individual retirement account'
  },
  'brokerage': {
    displayName: 'Brokerage',
    icon: <TrendingUp className="h-4 w-4" />,
    color: '#f59e0b',
    category: 'taxable',
    description: 'Taxable investment account'
  },
  'savings': {
    displayName: 'Savings',
    icon: <DollarSign className="h-4 w-4" />,
    color: '#06b6d4',
    category: 'cash',
    description: 'High-yield savings account'
  },
  'checking': {
    displayName: 'Checking',
    icon: <Wallet className="h-4 w-4" />,
    color: '#64748b',
    category: 'cash',
    description: 'Primary checking account'
  },
};

export default function AccountBucketsDisplay({ 
  snapshots, 
  retirementAge, 
  detailed = false 
}: AccountBucketsDisplayProps) {
  const [selectedView, setSelectedView] = useState<'end' | 'retirement'>('end');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Process account data from snapshots
  const processAccountData = () => {
    const bucketData: Record<string, BucketData> = {};
    
    // Initialize bucket data with config
    Object.entries(ACCOUNT_TYPE_CONFIG).forEach(([type, config]) => {
      bucketData[type] = {
        type,
        displayName: config.displayName,
        icon: config.icon,
        color: config.color,
        endBalance: 0,
        retirementBalance: 0,
        totalContributions: 0,
        totalGrowth: 0,
        description: config.description
      };
    });

    // Process snapshots to calculate balances
    snapshots.forEach(snapshot => {
      // This is a simplified version - in reality you'd need to fetch account balances for each snapshot
      // For demo purposes, we'll simulate some data
      const isRetirement = snapshot.age >= retirementAge;
      const isEnd = snapshot === snapshots[snapshots.length - 1];
      
      // Simulate account balance distribution
      const totalAssets = Number(snapshot.totalAssets);
      if (totalAssets > 0) {
        // Simulate distribution across account types
        const retirement401k = totalAssets * 0.35;
        const traditionalIRA = totalAssets * 0.20;
        const rothIRA = totalAssets * 0.25;
        const brokerage = totalAssets * 0.15;
        const savings = totalAssets * 0.04;
        const checking = totalAssets * 0.01;
        
        if (isEnd) {
          bucketData['401k'].endBalance = retirement401k;
          bucketData['traditional_ira'].endBalance = traditionalIRA;
          bucketData['roth_ira'].endBalance = rothIRA;
          bucketData['brokerage'].endBalance = brokerage;
          bucketData['savings'].endBalance = savings;
          bucketData['checking'].endBalance = checking;
        }
        
        if (isRetirement && bucketData['401k'].retirementBalance === 0) {
          bucketData['401k'].retirementBalance = retirement401k;
          bucketData['traditional_ira'].retirementBalance = traditionalIRA;
          bucketData['roth_ira'].retirementBalance = rothIRA;
          bucketData['brokerage'].retirementBalance = brokerage;
          bucketData['savings'].retirementBalance = savings;
          bucketData['checking'].retirementBalance = checking;
        }
      }
    });

    // Filter out accounts with zero balances
    return Object.values(bucketData).filter(bucket => 
      bucket.endBalance > 0 || bucket.retirementBalance > 0
    );
  };

  const buckets = processAccountData();
  const totalEndBalance = buckets.reduce((sum, bucket) => sum + bucket.endBalance, 0);
  const totalRetirementBalance = buckets.reduce((sum, bucket) => sum + bucket.retirementBalance, 0);
  
  // Prepare data for charts
  const pieData = buckets.map(bucket => ({
    name: bucket.displayName,
    value: selectedView === 'end' ? bucket.endBalance : bucket.retirementBalance,
    color: bucket.color
  })).filter(item => item.value > 0);

  const barData = buckets.map(bucket => ({
    name: bucket.displayName,
    end: bucket.endBalance,
    retirement: bucket.retirementBalance,
  })).filter(item => item.end > 0 || item.retirement > 0);

  // Group buckets by category
  const groupedBuckets = buckets.reduce((acc, bucket) => {
    const config = ACCOUNT_TYPE_CONFIG[bucket.type];
    if (!config) return acc;
    
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(bucket);
    return acc;
  }, {} as Record<string, BucketData[]>);

  const categoryTotals = {
    retirement: groupedBuckets.retirement?.reduce((sum, bucket) => 
      sum + (selectedView === 'end' ? bucket.endBalance : bucket.retirementBalance), 0) || 0,
    taxable: groupedBuckets.taxable?.reduce((sum, bucket) => 
      sum + (selectedView === 'end' ? bucket.endBalance : bucket.retirementBalance), 0) || 0,
    cash: groupedBuckets.cash?.reduce((sum, bucket) => 
      sum + (selectedView === 'end' ? bucket.endBalance : bucket.retirementBalance), 0) || 0,
  };

  const totalBalance = selectedView === 'end' ? totalEndBalance : totalRetirementBalance;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Account Buckets
            </CardTitle>
            <CardDescription>
              Your money organized by account type and tax treatment
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={selectedView === 'retirement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('retirement')}
            >
              At Retirement
            </Button>
            <Button 
              variant={selectedView === 'end' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('end')}
            >
              At Plan End
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!detailed ? (
          // Summary View
          <div className="space-y-6">
            {/* Category Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-700">Retirement Accounts</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  {formatCurrency(categoryTotals.retirement)}
                </div>
                <div className="text-sm text-blue-600">
                  {totalBalance > 0 ? ((categoryTotals.retirement / totalBalance) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-700">Taxable Accounts</span>
                </div>
                <div className="text-2xl font-bold text-orange-800">
                  {formatCurrency(categoryTotals.taxable)}
                </div>
                <div className="text-sm text-orange-600">
                  {totalBalance > 0 ? ((categoryTotals.taxable / totalBalance) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
              
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-teal-600" />
                  <span className="font-medium text-teal-700">Cash Accounts</span>
                </div>
                <div className="text-2xl font-bold text-teal-800">
                  {formatCurrency(categoryTotals.cash)}
                </div>
                <div className="text-sm text-teal-600">
                  {totalBalance > 0 ? ((categoryTotals.cash / totalBalance) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          // Detailed View
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakdown">Account Breakdown</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="growth">Growth Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakdown" className="space-y-4">
              {/* Individual Account Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buckets.map((bucket) => {
                  const balance = selectedView === 'end' ? bucket.endBalance : bucket.retirementBalance;
                  const percentage = totalBalance > 0 ? (balance / totalBalance) * 100 : 0;
                  
                  return (
                    <Card key={bucket.type} className="bg-gradient-to-br from-gray-50 to-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="p-2 rounded-full"
                              style={{ backgroundColor: `${bucket.color}20` }}
                            >
                              {bucket.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold">{bucket.displayName}</h3>
                              <p className="text-xs text-gray-500">{bucket.description}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-2xl font-bold" style={{ color: bucket.color }}>
                            {formatCurrency(balance)}
                          </div>
                          
                          <Progress 
                            value={percentage} 
                            className="h-2"
                            style={{ 
                              backgroundColor: `${bucket.color}20`,
                            }}
                          />
                          
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{percentage.toFixed(1)}% of total</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="comparison">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="retirement" fill="#3b82f6" name="At Retirement" />
                    <Bar dataKey="end" fill="#8b5cf6" name="At Plan End" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="growth">
              <div className="text-center text-gray-500 py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Growth timeline visualization would be implemented with actual account balance data over time</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}