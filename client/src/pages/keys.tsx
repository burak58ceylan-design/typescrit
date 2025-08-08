import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import KeyGenerationModal from "@/components/modals/key-generation-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Copy, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Keys() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["/api/keys"],
  });

  const updateKeyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/keys/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "Success",
        description: "License key updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update license key",
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/keys/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "Success",
        description: "License key deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete license key",
        variant: "destructive",
      });
    },
  });

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "License key copied to clipboard",
    });
  };

  const toggleKeyStatus = (keyItem: any) => {
    const newStatus = keyItem.status === "active" ? "suspended" : "active";
    updateKeyMutation.mutate({
      id: keyItem.id,
      updates: { status: newStatus }
    });
  };

  const deleteKey = (keyItem: any) => {
    if (confirm(`Are you sure you want to delete license key "${keyItem.key.substring(0, 8)}..."?`)) {
      deleteKeyMutation.mutate(keyItem.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getKeyTypeColor = (keyType: string) => {
    switch (keyType) {
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "lifetime":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">License Keys</h1>
              <p className="text-gray-600">Manage your license keys and access controls</p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsKeyModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Key
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>All License Keys</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="w-full h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : keys?.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No license keys found</h3>
                  <p className="text-gray-500 mb-4">
                    {isAdmin ? "Generate your first license key to get started." : "You don't have any license keys yet."}
                  </p>
                  {isAdmin && (
                    <Button onClick={() => setIsKeyModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Key
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          License Key
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {keys?.map((keyItem: any) => (
                        <tr key={keyItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {keyItem.key}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyKey(keyItem.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant="secondary"
                              className={getKeyTypeColor(keyItem.keyType)}
                            >
                              {keyItem.keyType}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant="secondary"
                              className={getStatusColor(keyItem.status)}
                            >
                              {keyItem.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {keyItem.expiresAt 
                              ? formatDistanceToNow(new Date(keyItem.expiresAt), { addSuffix: true })
                              : "Never"
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {keyItem.lastUsed 
                              ? formatDistanceToNow(new Date(keyItem.lastUsed), { addSuffix: true })
                              : "Never"
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {isAdmin && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleKeyStatus(keyItem)}
                                    disabled={updateKeyMutation.isPending}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteKey(keyItem)}
                                    disabled={deleteKeyMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <KeyGenerationModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
    </div>
  );
}
