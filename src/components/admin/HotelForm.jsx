import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Wifi, Tv, Coffee, MenuIcon } from "lucide-react";

// Form schema for hotel validation
const formSchema = z.object({
  name: z.string().min(3, { message: "Hotel name must be at least 3 characters" }),
  location: z.string().min(3, { message: "Location is required" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  image: z.string().url({ message: "Valid image URL is required" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviews: z.coerce.number().min(0).optional(),
  amenities: z.object({
    wifi: z.boolean().default(false),
    tv: z.boolean().default(false),
    coffeeMaker: z.boolean().default(false),
    restaurant: z.boolean().default(false),
  }),
});

export default function HotelForm({ hotel, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up form with default values
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: hotel?.name || "",
      location: hotel?.location || "",
      description: hotel?.description || "",
      image: hotel?.image || "",
      price: hotel?.price || "",
      rating: hotel?.rating || 0,
      reviews: hotel?.reviews || 0,
      amenities: {
        wifi: hotel?.amenities?.includes("wifi") || false,
        tv: hotel?.amenities?.includes("tv") || false,
        coffeeMaker: hotel?.amenities?.includes("coffeeMaker") || false,
        restaurant: hotel?.amenities?.includes("restaurant") || false,
      },
    },
  });
  
  const onSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Convert amenities object to array of strings
      const amenitiesArray = Object.entries(values.amenities)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      
      const payload = {
        ...values,
        amenities: amenitiesArray,
      };
      
      const url = hotel?._id 
        ? `http://localhost:8001/api/hotels/${hotel._id}`
        : "http://localhost:8001/api/hotels";
      
      const method = hotel?._id ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${await window?.Clerk?.session?.getToken()}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save hotel");
      }
      
      toast.success(hotel?._id ? "Hotel updated successfully" : "Hotel created successfully");
      onClose();
    } catch (error) {
      console.error("Error saving hotel:", error);
      toast.error("Failed to save hotel");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {hotel?._id ? "Edit Hotel" : "Add New Hotel"}
          </h2>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter hotel name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Night ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (0-5)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="5" 
                        step="0.1" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reviews"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Reviews</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the hotel" 
                      {...field} 
                      className="min-h-[120px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <h3 className="text-md font-medium mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amenities.wifi"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="flex items-center">
                        <Wifi className="h-4 w-4 mr-2" />
                        <FormLabel className="cursor-pointer">Free Wi-Fi</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amenities.tv"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="flex items-center">
                        <Tv className="h-4 w-4 mr-2" />
                        <FormLabel className="cursor-pointer">Flat-screen TV</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amenities.coffeeMaker"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 mr-2" />
                        <FormLabel className="cursor-pointer">Coffee maker</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amenities.restaurant"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="flex items-center">
                        <MenuIcon className="h-4 w-4 mr-2" />
                        <FormLabel className="cursor-pointer">Restaurant</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Hotel"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}