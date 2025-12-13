import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  HomeIcon,
  UserIcon,
  BanknoteIcon,
  BarChart3Icon,
  CreditCardIcon,
  FileTextIcon,
  BookOpenIcon,
  LayoutPanelLeftIcon,
  HeartPulseIcon,
  ActivitySquareIcon,
  Target
} from "lucide-react";
import { ERLogo } from "@/components/ui/ERLogo";

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <HomeIcon className="h-6 w-6" /> },
    { path: "/profile", label: "Profile & Goals", icon: <UserIcon className="h-6 w-6" /> },
    { path: "/retirement-plan", label: "Retirement Plan", icon: <Target className="h-6 w-6" /> },
    { path: "/cash-flow", label: "Cash Flow", icon: <CreditCardIcon className="h-6 w-6" /> },
    { path: "/portfolio", label: "Portfolio", icon: <BanknoteIcon className="h-6 w-6" /> },
    { path: "/simulation", label: "Monte Carlo Sim", icon: <ActivitySquareIcon className="h-6 w-6" /> },
    { path: "/tax-planning", label: "Tax Planning", icon: <FileTextIcon className="h-6 w-6" /> },
    { path: "/healthcare", label: "Healthcare", icon: <HeartPulseIcon className="h-6 w-6" /> },
    { path: "/estate-planning", label: "Estate Planning", icon: <LayoutPanelLeftIcon className="h-6 w-6" /> },
    { path: "/reports", label: "Reports", icon: <BookOpenIcon className="h-6 w-6" /> },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white shadow-md z-10">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg p-2">
              <ERLogo className="h-10 w-10 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Retire Easy</span>
          </div>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                href={item.path}
                key={item.path}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === item.path
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
          <Link href="/account">
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <UserIcon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {user ? `${user.firstName || user.username}` : 'Loading...'}
                </p>
                <p className="text-xs text-gray-500 group-hover:text-blue-600">
                  Account Settings
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
