import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YearlyData } from "@/lib/retirement-projection";

interface ProjectionTableProps {
    data: YearlyData[];
}

export default function ProjectionTable({ data }: ProjectionTableProps) {
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
                <CardTitle>Yearly Projection Details</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead className="text-right">Spending</TableHead>
                            <TableHead className="text-right">Fixed Income</TableHead>
                            <TableHead className="text-right">RMD</TableHead>
                            <TableHead className="text-right">Withdrawals</TableHead>
                            <TableHead className="text-right">Taxes</TableHead>
                            <TableHead className="text-right">Total Assets</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.year} className={row.isDepleted ? "bg-red-50" : ""}>
                                <TableCell>{row.year}</TableCell>
                                <TableCell>{row.age}</TableCell>
                                <TableCell className="text-right">{formatCurrency(row.inflationAdjustedSpending)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(row.socialSecurityIncome + (row.pensionIncome || 0) + (row.currentIncome || 0) + (row.spouseCurrentIncome || 0))}</TableCell>
                                <TableCell className="text-right">{formatCurrency(row.rmdCalculated)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(row.totalGrossWithdrawal)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(row.estimatedTax)}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(row.totalAssets_eoy)}</TableCell>
                                <TableCell className="text-center">
                                    {row.isDepleted ? (
                                        <span className="text-red-600 font-bold">Depleted</span>
                                    ) : (
                                        <span className="text-green-600">OK</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
