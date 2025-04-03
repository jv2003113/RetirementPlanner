import React from 'react';
import { Activity } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LucideIcon, 
  AlertCircle, 
  DollarSign, 
  Target, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Sliders, 
  Home, 
  HeartPulse, 
  GraduationCap, 
  PlaneTakeoff
} from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
}

const iconMap: Record<string, LucideIcon> = {
  'alert': AlertCircle,
  'financial': DollarSign,
  'goal': Target,
  'account': Briefcase,
  'general': FileText,
  'income': TrendingUp,
  'portfolio': Sliders,
  'housing': Home,
  'healthcare': HeartPulse,
  'education': GraduationCap,
  'travel': PlaneTakeoff
};

// Helper function to format activity title 
const formatActivityTitle = (activity: Activity): string => {
  // If there's a title, use it
  if ('title' in activity) {
    return activity.title as string;
  }
  
  // Otherwise format from type
  const type = activity.activityType || 'general';
  return type.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ActivityList: React.FC<ActivityListProps> = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => {
            // Determine the icon based on the activity type
            let activityType = activity.activityType || 'general';
            
            // If type is goal-related, check the description for more specific icons
            if (activityType === 'goal') {
              if (activity.description?.toLowerCase().includes('income')) {
                activityType = 'income';
              } else if (activity.description?.toLowerCase().includes('travel')) {
                activityType = 'travel';
              } else if (activity.description?.toLowerCase().includes('healthcare')) {
                activityType = 'healthcare';
              } else if (activity.description?.toLowerCase().includes('housing')) {
                activityType = 'housing';
              } else if (activity.description?.toLowerCase().includes('education')) {
                activityType = 'education';
              }
            }
            
            const Icon = iconMap[activityType] || FileText;
            
            return (
              <div key={activity.id || index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-md ${
                  activityType === 'alert' ? 'bg-red-100 text-red-600' :
                  activityType === 'financial' || activityType === 'income' ? 'bg-green-100 text-green-600' :
                  activityType === 'goal' ? 'bg-blue-100 text-blue-600' :
                  activityType === 'account' || activityType === 'portfolio' ? 'bg-purple-100 text-purple-600' :
                  activityType === 'travel' ? 'bg-amber-100 text-amber-600' :
                  activityType === 'healthcare' ? 'bg-cyan-100 text-cyan-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{formatActivityTitle(activity)}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.date || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No recent activities yet.</p>
            <p className="text-sm mt-1">Actions like updating your profile, creating retirement goals, or making investment changes will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityList;