import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Search, Filter, RefreshCw } from "lucide-react";

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [endpointFilter, setEndpointFilter] = useState("all");

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/logs"],
    refetchInterval: 10000, // Auto refresh every 10 seconds
  });

  const filteredLogs = (logs as any[]).filter((log: any) => {
    const matchesSearch = !searchTerm || 
      log.keyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress?.includes(searchTerm) ||
      log.hwid?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "success" && log.success) ||
      (statusFilter === "error" && !log.success);
    
    const matchesEndpoint = endpointFilter === "all" || 
      log.endpoint === endpointFilter;
    
    return matchesSearch && matchesStatus && matchesEndpoint;
  });

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-500">Başarılı</Badge>
    ) : (
      <Badge variant="destructive">Hata</Badge>
    );
  };

  const getEndpointBadge = (endpoint: string) => {
    const color = endpoint === "/api/connect" ? "bg-blue-500" : "bg-orange-500";
    return <Badge className={color}>{endpoint.replace("/api/", "").toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Logları</h1>
          <p className="text-muted-foreground">
            Mod menu API kullanım aktivitelerini takip edin
          </p>
        </div>
        <Button onClick={() => refetch()} size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Yenile
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Key adı, IP veya HWID ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Durum</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="success">Başarılı</SelectItem>
                  <SelectItem value="error">Hata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Endpoint</label>
              <Select value={endpointFilter} onValueChange={setEndpointFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="/api/connect">Connect</SelectItem>
                  <SelectItem value="/api/disconnect">Disconnect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setEndpointFilter("all");
              }}
            >
              Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Aktivitesi</CardTitle>
          <CardDescription>
            Toplam {filteredLogs.length} log kaydı gösteriliyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loglar yükleniyor...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Gösterilecek log kaydı bulunamadı
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih/Saat</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Key Adı</TableHead>
                    <TableHead>HWID</TableHead>
                    <TableHead>IP Adresi</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Yanıt</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        {getEndpointBadge(log.endpoint)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.keyName || "Bilinmiyor"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.hwid ? (
                          <span title={log.hwid}>
                            {log.hwid.length > 12 ? `${log.hwid.substring(0, 12)}...` : log.hwid}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell className="max-w-40 truncate" title={log.userAgent}>
                        {log.userAgent}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.response}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.success)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}