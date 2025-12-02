import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Wallet,
    CreditCard,
    PiggyBank,
    Briefcase,
    Building2,
    Home,
    ArrowUpRight,
    ArrowDownRight,
    Shield
} from "lucide-react";
import type { AnnualSnapshot, AccountBalance } from "@shared/schema";

interface FinancialDashboardProps {
    year: number;
    age: number;
    snapshot: AnnualSnapshot | null;
    accountBalances: AccountBalance[];
    isLoading: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        notation: value > 1000000 ? 'compact' : 'standard'
    }).format(value);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function FinancialDashboard({
    year,
    age,
    snapshot,
    accountBalances,
    isLoading
}: FinancialDashboardProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 h-96 bg-gray-200 rounded-lg mt-4"></div>
            </div>
        );
    }

    if (!snapshot) {
        return (
            <Card className="w-full h-[400px]">
                <CardContent className="flex items-center justify-center h-full text-gray-500">
                    Select a year to view details
                </CardContent>
            </Card>
        );
    }

    // Parse data
    const netWorth = parseFloat(snapshot.netWorth || "0");
    const totalAssets = parseFloat(snapshot.totalAssets || "0");
    const totalLiabilities = parseFloat(snapshot.totalLiabilities || "0");
    const grossIncome = parseFloat(snapshot.grossIncome || "0");
    const totalExpenses = parseFloat(snapshot.totalExpenses || "0");
    const netIncome = parseFloat(snapshot.netIncome || "0");

    // Prepare Chart Data
    const incomeExpenseData = [
        { name: 'Income', value: grossIncome, fill: '#10b981' },
        { name: 'Expenses', value: totalExpenses, fill: '#ef4444' },
        { name: 'Net', value: netIncome, fill: '#3b82f6' },
    ];

    // Group assets by type for Pie Chart
    const assetsByType = accountBalances.reduce((acc, account) => {
        const type = account.accountType;
        const balance = parseFloat(account.balance || "0");
        if (!acc[type]) acc[type] = 0;
        acc[type] += balance;
        return acc;
    }, {} as Record<string, number>);

    const assetAllocationData = Object.entries(assetsByType).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value
    })).filter(item => item.value > 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
                    <p className="text-gray-500">Year {year} • Age {age}</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="text-sm text-blue-700 font-medium">Net Worth:</span>
                    <span className="text-xl font-bold text-blue-900">{formatCurrency(netWorth)}</span>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Assets</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalAssets)}</h3>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full">
                                <PiggyBank className="h-4 w-4 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Liabilities</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalLiabilities)}</h3>
                            </div>
                            <div className="p-2 bg-red-100 rounded-full">
                                <CreditCard className="h-4 w-4 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Annual Income</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(grossIncome)}</h3>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Briefcase className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Annual Expenses</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalExpenses)}</h3>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-full">
                                <TrendingDown className="h-4 w-4 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expenses Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Cash Flow Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={incomeExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                    />
                                    <RechartsTooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                                        {incomeExpenseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Asset Allocation Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Asset Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
                            <div className="h-full w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={assetAllocationData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {assetAllocationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 mt-4 md:mt-0 space-y-2">
                                {assetAllocationData.map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-gray-600">{entry.name}</span>
                                        </div>
                                        <span className="font-medium">{formatCurrency(entry.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Breakdown Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="assets" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="assets">Assets ({accountBalances.length})</TabsTrigger>
                            <TabsTrigger value="liabilities">Liabilities & Debt</TabsTrigger>
                        </TabsList>

                        <TabsContent value="assets" className="mt-4 space-y-4">
                            {accountBalances.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {accountBalances.map((account, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-full border">
                                                    {account.accountType.includes('real_estate') ? <Home className="h-4 w-4 text-blue-500" /> :
                                                        account.accountType.includes('401k') || account.accountType.includes('ira') ? <Building2 className="h-4 w-4 text-purple-500" /> :
                                                            <Wallet className="h-4 w-4 text-green-500" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{account.accountName}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{account.accountType.replace(/_/g, ' ')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{formatCurrency(parseFloat(account.balance || "0"))}</p>
                                                <p className="text-xs text-green-600 flex items-center justify-end gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    {account.growth || '0'}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">No assets found for this year.</p>
                            )}
                        </TabsContent>

                        <TabsContent value="liabilities" className="mt-4">
                            <div className="space-y-4">
                                {totalLiabilities > 0 ? (
                                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-red-900">Total Liabilities</span>
                                            <span className="font-bold text-red-900">{formatCurrency(totalLiabilities)}</span>
                                        </div>
                                        <div className="w-full bg-red-200 h-2 rounded-full overflow-hidden">
                                            <div className="bg-red-500 h-full" style={{ width: '100%' }}></div>
                                        </div>
                                        <p className="text-xs text-red-700 mt-2">
                                            Debt-to-Asset Ratio: {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                        <Shield className="h-12 w-12 text-green-200 mb-2" />
                                        <p>Debt Free! No liabilities recorded.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
