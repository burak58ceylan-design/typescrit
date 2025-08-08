import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Key, BarChart3, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsGrid() {
  const { isAdmin } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    enabled: isAdmin,
  });

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Keys",
      value: stats?.activeKeys || 0,
      change: "+8.2%",
      trend: "up",
      icon: Key,
      color: "green",
    },
    {
      title: "API Requests",
      value: `${((stats?.apiRequests || 0) / 1000).toFixed(1)}K`,
      change: "+23.1%",
      trend: "up",
      icon: BarChart3,
      color: "yellow",
    },
    {
      title: "Active Sessions",
      value: stats?.activeSessions || 0,
      change: "+15.3%",
      trend: "up",
      icon: Activity,
      color: "purple",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      case "red":
        return "bg-red-100 text-red-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <Card key={stat.title} className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm mt-1 flex items-center ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {stat.change} from last month
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
