import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  HomeIcon, 
  UserIcon, 
  BanknoteIcon, 
  LogOutIcon
} from "lucide-react";

const MobileNav = () => {
  const [location] = useLocation();
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: <HomeIcon className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <UserIcon className="h-5 w-5" /> },
    { path: "/portfolio", label: "Portfolio", icon: <BanknoteIcon className="h-5 w-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
      {navItems.map((item) => (
        <Link href={item.path} key={item.path}>
          <a className="flex flex-col items-center px-2 py-1">
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
      <button 
        onClick={handleLogout}
        disabled={isLoading}
        className="flex flex-col items-center px-2 py-1 text-gray-500 disabled:opacity-50"
      >
        <LogOutIcon className="h-5 w-5" />
        <span className="text-xs mt-1">
          {isLoading ? 'Wait...' : 'Logout'}
        </span>
      </button>
    </nav>
  );
};

export default MobileNav;
