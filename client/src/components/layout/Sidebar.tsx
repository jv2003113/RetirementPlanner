import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  HomeIcon, 
  UserIcon, 
  BanknoteIcon, 
  BarChart3Icon, 
  CreditCardIcon, 
  FileTextIcon,
  BookOpenIcon,
  LayoutPanelLeftIcon,
  HeartPulseIcon
} from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <HomeIcon className="h-6 w-6" /> },
    { path: "/profile", label: "Profile & Goals", icon: <UserIcon className="h-6 w-6" /> },
    { path: "/portfolio", label: "Portfolio", icon: <BanknoteIcon className="h-6 w-6" /> },
    { path: "/income-projections", label: "Income Projections", icon: <BarChart3Icon className="h-6 w-6" /> },
    { path: "/cash-flow", label: "Cash Flow", icon: <CreditCardIcon className="h-6 w-6" /> },
    { path: "/tax-planning", label: "Tax Planning", icon: <FileTextIcon className="h-6 w-6" /> },
    { path: "/healthcare", label: "Healthcare", icon: <HeartPulseIcon className="h-6 w-6" /> },
    { path: "/estate-planning", label: "Estate Planning", icon: <LayoutPanelLeftIcon className="h-6 w-6" /> },
    { path: "/reports", label: "Reports", icon: <BookOpenIcon className="h-6 w-6" /> },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white shadow-md z-10">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <span className="text-xl font-semibold text-primary">RetireWise</span>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 space-y-1 px-2">
            {navItems.map((item) => (
              <Link href={item.path} key={item.path}>
                <a
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    location === item.path
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <Link href="/profile">
                <a className="text-xs font-medium text-gray-500 hover:text-gray-700">
                  Settings
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
