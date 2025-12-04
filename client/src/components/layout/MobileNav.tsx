import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  UserIcon,
  BanknoteIcon,
  CreditCardIcon
} from "lucide-react";

const MobileNav = () => {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <HomeIcon className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <UserIcon className="h-5 w-5" /> },
    { path: "/cash-flow", label: "Cash Flow", icon: <CreditCardIcon className="h-5 w-5" /> },
    { path: "/portfolio", label: "Portfolio", icon: <BanknoteIcon className="h-5 w-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
      {navItems.map((item) => (
        <Link
          href={item.path}
          key={item.path}
          className="flex flex-col items-center px-2 py-1"
        >
          <span
            className={cn(
              location === item.path ? "text-primary" : "text-gray-500"
            )}
          >
            {item.icon}
          </span>
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
      <Link
        href="/account"
        className="flex flex-col items-center px-2 py-1"
      >
        <span
          className={cn(
            location === "/account" ? "text-primary" : "text-gray-500"
          )}
        >
          <UserIcon className="h-5 w-5" />
        </span>
        <span className="text-xs mt-1">Account</span>
      </Link>
    </nav>
  );
};

export default MobileNav;
