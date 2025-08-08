import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface QuickActionsProps {
  onGenerateKey: () => void;
}

export default function QuickActions({ onGenerateKey }: QuickActionsProps) {
  const { isAdmin } = useAuth();

  const handleViewLogs = () => {
    // TODO: Navigate to logs page
    console.log("View logs");
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log("Export data");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button 
            onClick={onGenerateKey}
            className="w-full justify-between"
          >
            <span>Generate New Key</span>
            <Plus className="h-4 w-4" />
          </Button>
          
          {isAdmin && (
            <Button 
              variant="outline"
              onClick={handleViewLogs}
              className="w-full justify-between"
            >
              <span>View System Logs</span>
              <FileText className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={handleExportData}
            className="w-full justify-between"
          >
            <span>Export Data</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
