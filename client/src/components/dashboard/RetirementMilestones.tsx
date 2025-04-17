import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Milestone, 
  Target, 
  Award, 
  Calendar, 
  TrendingUp, 
  HeartPulse, 
  CreditCard, 
  PiggyBank
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { User } from "@shared/schema";

interface MilestoneItem {
  id: string;
  title: string;
  targetDate: string;
  targetAge: number;
  description: string;
  icon: React.ReactNode;
  progress: number;
  status: 'upcoming' | 'in-progress' | 'completed' | 'missed';
}

interface RetirementMilestonesProps {
  user: User;
  portfolioTotal: number;
}

const RetirementMilestones = ({ user, portfolioTotal }: RetirementMilestonesProps) => {
  const [showAll, setShowAll] = useState(false);
  
  // Calculate current age and years to retirement
  const currentAge = user.currentAge || 30;
  const targetRetirementAge = user.targetRetirementAge || 65;
  const yearsToRetirement = targetRetirementAge - currentAge;
  
  // Calculate progress percentage for age-based milestones
  const ageProgress = Math.min(100, Math.max(0, (currentAge / targetRetirementAge) * 100));
  
  // Calculate progress for portfolio-based milestones
  // Assuming a target of $1.5M for retirement
  const portfolioTarget = 1500000;
  const portfolioProgress = Math.min(100, Math.max(0, (portfolioTotal / portfolioTarget) * 100));
  
  // Estimated dates based on current age
  const currentYear = new Date().getFullYear();
  const retirementYear = currentYear + yearsToRetirement;
  const fiveYearsFromNow = currentYear + 5;
  const tenYearsFromNow = currentYear + 10;
  
  // Define milestones
  const milestones: MilestoneItem[] = [
    {
      id: "m1",
      title: "Retirement Portfolio",
      targetDate: `${retirementYear}`,
      targetAge: targetRetirementAge,
      description: `$${(portfolioTotal / 1000).toFixed(0)}K of $${portfolioTarget / 1000000}M goal`,
      icon: <PiggyBank className="h-5 w-5" />,
      progress: portfolioProgress,
      status: portfolioProgress < 33 ? 'upcoming' : portfolioProgress < 80 ? 'in-progress' : 'completed'
    },
    {
      id: "m2",
      title: "Emergency Fund",
      targetDate: `${currentYear}`,
      targetAge: currentAge,
      description: "3-6 months of expenses saved",
      icon: <Target className="h-5 w-5" />,
      progress: 90,
      status: 'in-progress'
    },
    {
      id: "m3",
      title: "Debt-Free Milestone",
      targetDate: `${fiveYearsFromNow}`,
      targetAge: currentAge + 5,
      description: "Pay off all high-interest debt",
      icon: <CreditCard className="h-5 w-5" />,
      progress: 65,
      status: 'in-progress'
    },
    {
      id: "m4",
      title: "Max Retirement Contributions",
      targetDate: `${currentYear}`,
      targetAge: currentAge,
      description: "Max out 401(k) and IRA contributions",
      icon: <Award className="h-5 w-5" />,
      progress: 75,
      status: 'in-progress'
    },
    {
      id: "m5",
      title: "Estate Planning",
      targetDate: `${currentYear + 1}`,
      targetAge: currentAge + 1,
      description: "Create will, trust, and advanced directives",
      icon: <Calendar className="h-5 w-5" />,
      progress: 40,
      status: 'upcoming'
    },
    {
      id: "m6",
      title: "Healthcare Savings",
      targetDate: `${retirementYear - 10}`,
      targetAge: targetRetirementAge - 10,
      description: "Build healthcare fund for retirement",
      icon: <HeartPulse className="h-5 w-5" />,
      progress: 25,
      status: 'upcoming'
    },
    {
      id: "m7",
      title: "Passive Income Streams",
      targetDate: `${tenYearsFromNow}`,
      targetAge: currentAge + 10,
      description: "Develop 2-3 sources of passive income",
      icon: <TrendingUp className="h-5 w-5" />,
      progress: 30,
      status: 'upcoming'
    }
  ];
  
  // Sort milestones - in progress first, then upcoming, then completed
  const sortedMilestones = [...milestones].sort((a, b) => {
    // Priority: in-progress > upcoming > completed > missed
    const statusPriority: Record<string, number> = {
      'in-progress': 0,
      'upcoming': 1,
      'completed': 2,
      'missed': 3
    };
    
    return statusPriority[a.status] - statusPriority[b.status];
  });
  
  // Display only top 4 milestones unless showAll is true
  const displayedMilestones = showAll ? sortedMilestones : sortedMilestones.slice(0, 4);
  
  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return (
          <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
            Completed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
            In Progress
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-200">
            Upcoming
          </Badge>
        );
      case 'missed':
        return (
          <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-200">
            Missed
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center">
              <Milestone className="h-5 w-5 mr-2" /> 
              Retirement Milestones
            </CardTitle>
            <CardDescription>
              Track important financial targets on your retirement journey
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedMilestones.map((milestone) => (
            <div key={milestone.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className={cn(
                    "p-1.5 rounded-full mr-3",
                    milestone.status === 'completed' ? "bg-green-100" : 
                    milestone.status === 'in-progress' ? "bg-blue-100" : 
                    milestone.status === 'upcoming' ? "bg-amber-100" : "bg-red-100"
                  )}>
                    {milestone.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {milestone.title}
                      {getStatusBadge(milestone.status)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {milestone.description} • Target: Age {milestone.targetAge} ({milestone.targetDate})
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative w-full h-2 mt-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full",
                    milestone.status === 'completed' ? "bg-green-600" : 
                    milestone.status === 'in-progress' ? "bg-blue-600" : 
                    milestone.status === 'upcoming' ? "bg-amber-600" : "bg-red-600"
                  )}
                  style={{ width: `${milestone.progress}%` }}
                />
              </div>
            </div>
          ))}
          
          {milestones.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {showAll ? "Show less" : `Show ${milestones.length - 4} more milestones`}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RetirementMilestones;