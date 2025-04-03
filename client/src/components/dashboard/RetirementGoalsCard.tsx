import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RetirementGoal } from "@shared/schema";
import { cn } from "@/lib/utils";

interface RetirementGoalsCardProps {
  goals: RetirementGoal[];
}

const RetirementGoalsCard = ({ goals }: RetirementGoalsCardProps) => {
  if (!goals || goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Retirement Goals</CardTitle>
          <CardDescription>
            Your prioritized retirement goals will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            No retirement goals added yet. Add goals in your Profile to track them here.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort goals by priority (lowest number = highest priority)
  const sortedGoals = [...goals].sort((a, b) => (a.priority || 5) - (b.priority || 5));

  // Only display top 5 goals
  const displayGoals = sortedGoals.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Retirement Goals</CardTitle>
        <CardDescription>
          Your top {displayGoals.length} retirement goals by priority
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayGoals.map((goal) => (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="font-medium flex items-center gap-2">
                  <span className={cn(
                    "h-2 w-2 rounded-full inline-block",
                    goal.priority === 1 ? "bg-red-500" :
                    goal.priority === 2 ? "bg-orange-500" :
                    goal.priority === 3 ? "bg-yellow-500" :
                    goal.priority === 4 ? "bg-green-500" : "bg-blue-500"
                  )}></span>
                  {goal.description}
                </div>
                <div className="text-xs bg-slate-100 px-2 py-1 rounded capitalize">
                  {goal.category}
                </div>
              </div>
              <div className="text-sm text-gray-500 flex justify-between">
                <div>
                  {goal.category === "income" 
                    ? `$${goal.targetMonthlyIncome}${goal.frequency !== 'one-time' ? `/${goal.frequency || 'monthly'}` : ''}` 
                    : goal.category === "travel" || goal.category === "hobbies" || goal.category === "education"
                      ? `$${goal.targetMonthlyIncome}${goal.frequency !== 'one-time' ? ` (${goal.frequency || 'monthly'})` : ''}`
                      : goal.category === "healthcare" || goal.category === "housing" 
                        ? `$${goal.targetMonthlyIncome}${goal.frequency !== 'one-time' ? `/${goal.frequency || 'monthly'}` : ''}`
                        : `$${goal.targetMonthlyIncome}${goal.frequency !== 'one-time' ? ` (${goal.frequency || 'monthly'})` : ''}`}
                </div>
                <div className="text-xs">
                  Priority: {goal.priority}
                </div>
              </div>
              <Progress 
                value={100 - (((goal.priority || 3) - 1) * 20)} 
                className="h-1.5" 
                color={
                  goal.priority === 1 ? "bg-red-500" :
                  goal.priority === 2 ? "bg-orange-500" :
                  goal.priority === 3 ? "bg-yellow-500" :
                  goal.priority === 4 ? "bg-green-500" : "bg-blue-500"
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RetirementGoalsCard;