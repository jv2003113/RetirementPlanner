import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CalendarDays, 
  TrendingUp, 
  Home, 
  GraduationCap, 
  Heart, 
  Plane, 
  Shield,
  DollarSign,
  Clock,
  Target
} from "lucide-react";
import type { AnnualSnapshot, Milestone } from "@shared/schema";

interface TimelineComponentProps {
  snapshots: AnnualSnapshot[];
  milestones: Milestone[];
  onYearSelect: (year: number) => void;
  selectedYear: number | null;
  retirementAge: number;
}

const getMilestoneIcon = (category: string | null, isPersonal: boolean) => {
  if (isPersonal) {
    switch (category) {
      case 'family': return <Heart className="h-4 w-4" />;
      case 'travel': return <Plane className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'healthcare': return <Shield className="h-4 w-4" />;
      case 'education': return <GraduationCap className="h-4 w-4" />;
      case 'housing': return <Home className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  } else {
    // Standard milestones
    if (category === 'retirement' || category === 'social_security') {
      return <Clock className="h-4 w-4" />;
    }
    return <CalendarDays className="h-4 w-4" />;
  }
};

const getMilestoneColor = (category: string | null, isPersonal: boolean) => {
  if (isPersonal) {
    switch (category) {
      case 'family': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'travel': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'financial': return 'bg-green-100 text-green-800 border-green-300';
      case 'healthcare': return 'bg-red-100 text-red-800 border-red-300';
      case 'education': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'housing': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    }
  } else {
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export default function TimelineComponent({ 
  snapshots, 
  milestones, 
  onYearSelect, 
  selectedYear, 
  retirementAge 
}: TimelineComponentProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const startYear = snapshots.length > 0 ? Math.min(...snapshots.map(s => s.year)) : new Date().getFullYear();
  const endYear = snapshots.length > 0 ? Math.max(...snapshots.map(s => s.year)) : new Date().getFullYear() + 40;
  const totalYears = endYear - startYear + 1;
  
  // Calculate positions for milestones
  const personalMilestones = milestones.filter(m => m.milestoneType === 'personal');
  const standardMilestones = milestones.filter(m => m.milestoneType === 'standard');

  const getYearPosition = (year: number) => {
    return ((year - startYear) / totalYears) * 100;
  };

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickPercentage = clickX / rect.width;
      const clickedYear = Math.round(startYear + (clickPercentage * totalYears));
      
      if (clickedYear >= startYear && clickedYear <= endYear) {
        // Find the closest year with actual data
        const availableYears = snapshots.map(s => s.year).sort((a, b) => a - b);
        const closestYear = availableYears.reduce((prev, curr) => {
          return Math.abs(curr - clickedYear) < Math.abs(prev - clickedYear) ? curr : prev;
        });
        onYearSelect(closestYear);
      }
    }
  };

  const getNetWorthForYear = (year: number) => {
    const snapshot = snapshots.find(s => s.year === year);
    return snapshot ? Number(snapshot.netWorth) : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Financial Timeline
        </CardTitle>
        <CardDescription>
          Track your financial journey from {startYear} to {endYear}. Click on any year to see detailed information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-6">
            {/* Personal Milestones Row */}
            <div className="relative">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Personal Milestones</h4>
              <div className="relative h-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                {personalMilestones.map((milestone) => {
                  const year = milestone.targetYear || startYear;
                  const position = getYearPosition(year);
                  
                  return (
                    <Tooltip key={milestone.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 p-2 rounded-full border-2 shadow-sm cursor-pointer hover:scale-110 transition-transform ${getMilestoneColor(milestone.category, true)}`}
                          style={{ left: `${position}%` }}
                        >
                          {getMilestoneIcon(milestone.category, true)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <div className="font-medium">{milestone.title}</div>
                          <div className="text-sm text-gray-500">{year} (Age {milestone.targetAge})</div>
                          {milestone.description && (
                            <div className="text-sm mt-1">{milestone.description}</div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Main Timeline */}
            <div className="relative">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Net Worth Progression</h4>
              <div
                ref={timelineRef}
                className="relative h-16 bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 rounded-lg cursor-pointer overflow-hidden"
                onClick={handleTimelineClick}
                onMouseMove={(e) => {
                  if (timelineRef.current) {
                    const rect = timelineRef.current.getBoundingClientRect();
                    const hoverX = e.clientX - rect.left;
                    const hoverPercentage = hoverX / rect.width;
                    const hoverYear = Math.round(startYear + (hoverPercentage * totalYears));
                    setHoveredYear(hoverYear);
                  }
                }}
                onMouseLeave={() => setHoveredYear(null)}
              >
                {/* Net Worth Progress Line */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="netWorthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  
                  {snapshots.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="url(#netWorthGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={snapshots.map((snapshot, index) => {
                        const containerWidth = timelineRef.current?.offsetWidth || 800;
                        const x = (getYearPosition(snapshot.year) * containerWidth) / 100;
                        const maxNetWorth = Math.max(...snapshots.map(s => Number(s.netWorth)));
                        const y = 64 - ((Number(snapshot.netWorth) / maxNetWorth) * 48) - 8;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  )}
                  
                  {/* Data point markers */}
                  {snapshots.map((snapshot) => (
                    <circle
                      key={snapshot.year}
                      cx={(getYearPosition(snapshot.year) * (timelineRef.current?.offsetWidth || 800)) / 100}
                      cy="32"
                      r="3"
                      fill="#1f2937"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-4 transition-all"
                      onClick={() => onYearSelect(snapshot.year)}
                    />
                  ))}
                </svg>

                {/* Retirement marker */}
                <div
                  className="absolute top-0 bottom-0 bg-red-400 opacity-30 w-1"
                  style={{ left: `${getYearPosition(startYear + (retirementAge - snapshots[0]?.age || 0))}%` }}
                />
                
                {/* Selected year marker */}
                {selectedYear && (
                  <div
                    className="absolute top-0 bottom-0 bg-blue-600 w-1 shadow-lg"
                    style={{ left: `${getYearPosition(selectedYear)}%` }}
                  />
                )}

                {/* Year labels */}
                <div className="absolute bottom-1 left-2 text-xs font-medium text-gray-600">
                  {startYear}
                </div>
                <div className="absolute bottom-1 right-2 text-xs font-medium text-gray-600">
                  {endYear}
                </div>
                
                {/* Hover tooltip */}
                {hoveredYear && (
                  <div
                    className="absolute -top-12 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10"
                    style={{ left: `${getYearPosition(hoveredYear)}%` }}
                  >
                    {hoveredYear}: {formatCurrency(getNetWorthForYear(hoveredYear))}
                  </div>
                )}
              </div>
            </div>

            {/* Standard Milestones Row */}
            <div className="relative">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Standard Milestones</h4>
              <div className="relative h-12 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
                {standardMilestones.map((milestone) => {
                  const year = milestone.targetYear || startYear;
                  const position = getYearPosition(year);
                  
                  return (
                    <Tooltip key={milestone.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 p-2 rounded-full border-2 shadow-sm cursor-pointer hover:scale-110 transition-transform ${getMilestoneColor(milestone.category, false)}`}
                          style={{ left: `${position}%` }}
                        >
                          {getMilestoneIcon(milestone.category, false)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <div className="font-medium">{milestone.title}</div>
                          <div className="text-sm text-gray-500">{year} (Age {milestone.targetAge})</div>
                          {milestone.description && (
                            <div className="text-sm mt-1">{milestone.description}</div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Legend and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-1 bg-gradient-to-r from-green-400 to-purple-400 rounded"></div>
                  <span className="text-gray-600">Net Worth Growth</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-4 bg-red-400 rounded"></div>
                  <span className="text-gray-600">Retirement</span>
                </div>
                {selectedYear && (
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-4 bg-blue-600 rounded"></div>
                    <span className="text-gray-600">Selected: {selectedYear}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onYearSelect(startYear)}
                >
                  Start
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onYearSelect(startYear + (retirementAge - (snapshots[0]?.age || 0)))}
                >
                  Retirement
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onYearSelect(endYear)}
                >
                  End
                </Button>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}