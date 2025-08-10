import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import MultiStepRetirementForm from "@/components/retirement/MultiStepRetirementForm";

const Profile = () => {
  const userId = 1; // For demo purposes

  // Fetch user profile data
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  // Check if user is new (has minimal profile information)
  const isNewUser = (user: User | undefined) => {
    if (!user) return true;
    
    // Consider user "new" if they haven't filled out essential retirement planning info
    const hasBasicInfo = user.firstName && user.lastName && user.email;
    const hasRetirementInfo = user.currentAge && user.targetRetirementAge;
    const hasFinancialInfo = user.currentIncome && parseFloat(user.currentIncome) > 0;
    
    // For testing: You can temporarily return true here to test wizard mode
    // return true;
    
    return !(hasBasicInfo && hasRetirementInfo && hasFinancialInfo);
  };

  if (isLoadingUser) {
    return (
      <div className="py-4">
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-[600px] mb-8" />
      </div>
    );
  }

  const userIsNew = isNewUser(userData);

  return (
    <div>
      <div className="py-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {userIsNew ? "Welcome to Your Retirement Planning Journey!" : "Profile & Goals"}
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {userIsNew 
            ? "Let's create your personalized retirement plan step by step"
            : "Manage your retirement planning information and goals"
          }
        </p>
      </div>
      <MultiStepRetirementForm userId={userId} isWizardMode={userIsNew} />
    </div>
  );
};

export default Profile;