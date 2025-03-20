import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { format } from "date-fns";
import { Star, User, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReviewForm from "./ReviewForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ReviewList({ hotelId }) {
  const { user, isSignedIn } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [hotelId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8001/api/reviews/hotel/${hotelId}`);
      const data = await response.json();
      setReviews(data);
      
      if (isSignedIn) {
        const hasReviewed = data.some(review => review.user?.id === user.id);
        setUserHasReviewed(hasReviewed);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = () => {
    setEditingReview(null);
    setShowReviewForm(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    try {
      const response = await fetch(`http://localhost:8001/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await window?.Clerk?.session?.getToken()}`,
        },
      });
      
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleReviewSubmit = () => {
    setShowReviewForm(false);
    fetchReviews();
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Guest Reviews</h2>
        
        {isSignedIn && !userHasReviewed && !showReviewForm && (
          <Button onClick={handleAddReview}>Write a Review</Button>
        )}
      </div>
      
      {showReviewForm && (
        <ReviewForm 
          hotelId={hotelId} 
          onCancel={() => setShowReviewForm(false)} 
          onSubmit={handleReviewSubmit}
          review={editingReview}
        />
      )}
      
      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">No reviews yet. Be the first to review this hotel!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="pt-6">
                <div className="flex justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {review.user?.imageUrl ? (
                        <img 
                          src={review.user.imageUrl} 
                          alt={review.user.firstName} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {review.user?.firstName} {review.user?.lastName || ""}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(review.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  
                  {isSignedIn && user?.id === review.user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditReview(review)}>
                          Edit Review
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-500"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          Delete Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating 
                          ? "text-yellow-500 fill-yellow-500" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                
                <div className="mt-3">
                  <p>{review.comment}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}