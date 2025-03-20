import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  rating: z.number().min(1, { message: "Please select a rating" }).max(5),
  comment: z.string().min(3, { message: "Review must be at least 3 characters" }),
});

export default function ReviewForm({ hotelId, onCancel, onSubmit, review = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: review?.rating || 0,
      comment: review?.comment || "",
    },
  });
  
  const submitReview = async (values) => {
    setIsSubmitting(true);
    
    try {
      const url = review?._id 
        ? `http://localhost:8001/api/reviews/${review._id}`
        : "http://localhost:8001/api/reviews";
      
      const method = review?._id ? "PUT" : "POST";
      
      const body = review?._id
        ? { rating: values.rating, comment: values.comment }
        : { hotelId, rating: values.rating, comment: values.comment };
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await window?.Clerk?.session?.getToken()}`,
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit review");
      }
      
      toast.success(review?._id ? "Review updated" : "Review submitted");
      onSubmit();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">
          {review ? "Edit Your Review" : "Write a Review"}
        </h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitReview)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                          (hoverRating || field.value) >= star
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                        onClick={() => field.onChange(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience at this hotel..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : review ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}