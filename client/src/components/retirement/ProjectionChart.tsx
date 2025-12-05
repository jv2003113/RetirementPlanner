import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YearlyData } from "@/lib/retirement-projection";

interface ProjectionChartProps {
    data: YearlyData[];
}

export default function ProjectionChart({ data }: ProjectionChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card className="w-full mt-6">
            <CardHeader>
                <CardTitle>Asset Projection</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
                            <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const total = payload.reduce((sum, entry) => sum + (entry.value as number), 0);
                                        return (
                                            <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
                                                <p className="font-bold mb-2">Age {label}</p>
                                                {payload.map((entry, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-sm">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                                        <span className="text-gray-600">{entry.name}:</span>
                                                        <span className="font-medium ml-auto">{formatCurrency(entry.value as number)}</span>
                                                    </div>
                                                ))}
                                                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between font-bold">
                                                    <span>Total Assets:</span>
                                                    <span>{formatCurrency(total)}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="401k_eoy" stackId="1" stroke="#8884d8" fill="#8884d8" name="401k" />
                            <Area type="monotone" dataKey="rothIRA_eoy" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Roth IRA" />
                            <Area type="monotone" dataKey="brokerage_eoy" stackId="1" stroke="#ffc658" fill="#ffc658" name="Brokerage" />
                            <Area type="monotone" dataKey="savings_eoy" stackId="1" stroke="#ff7300" fill="#ff7300" name="Savings" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
