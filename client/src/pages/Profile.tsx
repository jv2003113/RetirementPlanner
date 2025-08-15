import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { User, MultiStepFormProgress } from "@shared/schema";
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

  // Fetch form progress data
  const { data: formProgress, isLoading: isLoadingProgress } = useQuery<MultiStepFormProgress | null>({
    queryKey: [`/api/users/${userId}/multi-step-form-progress`],
  });

  // All users get the same step-by-step experience

  if (isLoadingUser || isLoadingProgress) {
    return (
      <div className="py-4">
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-[600px] mb-8" />
      </div>
    );
  }


  return (
    <div>
      <div className="py-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Goals</h1>
        <p className="text-lg text-gray-600 mb-4">
          Manage your retirement planning information and goals
        </p>
      </div>
      <MultiStepRetirementForm userId={userId} />
    </div>
  );
};

export default Profile;