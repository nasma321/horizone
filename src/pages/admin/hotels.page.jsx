import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import HotelsList from "@/components/admin/HotelsList";
import HotelForm from "@/components/admin/HotelForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminHotels() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  
  const handleEditHotel = (hotel) => {
    setEditingHotel(hotel);
    setIsCreating(true);
  };
  
  const handleCreateNew = () => {
    setEditingHotel(null);
    setIsCreating(true);
  };
  
  const handleFormClose = () => {
    setIsCreating(false);
    setEditingHotel(null);
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Hotels</h1>
          
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" /> Add New Hotel
          </Button>
        </div>
        
        {isCreating ? (
          <HotelForm hotel={editingHotel} onClose={handleFormClose} />
        ) : (
          <HotelsList onEdit={handleEditHotel} />
        )}
      </div>
    </div>
  );
}