import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Key, Home, Users, Shield, BarChart3, Settings, Code, LogOut, FileText } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Users", href: "/users", icon: Users, adminOnly: true },
  { name: "License Keys", href: "/keys", icon: Shield },
  { name: "API Logs", href: "/logs", icon: FileText, adminOnly: true },
  { name: "Analytics", href: "/analytics", icon: BarChart3, adminOnly: true },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "API Docs", href: "/api-docs", icon: Code },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || isAdmin
  );

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Key className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">KeyPanel</h2>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location === item.href || 
              (item.href === "/dashboard" && location === "/");
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-50 text-primary border-r-4 border-primary" 
                      : "hover:bg-gray-50"
                  )}>
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <Users className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
