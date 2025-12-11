import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    PiggyBank,
    CreditCard,
    Briefcase,
    TrendingDown,
    Home,
    Building2,
    Wallet,
    DollarSign
} from "lucide-react";
import type { AnnualSnapshot, AnnualSnapshotAsset, AnnualSnapshotLiability, AnnualSnapshotIncome, AnnualSnapshotExpense } from "@shared/schema";

interface FinancialDashboardProps {
    year: number;
    age: number;
    snapshot: AnnualSnapshot | null;
    assets: AnnualSnapshotAsset[];
    liabilities: AnnualSnapshotLiability[];
    income: AnnualSnapshotIncome[];
    expenses: AnnualSnapshotExpense[];
    isLoading: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
};

export default function FinancialDashboard({
    year,
    age,
    snapshot,
    assets = [],
    liabilities = [],
    income = [],
    expenses = [],
    isLoading,
}: FinancialDashboardProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (!snapshot) {
        return (
            <Card className="w-full h-[200px]">
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-gray-500">Year {year} • Age {age}</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="text-sm text-blue-700 font-medium">Net Worth:</span>
                    <span className="text-xl font-bold text-blue-900">{formatCurrency(netWorth)}</span>
                </div>
            </div>

            {/* Detailed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Assets Card */}
                <Card className="h-full">
                    <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Assets</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalAssets)}</h3>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full">
                                <PiggyBank className="h-4 w-4 text-green-600" />
                            </div>
                        </div>

                        <div className="flex-grow space-y-3 border-t pt-3">
                            {assets.map((asset, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        {asset.type.includes('real_estate') ? <Home className="h-3 w-3 text-blue-500" /> :
                                            asset.type.includes('401k') || asset.type.includes('ira') ? <Building2 className="h-3 w-3 text-purple-500" /> :
                                                <Wallet className="h-3 w-3 text-green-500" />}
                                        <span className="text-gray-600">{asset.name}</span>
                                    </div>
                                    <span className="font-medium">{formatCurrency(parseFloat(asset.balance))}</span>
                                </div>
                            ))}
                            {assets.length === 0 && <div className="text-sm text-gray-400 italic">No assets</div>}
                        </div>
                    </CardContent>
                </Card>

                {/* Liabilities Card */}
                <Card className="h-full">
                    <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Liabilities</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalLiabilities)}</h3>
                            </div>
                            <div className="p-2 bg-red-100 rounded-full">
                                <CreditCard className="h-4 w-4 text-red-600" />
                            </div>
                        </div>

                        <div className="flex-grow space-y-3 border-t pt-3">
                            {liabilities && liabilities.length > 0 ? (
                                <>
                                    {liabilities.map((liability, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">{liability.name}</span>
                                            <span className="font-medium">{formatCurrency(parseFloat(liability.balance))}</span>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-sm text-gray-400 italic">No liabilities</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Income Card */}
                <Card className="h-full">
                    <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Annual Income</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(grossIncome)}</h3>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Briefcase className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>

                        <div className="flex-grow space-y-3 border-t pt-3">
                            {income && income.length > 0 ? (
                                <>
                                    {income.map((inc, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">{inc.source}</span>
                                            <span className="font-medium">{formatCurrency(parseFloat(inc.amount))}</span>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-sm text-gray-400 italic">No income detail</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Expenses Card */}
                <Card className="h-full">
                    <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Annual Expenses</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalExpenses)}</h3>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-full">
                                <TrendingDown className="h-4 w-4 text-orange-600" />
                            </div>
                        </div>

                        <div className="flex-grow space-y-3 border-t pt-3">
                            {expenses && expenses.length > 0 ? (
                                <>
                                    {expenses.map((exp, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">{exp.category}</span>
                                            <span className="font-medium">{formatCurrency(parseFloat(exp.amount))}</span>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-sm text-gray-400 italic">No expense detail</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
