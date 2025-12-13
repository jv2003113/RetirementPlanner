import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user: authUser } = useAuth();
  const [location, setLocation] = useLocation();
  const userId = authUser?.id || 1;

  const { toast } = useToast();

  // Fetch user data to check if profile is complete
  const { data: userData, isLoading: isLoadingUser, error } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${userId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      return data;
    },
    enabled: !!authUser && isAuthenticated,
    retry: false,
  });

  // Fetch multi-step form progress
  const { data: progressData } = useQuery({
    queryKey: ['form-progress', userId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${userId}/multi-step-form-progress`, {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return await response.json();
    },
    enabled: !!authUser && isAuthenticated,
  });

  // Check if user is new (has incomplete profile)
  const isNewUser = (user: User | undefined) => {
    if (!user) return true;

    // Strict completeness check: User must have completed all 7 steps of the form
    // OR have the isCompleted flag set
    if (progressData) {
      if (progressData.isCompleted) return false;

      // Check if all steps 1-6 are in the completedSteps array
      // Steps are defined in MultiStepFormContext as 1 to 7
      // We exclude step 7 (Review) from the completeness requirement
      const requiredSteps = [1, 2, 3, 4, 5, 6];
      if (progressData.completedSteps && Array.isArray(progressData.completedSteps)) {
        // Check if every required step is present in completedSteps
        const allStepsCompleted = requiredSteps.every(step => progressData.completedSteps.includes(step));
        if (allStepsCompleted) return false;
      }

      // If we have progress data but haven't completed all steps, consider incomplete
      return true;
    }

    // Fallback for legacy users without progress data:
    // Consider user "new" if they lack essential data
    const hasRetirementInfo = user.currentAge && user.targetRetirementAge;
    const hasFinancialInfo = user.currentIncome && parseFloat(user.currentIncome) > 0;

    return !(hasRetirementInfo && hasFinancialInfo);
  };

  // Redirect new users to profile wizard (except if already on profile page)
  useEffect(() => {
    if (!isLoadingUser && userData && isNewUser(userData) && location !== '/profile') {
      // Show toast explaining why they are being redirected
      toast({
        title: "Profile Incomplete",
        description: "Please complete all sections of your profile (summary 100%) before accessing the retirement plan.",
        variant: "destructive",
      });
      setLocation('/profile');
    }
  }, [userData, isLoadingUser, setLocation, location, progressData, toast]);

  console.log('[ProtectedRoute] isLoading:', isLoading, 'isLoadingUser:', isLoadingUser, 'error:', error, 'isAuthenticated:', isAuthenticated, 'progress:', progressData);

  if (isLoading || isLoadingUser) {
    console.log('[ProtectedRoute] Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('[ProtectedRoute] Error fetching user data, but continuing:', error);
    // Don't block rendering just because user data fetch failed
    // The app can still work with the auth user data
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, returning null');
    return null; // App will handle redirecting to auth page
  }

  console.log('[ProtectedRoute] Rendering children');
  return <>{children}</>;
}
