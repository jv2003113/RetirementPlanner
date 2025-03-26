import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";

interface RetirementReadinessCardProps {
  score: number;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  description: string;
}

const RetirementReadinessCard = ({
  score,
  label,
  icon,
  bgColor,
  description,
}: RetirementReadinessCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {typeof score === 'number' && score.toString().includes('.') 
                    ? score.toFixed(1) 
                    : score}
                  {label.toLowerCase().includes('rate') ? '%' : ''}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span className="font-medium text-primary hover:text-primary-dark">
            {description}
          </span>
        </div>
        <div className="mt-2">
          <Progress value={score} className="h-2.5" />
        </div>
      </div>
    </Card>
  );
};

export default RetirementReadinessCard;
