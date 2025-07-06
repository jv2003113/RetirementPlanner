import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Portfolio from "@/pages/Portfolio";
import IncomeProjections from "@/pages/IncomeProjections";
import CashFlow from "@/pages/CashFlow";
import TaxPlanning from "@/pages/TaxPlanning";
import Healthcare from "@/pages/Healthcare";
import EstatePlanning from "@/pages/EstatePlanning";
import Reports from "@/pages/Reports";
import Simulation from "@/pages/Simulation";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import RothConversionCalculator from "@/components/tax/RothConversionCalculator";

function Router() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 md:pl-64 pt-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/profile" component={Profile} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/income-projections" component={IncomeProjections} />
            <Route path="/cash-flow" component={CashFlow} />
            <Route path="/tax-planning" component={TaxPlanning} />
            <Route path="/healthcare" component={Healthcare} />
            <Route path="/estate-planning" component={EstatePlanning} />
            <Route path="/reports" component={Reports} />
            <Route path="/simulation" component={Simulation} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
