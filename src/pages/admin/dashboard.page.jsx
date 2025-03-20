import Sidebar from "@/components/admin/Sidebar";
import DashboardStats from "@/components/admin/DashboardStats";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
        <DashboardStats />
      </div>
    </div>
  );
}