import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Target,
    Activity,
    Calendar,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

interface DashboardMetrics {
    magicNumber: number;
    progressPercentage: number;
    projectedMonthlyIncome: number;
    currentAnnualContribution: number;
    recommendedAnnualContribution: number;
    isOnTrack: boolean;
    retirementAge: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
};

export default function MetricsDashboard({ userId }: { userId: string }) {
    const { data: metrics, isLoading, error } = useQuery<DashboardMetrics>({
        queryKey: [`/api/users/${userId}/dashboard-metrics`],
        queryFn: async () => {
            const res = await apiRequest(`/api/users/${userId}/dashboard-metrics`);
            return res.json();
        },
        enabled: !!userId,
        // Refetch when user refocusses to keep data fresh if they change settings
        refetchOnWindowFocus: true
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-40 bg-gray-100 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>Failed to load dashboard metrics.</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Outlook</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. The "Magic Number" */}
                <Card className="shadow-sm border-gray-100 bg-gradient-to-br from-indigo-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-900 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-600" />
                            Target Retirement Nest Egg
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-indigo-700">
                            {formatCurrency(metrics.magicNumber)}
                        </div>
                        <p className="text-xs text-indigo-600/80 mt-1">
                            Estimated total needed
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Progress to Goal (Fuel Gauge) */}
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            Progress to Goal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-bold text-gray-900">
                                    {metrics.progressPercentage}%
                                </span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${metrics.isOnTrack ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {metrics.isOnTrack ? 'On Track' : 'Needs Attention'}
                                </span>
                            </div>
                            <Progress value={metrics.progressPercentage} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                                Funded status
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Projected Monthly Income */}
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Monthly Income @ Ret.
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            {formatCurrency(metrics.projectedMonthlyIncome)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Projected at age {metrics.retirementAge}
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Annual Contribution (Effort Score) */}
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                            Annual Contribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            {formatCurrency(metrics.currentAnnualContribution)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">Rec:</span>
                            <span className="text-xs font-medium text-gray-700">
                                {formatCurrency(metrics.recommendedAnnualContribution)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
