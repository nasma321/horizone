import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { Star, Search, Trash2, ArrowUpDown } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8001/api/admin/reviews", {
        headers: {
          Authorization: `Bearer ${await window?.Clerk?.session?.getToken()}`,
        },
      });
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:8001/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await window?.Clerk?.session?.getToken()}`,
        },
      });
      
      if (response.ok) {
        toast.success("Review deleted successfully");
        setReviews(reviews.filter(review => review._id !== reviewId));
      } else {
        toast.error("Failed to delete review");
      }
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };
  
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const filteredReviews = reviews
    .filter(review => 
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Manage Reviews</h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {isLoading ? (
          <div>Loading reviews...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('hotel.name')} className="cursor-pointer">
                  <div className="flex items-center">
                    Hotel
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => requestSort('user.firstName')} className="cursor-pointer">
                  <div className="flex items-center">
                    User
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => requestSort('rating')} className="cursor-pointer">
                  <div className="flex items-center">
                    Rating
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Comment</TableHead>
                <TableHead onClick={() => requestSort('createdAt')} className="cursor-pointer">
                  <div className="flex items-center">
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="font-medium">
                      {review.hotel?.name || "Unknown Hotel"}
                    </TableCell>
                    <TableCell>
                      {review.user?.firstName} {review.user?.lastName || ""}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {review.rating}
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-1" />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.comment}
                    </TableCell>
                    <TableCell>
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Dialog open={confirmDelete === review._id} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setConfirmDelete(review._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this review? This action cannot be undone.
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
                              onClick={() => handleDeleteReview(review._id)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}