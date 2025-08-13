import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { AnnualSnapshot, Milestone, StandardMilestone } from "@shared/schema";

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

// Enhanced milestone icon mapping
const getMilestoneIcon = (category: string | null, milestoneType: string, title: string) => {
  if (milestoneType === 'plan') {
    // Plan milestones - same size as standard milestones
    if (title.toLowerCase().includes('retirement')) {
      return <Briefcase className="h-3 w-3" />;
    }
    if (title.toLowerCase().includes('social security')) {
      return <Clock className="h-3 w-3" />;
    }
    if (title.toLowerCase().includes('roth')) {
      return <TrendingUp className="h-3 w-3" />;
    }
    return <Target className="h-3 w-3" />;
  } else if (milestoneType === 'personal') {
    switch (category) {
      case 'family': return <Heart className="h-2 w-2" />;
      case 'travel': return <Plane className="h-2 w-2" />;
      case 'financial': return <DollarSign className="h-2 w-2" />;
      case 'healthcare': return <Shield className="h-2 w-2" />;
      case 'education': return <GraduationCap className="h-2 w-2" />;
      case 'housing': return <Home className="h-2 w-2" />;
      case 'career': return <Briefcase className="h-2 w-2" />;
      case 'vehicle': return <Car className="h-2 w-2" />;
      case 'achievement': return <Trophy className="h-2 w-2" />;
      default: return <Target className="h-2 w-2" />;
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
  if (milestoneType === 'plan') {
    // Plan milestones - distinctive colors
    return 'bg-blue-600 border-blue-700 text-white';
  } else if (milestoneType === 'personal') {
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

// Plan-specific milestones based on user's retirement plan
const getPlanMilestones = (retirementAge: number, currentAge: number) => [
  {
    id: 'plan-retirement',
    title: 'Planned Retirement',
    description: 'Your selected retirement age',
    targetAge: retirementAge,
    category: 'retirement',
    milestoneType: 'plan' as const,
    icon: 'briefcase'
  }
];

// Transform StandardMilestone to match the expected interface
const transformStandardMilestone = (milestone: StandardMilestone) => ({
  id: milestone.id.toString(),
  title: milestone.title,
  description: milestone.description,
  targetAge: milestone.targetAge,
  category: milestone.category,
  milestoneType: 'standard' as const,
  icon: milestone.icon
});

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
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: any }>({ 
    visible: false, 
    x: 0, 
    y: 0, 
    content: null 
  });
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch standard milestones from API
  const { data: standardMilestonesData, isLoading: standardMilestonesLoading } = useQuery<StandardMilestone[]>({
    queryKey: ["standard-milestones"],
    queryFn: async () => {
      const response = await fetch("/api/milestones/standard");
      if (!response.ok) throw new Error("Failed to fetch standard milestones");
      return response.json();
    },
  });

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

  // Get all milestones (personal + plan + general)
  const personalMilestones = milestones.filter(m => m.milestoneType === 'personal');
  const planMilestones = getPlanMilestones(retirementAge, currentAge).filter(
    m => m.targetAge >= startAge && m.targetAge <= endAge
  );
  // Transform and filter standard milestones from API
  const generalMilestones = standardMilestonesData 
    ? standardMilestonesData
        .map(transformStandardMilestone)
        .filter(m => m.targetAge >= startAge && m.targetAge <= endAge)
    : [];

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

  // Show loading state if standard milestones are still loading
  if (standardMilestonesLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Main Timeline with Integrated Milestones */}
          <div className="relative py-2">
            
            {/* Scrollable Timeline Container */}
            <div 
              ref={scrollContainerRef}
              className="relative overflow-x-auto pb-4" 
              style={{ scrollBehavior: 'smooth' }}
            >
              <div 
                ref={timelineRef} 
                className="relative h-24 min-w-full"
                style={{ width: `${Math.max(totalYears * 60, 800)}px` }} // 60px per year, minimum 800px
              >
                {/* Main timeline line */}
                <div 
                  className="absolute top-1/2 h-1 bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 rounded-full transform -translate-y-1/2"
                  style={{ 
                    left: '2%', 
                    right: '2%'
                  }}
                ></div>
                
                {/* Age numbers with milestones */}
                {Array.from({ length: totalYears }, (_, i) => {
                  const age = startAge + i;
                  const year = new Date().getFullYear() + (age - currentAge);
                  const isCurrent = age === currentAge;
                  const isRetired = age >= retirementAge;
                  const isSelected = selectedYear === year;
                  const position = (i / (totalYears - 1)) * 100; // Even distribution
                  
                  // Find milestones at this age
                  const planMilestone = planMilestones.find(m => m.targetAge === age);
                  const generalMilestone = generalMilestones.find(m => m.targetAge === age);
                  
                  // Get all milestones for this age for tooltip
                  const allMilestonesAtAge = [
                    ...planMilestones.filter(m => m.targetAge === age),
                    ...personalMilestones.filter(m => m.targetAge === age),
                    ...generalMilestones.filter(m => m.targetAge === age)
                  ];
                  
                  return (
                    <div key={age}>
                      <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{ 
                          left: `${2 + (position * 0.96)}%`, // Add 2% margin and compress to 96% width
                          top: '50%' 
                        }}
                        onClick={() => handleYearClick(age)}
                        onMouseEnter={(e) => {
                          setHoveredYear(age);
                          setTooltip({
                            visible: true,
                            x: e.clientX,
                            y: e.clientY - 10,
                            content: { age, year, milestones: allMilestonesAtAge }
                          });
                        }}
                        onMouseMove={(e) => {
                          if (tooltip.visible) {
                            setTooltip(prev => ({
                              ...prev,
                              x: e.clientX,
                              y: e.clientY - 10
                            }));
                          }
                        }}
                        onMouseLeave={() => {
                          setHoveredYear(null);
                          setTooltip({ visible: false, x: 0, y: 0, content: null });
                        }}
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
                        </div>

                        {/* Plan milestone above - aligned to center */}
                        {planMilestone && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <div className={`
                              w-4 h-4 rounded-full border flex items-center justify-center shadow-sm
                              hover:scale-125 transition-all duration-200
                              ${getMilestoneColor(planMilestone.category, planMilestone.milestoneType)}
                            `}>
                              {getMilestoneIcon(planMilestone.category, planMilestone.milestoneType, planMilestone.title)}
                            </div>
                          </div>
                        )}

                        {/* General milestones below - moved down to prevent overlap */}
                        {generalMilestone && (
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                            <div className={`
                              w-4 h-4 rounded-full border flex items-center justify-center shadow-sm
                              hover:scale-125 transition-all duration-200
                              ${getMilestoneColor(generalMilestone.category, generalMilestone.milestoneType)}
                            `}>
                              {getMilestoneIcon(generalMilestone.category, generalMilestone.milestoneType, generalMilestone.title)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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

        {/* Custom Cursor-Following Tooltip */}
        {tooltip.visible && tooltip.content && (
          <div
            className="fixed z-[10000] bg-gradient-to-r from-slate-800 to-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-600 max-w-xs pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-bold text-sm mb-2 text-blue-300">
              Age {tooltip.content.age} • {tooltip.content.year}
            </div>
            
            {tooltip.content.milestones.length > 0 ? (
              <div className="space-y-2">
                {tooltip.content.milestones.map((milestone: any, index: number) => (
                  <div key={index} className={`
                    p-2 rounded-md text-xs
                    ${milestone.milestoneType === 'plan' ? 'bg-blue-500/20 border border-blue-400/30' : ''}
                    ${milestone.milestoneType === 'personal' ? 'bg-purple-500/20 border border-purple-400/30' : ''}
                    ${milestone.milestoneType === 'standard' ? 'bg-gray-500/20 border border-gray-400/30' : ''}
                  `}>
                    <div className="flex items-center gap-2">
                      <div className={`
                        w-3 h-3 rounded-full flex items-center justify-center
                        ${getMilestoneColor(milestone.category, milestone.milestoneType)}
                      `}>
                        {getMilestoneIcon(milestone.category, milestone.milestoneType, milestone.title)}
                      </div>
                      <div className="font-medium text-white">{milestone.title}</div>
                    </div>
                    <div className="text-gray-300 text-xs mt-1">{milestone.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400">Click to view financial details</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}