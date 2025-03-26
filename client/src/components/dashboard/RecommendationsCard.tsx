import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'info';
  actionText: string;
  actionLink: string;
}

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

const RecommendationsCard = ({ recommendations }: RecommendationsCardProps) => {
  const getImpactDetails = (impact: string) => {
    switch (impact) {
      case 'high':
        return { 
          icon: <CheckCircle className="h-6 w-6 text-success" />, 
          label: 'High Impact',
          color: 'text-success'
        };
      case 'medium':
        return { 
          icon: <AlertCircle className="h-6 w-6 text-warning" />, 
          label: 'Medium Impact',
          color: 'text-warning'
        };
      case 'info':
        return { 
          icon: <Info className="h-6 w-6 text-info" />, 
          label: 'Planning',
          color: 'text-info'
        };
      default:
        return { 
          icon: <Info className="h-6 w-6 text-gray-500" />, 
          label: 'Info',
          color: 'text-gray-500'
        };
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Recommendations & Next Steps</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <ul className="divide-y divide-gray-200">
          {recommendations.map((recommendation) => {
            const { icon, label, color } = getImpactDetails(recommendation.impact);
            
            return (
              <li key={recommendation.id} className="py-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{recommendation.title}</h3>
                      <span className={`text-xs ${color} font-medium`}>{label}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {recommendation.description}
                    </p>
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-primary-light bg-primary-light bg-opacity-10 hover:bg-opacity-20 border-transparent"
                        asChild
                      >
                        <a href={recommendation.actionLink}>
                          {recommendation.actionText}
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard;
