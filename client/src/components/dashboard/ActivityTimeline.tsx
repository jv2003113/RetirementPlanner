import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BanknoteIcon, PieChartIcon, UserIcon } from "lucide-react";
import { format } from "date-fns";

interface Activity {
  id: number;
  activityType: string;
  description: string;
  date: string | Date | null;
  metadata?: Record<string, any> | unknown;
  userId?: number;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contribution_update':
        return (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
            <BanknoteIcon className="h-5 w-5 text-gray-500" />
          </div>
        );
      case 'assessment':
        return (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
            <PieChartIcon className="h-5 w-5 text-gray-500" />
          </div>
        );
      case 'profile_setup':
        return (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
            <UserIcon className="h-5 w-5 text-gray-500" />
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
            <PieChartIcon className="h-5 w-5 text-gray-500" />
          </div>
        );
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'contribution_update':
        return 'Updated 401(k) contribution rate';
      case 'assessment':
        return 'Completed retirement assessment';
      case 'profile_setup':
        return 'Set up retirement goals';
      default:
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  const formatDate = (dateInput: string | Date | null) => {
    if (!dateInput) {
      return format(new Date(), 'MMM d, yyyy'); // Use current date if no date provided
    }
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < activities.length - 1 ? (
                    <span 
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" 
                      aria-hidden="true"
                    ></span>
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getActivityTitle(activity.activityType)}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{activity.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <a href="/profile" className="text-sm font-medium text-primary hover:text-primary-dark">
          View all activity →
        </a>
      </CardFooter>
    </Card>
  );
};

export default ActivityTimeline;
