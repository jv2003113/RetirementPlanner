import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Target,
  Baby,
  Car,
  Briefcase,
  MapPin,
  Trophy
} from "lucide-react";
import type { AnnualSnapshot, Milestone } from "@shared/schema";

interface InteractiveTimelineProps {
  snapshots: AnnualSnapshot[];
  milestones: Milestone[];
  onYearSelect: (year: number) => void;
  selectedYear: number | null;
  retirementAge: number;
  startAge: number;
  endAge: number;
  currentAge: number;
}

// Enhanced milestone icon mapping with smaller icons
const getMilestoneIcon = (category: string | null, milestoneType: string, title: string) => {
  if (milestoneType === 'personal') {
    switch (category) {
      case 'family': return <Heart className="h-3 w-3" />;
      case 'travel': return <Plane className="h-3 w-3" />;
      case 'financial': return <DollarSign className="h-3 w-3" />;
      case 'healthcare': return <Shield className="h-3 w-3" />;
      case 'education': return <GraduationCap className="h-3 w-3" />;
      case 'housing': return <Home className="h-3 w-3" />;
      case 'career': return <Briefcase className="h-3 w-3" />;
      case 'vehicle': return <Car className="h-3 w-3" />;
      case 'achievement': return <Trophy className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  } else {
    // Standard milestones
    if (title.toLowerCase().includes('social security') || title.toLowerCase().includes('retirement')) {
      return <Clock className="h-3 w-3" />;
    }
    if (title.toLowerCase().includes('medicare') || title.toLowerCase().includes('health')) {
      return <Shield className="h-3 w-3" />;
    }
    if (title.toLowerCase().includes('rmd') || title.toLowerCase().includes('distribution')) {
      return <DollarSign className="h-3 w-3" />;
    }
    return <CalendarDays className="h-3 w-3" />;
  }
};

// Enhanced color scheme
const getMilestoneColor = (category: string | null, milestoneType: string) => {
  if (milestoneType === 'personal') {
    const colors = {
      'family': 'bg-pink-500 border-pink-600 text-white',
      'travel': 'bg-blue-500 border-blue-600 text-white',
      'financial': 'bg-green-500 border-green-600 text-white',
      'healthcare': 'bg-red-500 border-red-600 text-white',
      'education': 'bg-purple-500 border-purple-600 text-white',
      'housing': 'bg-orange-500 border-orange-600 text-white',
      'career': 'bg-indigo-500 border-indigo-600 text-white',
      'vehicle': 'bg-gray-500 border-gray-600 text-white',
      'achievement': 'bg-yellow-500 border-yellow-600 text-white',
      'default': 'bg-cyan-500 border-cyan-600 text-white'
    };
    return colors[category as keyof typeof colors] || colors.default;
  } else {
    // Standard milestones - more muted colors
    return 'bg-slate-600 border-slate-700 text-white';
  }
};

// Standard milestones that apply to all users
const getStandardMilestones = (currentAge: number) => [
  {
    id: 'ss-early',
    title: 'Early Social Security',
    description: 'Eligible for reduced Social Security benefits (75% of full benefit)',
    targetAge: 62,
    category: 'retirement',
    milestoneType: 'standard' as const,
    icon: 'clock'
  },
  {
    id: 'medicare',
    title: 'Medicare Eligibility',
    description: 'Eligible for Medicare health insurance',
    targetAge: 65,
    category: 'healthcare',
    milestoneType: 'standard' as const,
    icon: 'shield'
  },
  {
    id: 'ss-full',
    title: 'Full Retirement Age',
    description: 'Eligible for full Social Security benefits',
    targetAge: currentAge < 1960 ? 66 : 67, // Simplified calculation
    category: 'retirement',
    milestoneType: 'standard' as const,
    icon: 'clock'
  },
  {
    id: 'catch-up',
    title: 'Catch-up Contributions',
    description: 'Eligible for additional 401(k) and IRA contributions',
    targetAge: 50,
    category: 'financial',
    milestoneType: 'standard' as const,
    icon: 'dollar-sign'
  },
  {
    id: 'rmd',
    title: 'Required Minimum Distributions',
    description: 'Must begin taking RMDs from retirement accounts',
    targetAge: 73,
    category: 'financial',
    milestoneType: 'standard' as const,
    icon: 'dollar-sign'
  }
];

export default function InteractiveTimeline({
  snapshots,
  milestones,
  onYearSelect,
  selectedYear,
  retirementAge,
  startAge,
  endAge,
  currentAge
}: InteractiveTimelineProps) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current age on mount
  useEffect(() => {
    if (scrollContainerRef.current && timelineRef.current) {
      const currentAgePosition = ((currentAge - startAge) / (endAge - startAge)) * timelineRef.current.offsetWidth;
      const containerWidth = scrollContainerRef.current.offsetWidth;
      const scrollPosition = Math.max(0, currentAgePosition - containerWidth / 2);
      
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [currentAge, startAge, endAge]);

  // Calculate timeline dimensions
  const totalYears = endAge - startAge + 1;
  const yearWidth = 100 / totalYears;

  // Get all milestones (personal + standard)
  const personalMilestones = milestones.filter(m => m.milestoneType === 'personal');
  const standardMilestones = getStandardMilestones(currentAge).filter(
    m => m.targetAge >= startAge && m.targetAge <= endAge
  );

  // Calculate milestone offsets to prevent overlap
  const calculateMilestoneOffset = (age: number, milestones: any[], isPersonal: boolean) => {
    const position = getPositionForAge(age);
    const conflictingMilestones = milestones.filter(m => {
      const otherPosition = getPositionForAge(m.targetAge);
      return Math.abs(position - otherPosition) < 3; // Within 3% of each other
    });
    
    if (conflictingMilestones.length <= 1) return 0;
    
    const index = conflictingMilestones.findIndex(m => m.targetAge === age);
    const offset = (index - (conflictingMilestones.length - 1) / 2) * 15; // 15px spacing
    return offset;
  };

  // Create age markers for every 5 years
  const ageMarkers = [];
  for (let age = startAge; age <= endAge; age += 5) {
    ageMarkers.push(age);
  }
  // Always include the end age
  if (!ageMarkers.includes(endAge)) {
    ageMarkers.push(endAge);
  }

  const handleYearClick = (age: number) => {
    const year = new Date().getFullYear() + (age - currentAge);
    onYearSelect(year);
  };

  const getPositionForAge = (age: number) => {
    return ((age - startAge) / totalYears) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Interactive Life & Retirement Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Main Timeline with Integrated Milestones */}
          <div className="relative py-8">
            <div className="text-sm font-medium text-gray-600 mb-6 text-center">Life & Retirement Timeline</div>
            
            {/* Scrollable Timeline Container */}
            <div 
              ref={scrollContainerRef}
              className="relative overflow-x-auto pb-4" 
              style={{ scrollBehavior: 'smooth' }}
            >
              <div 
                ref={timelineRef} 
                className="relative h-20 min-w-full"
                style={{ width: `${Math.max(totalYears * 60, 800)}px` }} // 60px per year, minimum 800px
              >
                {/* Main timeline line */}
                <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 rounded-full transform -translate-y-1/2"></div>
                
                {/* Age numbers with milestones */}
                {Array.from({ length: totalYears }, (_, i) => {
                  const age = startAge + i;
                  const year = new Date().getFullYear() + (age - currentAge);
                  const isCurrent = age === currentAge;
                  const isRetired = age >= retirementAge;
                  const isSelected = selectedYear === year;
                  const position = (i / (totalYears - 1)) * 100; // Even distribution
                  
                  // Find milestones at this age
                  const personalMilestone = personalMilestones.find(m => m.targetAge === age);
                  const standardMilestone = standardMilestones.find(m => m.targetAge === age);
                  
                  return (
                    <TooltipProvider key={age}>
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                            style={{ 
                              left: `${8 + (position * 0.84)}%`, // Account for padding
                              top: '50%' 
                            }}
                            onClick={() => handleYearClick(age)}
                            onMouseEnter={() => setHoveredYear(age)}
                            onMouseLeave={() => setHoveredYear(null)}
                          >
                            {/* Clickable age number */}
                            <div className={`
                              px-2 py-1 rounded text-xs font-bold transition-all duration-200 border-2 min-w-[32px] text-center
                              ${isCurrent ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300' : ''}
                              ${isSelected ? 'bg-yellow-500 text-white border-yellow-600' : ''}
                              ${isRetired && !isCurrent && !isSelected ? 'bg-green-500 text-white border-green-600' : ''}
                              ${!isCurrent && !isSelected && !isRetired ? 'bg-white text-gray-700 border-gray-300 hover:border-gray-400' : ''}
                              hover:scale-110 hover:shadow-lg
                            `}>
                              {age}
                              
                              {/* Current age indicator */}
                              {isCurrent && (
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                  <div className="bg-blue-600 text-white text-[10px] px-1 py-0.5 rounded font-semibold">
                                    NOW
                                  </div>
                                </div>
                              )}
                              
                              {/* Retirement marker */}
                              {age === retirementAge && !isCurrent && (
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                  <div className="bg-green-600 text-white text-[10px] px-1 py-0.5 rounded font-semibold">
                                    RETIRE
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Personal milestone above */}
                            {personalMilestone && (
                              <div 
                                className="absolute -top-10 left-1/2 transform -translate-x-1/2"
                                style={{ 
                                  marginLeft: `${calculateMilestoneOffset(age, personalMilestones, true)}px` 
                                }}
                              >
                                <div className={`
                                  w-4 h-4 rounded-full border flex items-center justify-center shadow-sm
                                  hover:scale-125 transition-all duration-200
                                  ${getMilestoneColor(personalMilestone.category, personalMilestone.milestoneType)}
                                `}>
                                  {getMilestoneIcon(personalMilestone.category, personalMilestone.milestoneType, personalMilestone.title)}
                                </div>
                              </div>
                            )}

                            {/* Standard milestone below */}
                            {standardMilestone && (
                              <div 
                                className="absolute top-10 left-1/2 transform -translate-x-1/2"
                                style={{ 
                                  marginLeft: `${calculateMilestoneOffset(age, standardMilestones, false)}px` 
                                }}
                              >
                                <div className={`
                                  w-4 h-4 rounded-full border flex items-center justify-center shadow-sm
                                  hover:scale-125 transition-all duration-200
                                  ${getMilestoneColor(standardMilestone.category, standardMilestone.milestoneType)}
                                `}>
                                  {getMilestoneIcon(standardMilestone.category, standardMilestone.milestoneType, standardMilestone.title)}
                                </div>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs">
                            <div className="font-semibold mb-1">Age {age} • Year {year}</div>
                            {personalMilestone && (
                              <div className="mb-2 p-2 bg-blue-50 rounded">
                                <div className="font-medium text-sm">{personalMilestone.title}</div>
                                <div className="text-xs text-gray-600">{personalMilestone.description}</div>
                              </div>
                            )}
                            {standardMilestone && (
                              <div className="mb-2 p-2 bg-gray-50 rounded">
                                <div className="font-medium text-sm">{standardMilestone.title}</div>
                                <div className="text-xs text-gray-600">{standardMilestone.description}</div>
                              </div>
                            )}
                            {!personalMilestone && !standardMilestone && (
                              <div className="text-sm text-gray-500">Click to view financial details</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
              
              {/* Scroll indicators */}
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>← Scroll to see earlier ages</span>
                <span>Scroll to see later ages →</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-300 rounded border"></div>
              <span className="text-sm text-gray-600">Current Age</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded border"></div>
              <span className="text-sm text-gray-600">Retirement Years</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-300 rounded border"></div>
              <span className="text-sm text-gray-600">Selected Year</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}