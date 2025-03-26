import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, TrashIcon } from "lucide-react";

interface RetirementExpense {
  id: number;
  userId: number;
  category: string;
  estimatedMonthlyAmount: number;
  isEssential: boolean;
  notes?: string;
}

interface ExpenseTrackerProps {
  expenses: RetirementExpense[];
  userId: number;
}

const ExpenseTracker = ({ expenses, userId }: ExpenseTrackerProps) => {
  const { toast } = useToast();
  const [expandedNotes, setExpandedNotes] = useState<number | null>(null);

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      return await apiRequest("DELETE", `/api/retirement-expenses/${expenseId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/retirement-expenses`] });
      toast({
        title: "Expense Deleted",
        description: "The expense has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteExpense = (expenseId: number) => {
    if (window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };

  const toggleNotes = (expenseId: number) => {
    setExpandedNotes(expandedNotes === expenseId ? null : expenseId);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format category name
  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retirement Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length > 0 ? (
          <Table>
            <TableCaption>
              Total Monthly Expenses: {formatCurrency(
                expenses.reduce((total, expense) => total + Number(expense.estimatedMonthlyAmount), 0)
              )}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Monthly Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <React.Fragment key={expense.id}>
                  <TableRow>
                    <TableCell className="font-medium capitalize">
                      {formatCategory(expense.category)}
                    </TableCell>
                    <TableCell>{formatCurrency(expense.estimatedMonthlyAmount)}</TableCell>
                    <TableCell>
                      {expense.isEssential ? (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Essential
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                          Discretionary
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {expense.notes && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleNotes(expense.id)}
                          >
                            {expandedNotes === expense.id ? "Hide Notes" : "Show Notes"}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedNotes === expense.id && expense.notes && (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-gray-50">
                        <div className="p-2 text-sm text-gray-600">
                          <strong>Notes:</strong> {expense.notes}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No expenses added yet. Add your first expense to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseTracker;
