import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import MultiStepRetirementForm from "@/components/retirement/MultiStepRetirementForm";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user: authUser } = useAuth();
  const userId = authUser?.id || 1; // Use authenticated user's ID

  // Fetch user profile data
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  // Check if user is new (has minimal profile information)
  const isNewUser = (user: User | undefined) => {
    if (!user) return true;
    
    // Consider user "new" if they haven't filled out essential retirement planning info
    // Check for retirement-specific data, not just basic signup info
    const hasRetirementInfo = user.currentAge && user.targetRetirementAge;
    const hasFinancialInfo = user.currentIncome && parseFloat(user.currentIncome) > 0;
    const hasRetirementGoals = user.desiredLifestyle;
    
    // For testing wizard mode: uncomment the line below
    // return true;
    
    // User is "new" if they lack retirement planning data
    return !(hasRetirementInfo && hasFinancialInfo);
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