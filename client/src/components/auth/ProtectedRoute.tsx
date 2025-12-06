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

  console.log('[ProtectedRoute] isLoading:', isLoading, 'isLoadingUser:', isLoadingUser, 'error:', error, 'isAuthenticated:', isAuthenticated);

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
