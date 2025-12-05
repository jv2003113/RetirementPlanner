import React, { useEffect, useState } from 'react';
import { useMultiStepForm } from '@/contexts/MultiStepFormContext';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  HomeIcon,
  UtensilsIcon,
  CarIcon,
  HeartPulseIcon,
  ZapIcon,
  ShieldIcon,
  GamepadIcon,
  PlaneIcon,
  User2Icon,
  GiftIcon,
  MoreHorizontalIcon,
  CalculatorIcon,
  PlusIcon,
  Trash2Icon
} from 'lucide-react';

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: string;
}

export const CurrentExpensesStep: React.FC = () => {
  const { form } = useMultiStepForm();

  // Expense categories with icons
  const expenseCategories = {
    housing: {
      label: 'Housing',
      icon: HomeIcon,
      color: 'text-blue-600',
    },
    food: {
      label: 'Food & Groceries',
      icon: UtensilsIcon,
      color: 'text-green-600',
    },
    transportation: {
      label: 'Transportation',
      icon: CarIcon,
      color: 'text-purple-600',
    },
    healthcare: {
      label: 'Healthcare',
      icon: HeartPulseIcon,
      color: 'text-red-600',
    },
    utilities: {
      label: 'Utilities',
      icon: ZapIcon,
      color: 'text-yellow-600',
    },
    insurance: {
      label: 'Insurance',
      icon: ShieldIcon,
      color: 'text-indigo-600',
    },
    entertainment: {
      label: 'Entertainment',
      icon: GamepadIcon,
      color: 'text-pink-600',
    },
    travel: {
      label: 'Travel',
      icon: PlaneIcon,
      color: 'text-cyan-600',
    },
    personal_care: {
      label: 'Personal Care',
      icon: User2Icon,
      color: 'text-orange-600',
    },
    gifts: {
      label: 'Gifts & Donations',
      icon: GiftIcon,
      color: 'text-emerald-600',
    },
    other: {
      label: 'Other',
      icon: MoreHorizontalIcon,
      color: 'text-gray-600',
    },
  };

  // Get expenses from form
  const expenses = form.watch('expenses') || [{
    id: '1',
    category: '',
    description: '',
    amount: '',
  }];

  // Add new expense row
  const addExpenseRow = () => {
    const newExpense: ExpenseItem = {
      id: `${Date.now()}`,
      category: '',
      description: '',
      amount: '',
    };
    form.setValue('expenses', [...expenses, newExpense]);
  };

  // Remove expense row
  const removeExpenseRow = (id: string) => {
    if (expenses.length > 1) {
      const filteredExpenses = expenses.filter(expense => expense.id !== id);
      form.setValue('expenses', filteredExpenses);
    }
  };

  // Update expense item
  const updateExpense = (id: string, field: keyof ExpenseItem, value: string) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === id ? { ...expense, [field]: value } : expense
    );
    form.setValue('expenses', updatedExpenses);
  };

  // Calculate total from expenses array
  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return sum + amount;
    }, 0);
  };

  // Update form field with total whenever expenses change
  useEffect(() => {
    const total = calculateTotal();
    form.setValue('totalMonthlyExpenses', total.toString());
  }, [expenses, form]);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalExpenses = calculateTotal();
  const annualExpenses = totalExpenses * 12;

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    const categoryInfo = expenseCategories[category as keyof typeof expenseCategories];
    if (categoryInfo) {
      const Icon = categoryInfo.icon;
      return <Icon className={`w-4 h-4 ${categoryInfo.color}`} />;
    }
    return <MoreHorizontalIcon className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-green-900">
            <CalculatorIcon className="w-5 h-5" />
            <span>Current Monthly Expenses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-sm text-green-700">Monthly Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(annualExpenses)}
              </div>
              <div className="text-sm text-green-700">Annual Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spreadsheet-style Expense Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Monthly Expenses</CardTitle>
            <Button
              type="button"
              onClick={addExpenseRow}
              size="sm"
              className="flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Expense</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 font-medium text-sm text-gray-700">
            <div className="col-span-1"></div>
            <div className="col-span-3">Category</div>
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-1"></div>
          </div>

          {/* Expense Rows */}
          <div className="space-y-2 mt-4">
            {expenses.map((expense, index) => (
              <div key={expense.id} className="grid grid-cols-12 gap-4 items-center py-2 hover:bg-gray-50 rounded-lg px-2">
                {/* Icon */}
                <div className="col-span-1 flex justify-center">
                  {getCategoryIcon(expense.category)}
                </div>

                {/* Category Select */}
                <div className="col-span-3">
                  <Select
                    value={expense.category}
                    onValueChange={(value) => updateExpense(expense.id, 'category', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(expenseCategories).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <category.icon className={`w-4 h-4 ${category.color}`} />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description Input */}
                <div className="col-span-5">
                  <Input
                    placeholder="Expense description (e.g., Mortgage payment)"
                    value={expense.description}
                    onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Amount Input */}
                <div className="col-span-2">
                  <CurrencyInput
                    placeholder="0.00"
                    value={expense.amount}
                    onValueChange={(value) => updateExpense(expense.id, 'amount', value)}
                    className="h-9 text-right"
                  />
                </div>

                {/* Remove Button */}
                <div className="col-span-1 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExpenseRow(expense.id)}
                    disabled={expenses.length === 1}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Total Row */}
          <div className="border-t border-gray-200 mt-6 pt-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-9 text-right font-medium text-gray-900">
                Total Monthly Expenses:
              </div>
              <div className="col-span-2 text-right">
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(totalExpenses)}
                </div>
              </div>
              <div className="col-span-1"></div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mt-1">
              <div className="col-span-9 text-right text-sm text-gray-600">
                Annual Expenses:
              </div>
              <div className="col-span-2 text-right">
                <div className="text-lg font-semibold text-gray-700">
                  {formatCurrency(annualExpenses)}
                </div>
              </div>
              <div className="col-span-1"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden form field for total */}
      <FormField
        control={form.control}
        name="totalMonthlyExpenses"
        render={({ field }) => (
          <FormItem className="hidden">
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Helpful Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Expense Planning Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• <strong>Be specific:</strong> Break down large categories into individual expenses for better accuracy</p>
          <p>• <strong>Include everything:</strong> Don't forget quarterly, semi-annual, or annual expenses (divide by 12)</p>
          <p>• <strong>Consider seasonal variations:</strong> Use an average if expenses vary throughout the year</p>
          <p>• <strong>Plan for retirement changes:</strong> Some expenses may increase (healthcare) or decrease (commuting)</p>
        </CardContent>
      </Card>
    </div>
  );
};