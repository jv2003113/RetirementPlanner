import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, BookmarkIcon, HeartPulse } from "lucide-react";

interface ResourceCardProps {
  title: string;
  description: string;
  icon: 'book' | 'healthcare' | 'estate';
  buttonText: string;
  buttonLink: string;
  color: string;
}

const ResourceCard = ({
  title,
  description,
  icon,
  buttonText,
  buttonLink,
  color
}: ResourceCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'book':
        return <BookOpen className={`h-10 w-10 ${color}`} />;
      case 'healthcare':
        return <HeartPulse className={`h-10 w-10 ${color}`} />;
      case 'estate':
        return <BookmarkIcon className={`h-10 w-10 ${color}`} />;
      default:
        return <BookOpen className={`h-10 w-10 ${color}`} />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-5 w-0 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <Button 
            className={buttonText.toLowerCase().includes('tax') ? 'bg-primary hover:bg-primary-dark' : 
              buttonText.toLowerCase().includes('healthcare') ? 'bg-[#43A047] hover:bg-[#2E7D32]' : 
              'bg-[#FFA000] hover:bg-[#FF8F00]'}
            asChild
          >
            <a href={buttonLink}>
              {buttonText}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
