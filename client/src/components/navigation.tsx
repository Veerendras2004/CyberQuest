import { Link, useLocation } from "wouter";
import { Bell, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface NavigationProps {
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    totalScore: number;
  };
}

export default function Navigation({ user }: NavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", active: location === "/" },
    { path: "/quiz", label: "Quiz", active: location === "/quiz" },
    { path: "/activities", label: "Activities", active: location === "/activities" },
    { path: "/teamhub", label: "TeamHub", active: location === "/teamhub" },
    { path: "/cyberlab", label: "CyberLab", active: location === "/cyberlab" },
    { path: "/community", label: "Community", active: location === "/community" },
    { path: "/leaderboard", label: "Leaderboard", active: location === "/leaderboard" },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 btn-gradient-primary rounded-lg flex items-center justify-center">
                <Gamepad2 className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold text-gray-900">CyberSecLearn</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span className={`font-medium transition-colors ${
                  item.active 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-gray-600 hover:text-primary"
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.totalScore} pts</p>
                </div>
                <div className="w-8 h-8 btn-gradient-warning rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {getInitials(user.firstName, user.lastName)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
