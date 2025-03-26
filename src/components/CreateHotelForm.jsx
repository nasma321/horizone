import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateHotelMutation } from "@/lib/api";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  Plus, 
  CheckSquare, 
  Home, 
  Bed, 
  Coffee, 
  Wifi, 
  Tv, 
  Car,
  DumbbellIcon, 
  Utensils
} from "lucide-react";
import { useNavigate } from "react-router";

const formSchema = z.object({
  name: z.string().min(1, { message: "Hotel name is required" }),
  location: z.string().min(1),
  image: z.string().min(1),
  price: z.number().min(1),
  description: z.string().min(1),
  amenities: z.array(z.string()).optional(),
  policies: z.object({
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    cancellationPolicy: z.string().optional()
  }).optional()
});

const defaultAmenities = [
  { id: "wifi", label: "WiFi", icon: <Wifi className="h-4 w-4" /> },
  { id: "parking", label: "Parking", icon: <Car className="h-4 w-4" /> },
  { id: "breakfast", label: "Breakfast", icon: <Coffee className="h-4 w-4" /> },
  { id: "restaurant", label: "Restaurant", icon: <Utensils className="h-4 w-4" /> },
  { id: "tv", label: "Smart TV", icon: <Tv className="h-4 w-4" /> },
  { id: "gym", label: "Gym", icon: <DumbbellIcon className="h-4 w-4" /> },
];

const roomTypes = ["Standard", "Deluxe", "Suite", "Presidential"];

const CreateHotelForm = () => {
  const navigate = useNavigate();
  const [createHotel, { isLoading }] = useCreateHotelMutation();
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      image: "",
      price: 0,
      description: "",
      amenities: [],
      policies: {
        checkInTime: "14:00",
        checkOutTime: "11:00",
        cancellationPolicy: "Free cancellation up to 24 hours before check-in"
      }
    },
  });

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
    
    // Update form value
    form.setValue("amenities", selectedAmenities.includes(amenity) 
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity]
    );
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() === "") return;
    
    const newAmenity = customAmenity.trim();
    setSelectedAmenities([...selectedAmenities, newAmenity]);
    form.setValue("amenities", [...selectedAmenities, newAmenity]);
    setCustomAmenity("");
  };

  const handleSubmit = async (values) => {
    try {
      toast.loading("Creating hotel...");
      
      // Include amenities in the form data
      if (selectedAmenities.length > 0) {
        values.amenities = selectedAmenities;
      }
      
      // Generate rooms based on the hotel price
      const rooms = [];
      for (let i = 101; i <= 110; i++) {
        rooms.push({
          roomNumber: i,
          type: i % 4 === 0 ? 'Deluxe' : i % 4 === 1 ? 'Suite' : 'Standard',
          capacity: i % 3 + 1,
          price: values.price * (i % 4 === 0 ? 1.5 : i % 4 === 1 ? 1.25 : 1),
          amenities: selectedAmenities.slice(0, 3),
          available: true
        });
      }
      
      await createHotel({
        name: values.name,
        location: values.location,
        image: values.image,
        price: values.price,
        description: values.description,
        amenities: values.amenities || [],
        policies: values.policies,
        rooms: rooms
      }).unwrap();
      
      toast.success("Hotel created successfully");
      navigate("/hotels");
    } catch (error) {
      console.error(error);
      toast.error("Hotel creation failed");
    }
  };

  const nextTab = () => {
    if (activeTab === "basic") {
      if (!form.getValues("name") || !form.getValues("location") || !form.getValues("price")) {
        form.trigger(["name", "location", "price"]);
        return;
      }
      setActiveTab("details");
    } else if (activeTab === "details") {
      if (!form.getValues("description")) {
        form.trigger(["description"]);
        return;
      }
      setActiveTab("amenities");
    } else if (activeTab === "amenities") {
      setActiveTab("policies");
    }
  };

  const prevTab = () => {
    if (activeTab === "details") {
      setActiveTab("basic");
    } else if (activeTab === "amenities") {
      setActiveTab("details");
    } else if (activeTab === "policies") {
      setActiveTab("amenities");
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create a New Hotel</CardTitle>
        <CardDescription>
          Add a new hotel to your portfolio. Fill in the details below to create a new listing.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide a URL to a high-quality image of the hotel
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (per night)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter price"
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value));
                            }}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the starting price for standard rooms
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the hotel, its atmosphere, and unique features..." 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-gray-50 p-4 rounded-md mt-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    Room Types
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    By default, the system will generate 10 rooms of different types based on your base price.
                    Standard rooms will be priced at the base price. Deluxe rooms at 1.25x and Suites at 1.5x the base price.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {roomTypes.map((type) => (
                      <div key={type} className="flex items-center bg-white p-2 rounded-md border">
                        <Bed className="h-4 w-4 mr-2 text-sky-600" />
                        <span className="text-sm">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="amenities" className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Select Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {defaultAmenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className={`
                          flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-all
                          ${selectedAmenities.includes(amenity.label) 
                            ? "bg-sky-50 border-sky-200 text-sky-700" 
                            : "hover:bg-gray-50"}
                        `}
                        onClick={() => toggleAmenity(amenity.label)}
                      >
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {amenity.icon}
                        </div>
                        <span>{amenity.label}</span>
                        {selectedAmenities.includes(amenity.label) && (
                          <CheckSquare className="h-4 w-4 ml-auto text-sky-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-3">Custom Amenities</h3>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a custom amenity..."
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomAmenity();
                        }
                      }}
                    />
                    <Button type="button" onClick={addCustomAmenity}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {selectedAmenities.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Selected Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAmenities.map((amenity) => (
                        <Badge key={amenity} className="flex items-center gap-1 bg-sky-100 text-sky-700 hover:bg-sky-200">
                          {amenity}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => toggleAmenity(amenity)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="policies" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="policies.checkInTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Time</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select check-in time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["12:00", "13:00", "14:00", "15:00", "16:00"].map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="policies.checkOutTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out Time</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select check-out time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["10:00", "11:00", "12:00", "13:00"].map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="policies.cancellationPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancellation Policy</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your cancellation policy..."
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Explain your cancellation policy clearly, including any penalties or timeframes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between pt-4 border-t">
              {activeTab !== "basic" && (
                <Button type="button" variant="outline" onClick={prevTab}>
                  Previous
                </Button>
              )}
              
              {activeTab !== "policies" ? (
                <Button type="button" className="ml-auto" onClick={nextTab}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" className="ml-auto" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Hotel"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateHotelForm;