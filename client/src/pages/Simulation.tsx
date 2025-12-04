import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import MonteCarloSimulation from "@/components/simulations/MonteCarloSimulation";
import { getQueryFn } from "@/lib/queryClient";

import { useAuth } from "@/contexts/AuthContext";

export default function Simulation() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!userId,
  });

  if (isUserLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData || !userId) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p className="text-muted-foreground">Please log in to access retirement simulations.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Retirement Simulations</h1>
        <p className="text-muted-foreground">
          Use advanced Monte Carlo simulations to project your retirement portfolio under different market conditions.
        </p>
      </div>

      <MonteCarloSimulation userId={userId} />
    </div>
  );
}