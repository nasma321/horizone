import { Link, useLocation } from "react-router";
import { Building, CalendarCheck, Star, LayoutDashboard } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4">
      <div className="text-xl font-bold mb-8 pl-4">Admin Dashboard</div>
      
      <div className="space-y-2">
        <Link 
          to="/admin" 
          className={`flex items-center p-3 rounded-lg ${
            isActive('/admin') ? 'bg-gray-800' : 'hover:bg-gray-800'
          }`}
        >
          <LayoutDashboard className="h-5 w-5 mr-3" />
          Dashboard
        </Link>
        
        <Link 
          to="/admin/hotels" 
          className={`flex items-center p-3 rounded-lg ${
            isActive('/admin/hotels') ? 'bg-gray-800' : 'hover:bg-gray-800'
          }`}
        >
          <Building className="h-5 w-5 mr-3" />
          Hotels
        </Link>
        
        <Link 
          to="/admin/bookings" 
          className={`flex items-center p-3 rounded-lg ${
            isActive('/admin/bookings') ? 'bg-gray-800' : 'hover:bg-gray-800'
          }`}
        >
          <CalendarCheck className="h-5 w-5 mr-3" />
          Bookings
        </Link>
        
        <Link 
          to="/admin/reviews" 
          className={`flex items-center p-3 rounded-lg ${
            isActive('/admin/reviews') ? 'bg-gray-800' : 'hover:bg-gray-800'
          }`}
        >
          <Star className="h-5 w-5 mr-3" />
          Reviews
        </Link>
      </div>
    </div>
  );
}