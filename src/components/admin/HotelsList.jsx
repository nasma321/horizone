import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Edit, 
  Trash2, 
  Search, 
  Star,
  ArrowUpDown
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function HotelsList({ onEdit }) {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  useEffect(() => {
    fetchHotels();
  }, []);
  
  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8001/api/hotels");
      const data = await response.json();
      setHotels(data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteHotel = async (hotelId) => {
    try {
      await fetch(`http://localhost:8001/api/hotels/${hotelId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${await window?.Clerk?.session?.getToken()}`
        }
      });
      setHotels(hotels.filter(hotel => hotel._id !== hotelId));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting hotel:", error);
    }
  };
  
  const sortedHotels = [...hotels]
    .filter(hotel => 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  if (isLoading) {
    return <div>Loading hotels...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search hotels by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
              <div className="flex items-center">
                Name 
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => requestSort('location')} className="cursor-pointer">
              <div className="flex items-center">
                Location
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => requestSort('price')} className="cursor-pointer">
              <div className="flex items-center">
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => requestSort('rating')} className="cursor-pointer">
              <div className="flex items-center">
                Rating
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHotels.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No hotels found
              </TableCell>
            </TableRow>
          ) : (
            sortedHotels.map((hotel) => (
              <TableRow key={hotel._id}>
                <TableCell>
                  <img 
                    src={hotel.image} 
                    alt={hotel.name} 
                    className="w-20 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">{hotel.name}</TableCell>
                <TableCell>{hotel.location}</TableCell>
                <TableCell>${hotel.price}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                    {hotel.rating || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => onEdit(hotel)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Dialog open={confirmDelete === hotel._id} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setConfirmDelete(hotel._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete {hotel.name}? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDeleteHotel(hotel._id)}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}