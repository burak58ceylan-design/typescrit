import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !!token, // Sadece token varsa çalıştır
    onError: (error: any) => {
      // Token geçersizse localStorage'dan temizle
      if (error.message?.includes('401') || error.message?.includes('Invalid token')) {
        localStorage.removeItem('token');
        queryClient.setQueryData(["/api/auth/me"], null);
      }
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
  };

  // Hatalı token'ı temizle
  React.useEffect(() => {
    if (error && token) {
      const errorMessage = error?.message || '';
      if (errorMessage.includes('401') || errorMessage.includes('Invalid token')) {
        localStorage.removeItem('token');
        queryClient.setQueryData(["/api/auth/me"], null);
      }
    }
  }, [error, token, queryClient]);

  // Token yoksa loading değil
  const actuallyLoading = token ? isLoading : false;

  return {
    user,
    isLoading: actuallyLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginLoading: loginMutation.isPending,
    registerLoading: registerMutation.isPending,
  };
}
