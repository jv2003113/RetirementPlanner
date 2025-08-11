import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { User } from "@shared/schema";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user: authUser } = useAuth();
  const [location, setLocation] = useLocation();
  const userId = authUser?.id || 1;

  // Fetch user data to check if profile is complete
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!authUser && isAuthenticated,
  });

  // Check if user is new (has minimal profile information)
  const isNewUser = (user: User | undefined) => {
    if (!user) return true;
    
    // Consider user "new" if they haven't filled out essential retirement planning info
    const hasRetirementInfo = user.currentAge && user.targetRetirementAge;
    const hasFinancialInfo = user.currentIncome && parseFloat(user.currentIncome) > 0;
    
    // User is "new" if they lack retirement planning data
    return !(hasRetirementInfo && hasFinancialInfo);
  };

  // Redirect new users to profile wizard (except if already on profile page)
  useEffect(() => {
    if (!isLoadingUser && userData && isNewUser(userData) && location !== '/profile') {
      setLocation('/profile');
    }
  }, [userData, isLoadingUser, setLocation, location]);

  if (isLoading || isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // App will handle redirecting to auth page
  }

  return <>{children}</>;
}
