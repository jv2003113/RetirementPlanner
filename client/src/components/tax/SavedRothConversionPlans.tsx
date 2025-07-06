import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Calendar, DollarSign, Target } from "lucide-react";

interface SavedRothConversionPlansProps {
  userId: number;
  onPlanSelect?: (plan: any) => void;
}

const SavedRothConversionPlans = ({ userId, onPlanSelect }: SavedRothConversionPlansProps) => {
  const { data: plans, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/roth-conversion-plans`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Roth Conversion Plans</CardTitle>
          <CardDescription>Loading your saved plans...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!plans || (plans as any[]).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Roth Conversion Plans</CardTitle>
          <CardDescription>No saved plans found. Create a plan using the Roth Conversion Calculator.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Saved Roth Conversion Plans
        </CardTitle>
        <CardDescription>
          Your saved Roth conversion strategies and their key metrics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Conversion Amount</TableHead>
              <TableHead>Years</TableHead>
              <TableHead>Tax Rate</TableHead>
              <TableHead>Expected Return</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(plans as any[]).map((plan: any) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{plan.planName}</div>
                    <div className="text-sm text-gray-500">
                      Created {new Date(plan.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {formatCurrency(plan.conversionAmount)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    {plan.yearsToConvert} years
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {formatPercentage(plan.currentTaxRate)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-purple-600" />
                    {formatPercentage(plan.expectedReturn)}
                  </div>
                </TableCell>
                <TableCell>
                  {onPlanSelect && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onPlanSelect(plan)}
                    >
                      View Details
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SavedRothConversionPlans; 