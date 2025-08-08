import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentUsers from "@/components/dashboard/recent-users";
import QuickActions from "@/components/dashboard/quick-actions";
import SystemStatus from "@/components/dashboard/system-status";
import KeyGenerationModal from "@/components/modals/key-generation-modal";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.username}</p>
          </div>

          <StatsGrid />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <RecentUsers />
            </div>
            
            <div className="space-y-6">
              <QuickActions onGenerateKey={() => setIsKeyModalOpen(true)} />
              <SystemStatus />
            </div>
          </div>
        </main>
      </div>

      <KeyGenerationModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
    </div>
  );
}
