import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SystemStatus() {
  const statusItems = [
    {
      label: "API Status",
      status: "online",
      value: "Online",
    },
    {
      label: "Database",
      status: "online",
      value: "Connected",
    },
    {
      label: "Server Load",
      status: "warning",
      value: "68%",
    },
    {
      label: "Uptime",
      status: "info",
      value: "99.9%",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <div className="flex items-center space-x-2">
                {item.status !== "info" && (
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(item.status)}`}></div>
                )}
                <Badge 
                  variant="secondary"
                  className={getStatusColor(item.status)}
                >
                  {item.value}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
