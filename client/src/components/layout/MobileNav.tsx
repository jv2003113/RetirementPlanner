import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  HomeIcon, 
  UserIcon, 
  BanknoteIcon, 
  BarChart3Icon,
  ActivitySquareIcon
} from "lucide-react";

const MobileNav = () => {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <HomeIcon className="h-6 w-6" /> },
    { path: "/profile", label: "Profile", icon: <UserIcon className="h-6 w-6" /> },
    { path: "/portfolio", label: "Portfolio", icon: <BanknoteIcon className="h-6 w-6" /> },
    { path: "/simulation", label: "Simulation", icon: <ActivitySquareIcon className="h-6 w-6" /> },
    { path: "/income-projections", label: "Planning", icon: <BarChart3Icon className="h-6 w-6" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-10">
      {navItems.map((item) => (
        <Link href={item.path} key={item.path}>
          <a className="flex flex-col items-center">
            <span
              className={cn(
                location === item.path ? "text-primary" : "text-gray-500"
              )}
            >
              {item.icon}
            </span>
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
};

export default MobileNav;
