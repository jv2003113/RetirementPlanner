import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Portfolio from "@/pages/Portfolio";
import CashFlow from "@/pages/CashFlow";
import TaxPlanning from "@/pages/TaxPlanning";
import Healthcare from "@/pages/Healthcare";
import EstatePlanning from "@/pages/EstatePlanning";
import Reports from "@/pages/Reports";
import Simulation from "@/pages/Simulation";
import RetirementPlan from "@/pages/RetirementPlan";
import AccountSetup from "@/pages/AccountSetup";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import RothConversionCalculator from "@/components/tax/RothConversionCalculator";


function Router() {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  console.log('[Router] isCheckingAuth:', isCheckingAuth, 'isAuthenticated:', isAuthenticated);

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    console.log('[Router] Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    console.log('[Router] Showing auth page');
    return <Auth />;
  }

  // Show main app if authenticated
  console.log('[Router] Showing main app');
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-800">
        <Sidebar />
        <main className="flex-1 md:pl-64 pt-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/retirement-plan" component={RetirementPlan} />
              <Route path="/profile" component={Profile} />
              <Route path="/portfolio" component={Portfolio} />
              <Route path="/cash-flow" component={CashFlow} />
              <Route path="/tax-planning" component={TaxPlanning} />
              <Route path="/healthcare" component={Healthcare} />
              <Route path="/estate-planning" component={EstatePlanning} />
              <Route path="/reports" component={Reports} />
              <Route path="/simulation" component={Simulation} />
              <Route path="/account" component={AccountSetup} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <Router />
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
