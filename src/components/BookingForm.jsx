import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBookingMutation, useGetHotelByIdQuery } from "@/lib/api";
import { toast } from "sonner";
import { useParams, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format, addDays, isAfter, parseISO, differenceInDays } from "date-fns";
import { Calendar, Clock, Users, CreditCard, Home, Star, Info, Plus, Minus } from "lucide-react";

const formSchema = z.object({
  checkIn: z.string().min(1, { message: "Check-in date is required" }),
  checkOut: z.string().min(1, { message: "Check-out date is required" }),
  roomType: z.string().min(1, { message: "Please select a room type" }),
  guests: z.object({
    adults: z.number().min(1, { message: "At least 1 adult is required" }).max(6),
    children: z.number().min(0).max(4)
  }),
  specialRequests: z.string().optional()
}).refine(data => {
  const checkIn = parseISO(data.checkIn);
  const checkOut = parseISO(data.checkOut);
  return isAfter(checkOut, checkIn);
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"]
});

const ROOM_TYPES = [
  { type: 'Standard', multiplier: 1 },
  { type: 'Deluxe', multiplier: 1.25 },
  { type: 'Suite', multiplier: 1.5 },
  { type: 'Presidential', multiplier: 2 }
];

// Function to find an available room by type
const findAvailableRoomByType = (hotel, roomType) => {
  if (!hotel || !hotel.rooms) return null;
  
  // Find the first available room of the requested type
  return hotel.rooms.find(room => 
    room.type === roomType && room.available === true
  );
};

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRoomType = queryParams.get('roomType') || 'Standard';
  
  const { data: hotel, isLoading: isLoadingHotel } = useGetHotelByIdQuery(id);
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  
  const [selectedRoomType, setSelectedRoomType] = useState(initialRoomType);
  const [nights, setNights] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [availableRooms, setAvailableRooms] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkIn: format(new Date(), "yyyy-MM-dd"),
      checkOut: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      roomType: initialRoomType,
      guests: {
        adults: 1,
        children: 0
      },
      specialRequests: ""
    }
  });

  // Update form values when adults/children change
  useEffect(() => {
    form.setValue("guests.adults", adults);
    form.setValue("guests.children", children);
  }, [adults, children, form]);

  // Set available rooms based on hotel data and auto-select a room if roomType is provided
  useEffect(() => {
    if (hotel?.rooms && hotel.rooms.length > 0) {
      // Group rooms by type and get available rooms
      const roomsByType = {};
      
      hotel.rooms.forEach(room => {
        if (room.available) {
          if (!roomsByType[room.type]) {
            roomsByType[room.type] = [];
          }
          roomsByType[room.type].push(room);
        }
      });
      
      setAvailableRooms(roomsByType);
      
      // Set selected room type if available
      if (initialRoomType && roomsByType[initialRoomType]?.length > 0) {
        setSelectedRoomType(initialRoomType);
        form.setValue("roomType", initialRoomType);
        
        // Auto-select a room of the specified type
        const availableRoom = roomsByType[initialRoomType][0];
        setSelectedRoom(availableRoom);
      } else {
        // Find first available room type
        const firstAvailableType = Object.keys(roomsByType)[0] || 'Standard';
        setSelectedRoomType(firstAvailableType);
        form.setValue("roomType", firstAvailableType);
        
        // Auto-select a room of the first available type
        if (roomsByType[firstAvailableType]?.length > 0) {
          setSelectedRoom(roomsByType[firstAvailableType][0]);
        }
      }
    } else if (hotel) {
      // Create default room types if no rooms exist
      const roomsByType = {};
      
      ROOM_TYPES.forEach(({ type, multiplier }) => {
        roomsByType[type] = [{
          type,
          roomNumber: `${type.charAt(0)}${Math.floor(Math.random() * 100) + 100}`,
          price: hotel.price * multiplier,
          available: true
        }];
      });
      
      setAvailableRooms(roomsByType);
      setSelectedRoomType(initialRoomType);
      form.setValue("roomType", initialRoomType);
      
      // Auto-select a room of the specified type
      if (roomsByType[initialRoomType]?.length > 0) {
        setSelectedRoom(roomsByType[initialRoomType][0]);
      }
    }
  }, [hotel, initialRoomType, form]);

  // Calculate price when relevant values change
  useEffect(() => {
    const values = form.getValues();
    const checkIn = parseISO(values.checkIn);
    const checkOut = parseISO(values.checkOut);
    
    if (isAfter(checkOut, checkIn)) {
      const nights = differenceInDays(checkOut, checkIn);
      setNights(nights);
      
      const roomType = selectedRoomType;
      
      if (hotel) {
        // Get price from the selected room if available, otherwise calculate from base price
        let roomPrice;
        
        if (selectedRoom && selectedRoom.price) {
          roomPrice = selectedRoom.price;
        } else {
          const multiplier = ROOM_TYPES.find(rt => rt.type === roomType)?.multiplier || 1;
          roomPrice = hotel.price * multiplier;
        }
        
        setTotalPrice(roomPrice * nights);
      }
    }
  }, [form.watch("checkIn"), form.watch("checkOut"), selectedRoomType, selectedRoom, hotel]);

  const handleRoomTypeSelect = (roomType) => {
    setSelectedRoomType(roomType);
    form.setValue("roomType", roomType);
    
    // Auto-select a room of the selected type
    const roomsOfType = availableRooms[roomType] || [];
    if (roomsOfType.length > 0) {
      setSelectedRoom(roomsOfType[0]);
    } else {
      setSelectedRoom(null);
    }
  };

  const handleAdultsChange = (increment) => {
    setAdults(prev => {
      const newValue = prev + increment;
      return newValue >= 1 && newValue <= 6 ? newValue : prev;
    });
  };

  const handleChildrenChange = (increment) => {
    setChildren(prev => {
      const newValue = prev + increment;
      return newValue >= 0 && newValue <= 4 ? newValue : prev;
    });
  };

  const handleSubmit = async (values) => {
    try {
      toast.loading("Processing booking...");
      
      // Find available room of selected type if not already selected
      if (!selectedRoom) {
        const roomsOfType = availableRooms[selectedRoomType] || [];
        if (roomsOfType.length === 0) {
          toast.error("No rooms available of selected type");
          return;
        }
        setSelectedRoom(roomsOfType[0]);
      }
      
      const result = await createBooking({
        hotelId: id,
        roomId: selectedRoom.id || selectedRoom._id,
        roomNumber: selectedRoom.roomNumber || Math.floor(Math.random() * 100) + 101,
        roomType: selectedRoomType,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        guests: values.guests,
        price: totalPrice,
        specialRequests: values.specialRequests
      }).unwrap();
      
      toast.success("Booking successful!");
      navigate(`/bookings/${result.bookingId}`);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.data?.message || "Booking failed. Please try again.");
    }
  };

  if (isLoadingHotel) {
    return (
      <div className="max-w-md mx-auto p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center bg-red-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700">Hotel not found</h2>
          <p className="mt-2 text-red-600">Sorry, we couldn't find the hotel you're looking for.</p>
          <Button className="mt-4" onClick={() => navigate("/hotels")}>
            Browse Other Hotels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold">{hotel.name}</h3>
          <p className="text-muted-foreground flex items-center">
            <Home className="h-4 w-4 mr-1" /> {hotel.location}
          </p>
          <div className="flex items-center mt-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="font-medium">{hotel.rating || "4.8"}</span>
            <span className="text-muted-foreground ml-1">
              ({hotel.reviews || "124"} reviews)
            </span>
          </div>
        </div>
        
        {/* Display selected room information if available */}
        {selectedRoom && (
          <div className="mb-6 p-4 bg-sky-50 border border-sky-100 rounded-lg">
            <h4 className="font-medium flex items-center">
              <Star className="h-4 w-4 text-sky-600 mr-2" />
              Selected Room
            </h4>
            <div className="mt-2">
              <p><strong>Type:</strong> {selectedRoom.type} Room</p>
              {selectedRoom.roomNumber && <p><strong>Room #:</strong> {selectedRoom.roomNumber}</p>}
              <p><strong>Price:</strong> ${selectedRoom.price || (hotel.price * (ROOM_TYPES.find(rt => rt.type === selectedRoom.type)?.multiplier || 1))}/night</p>
            </div>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" type="date" min={format(new Date(), "yyyy-MM-dd")} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="checkOut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          className="pl-10" 
                          type="date" 
                          min={format(addDays(parseISO(form.watch("checkIn") || new Date()), 1), "yyyy-MM-dd")}
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="roomType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {ROOM_TYPES.map(({ type, multiplier }) => {
                      const isAvailable = availableRooms[type]?.length > 0 || !Object.keys(availableRooms).length;
                      const isSelected = selectedRoomType === type;
                      const price = hotel.price * multiplier;
                      
                      return (
                        <div 
                          key={type}
                          className={`border rounded-md p-3 cursor-pointer transition-all ${
                            isSelected ? 'bg-sky-50 border-sky-300' : 'hover:bg-gray-50'
                          } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => isAvailable && handleRoomTypeSelect(type)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{type}</h4>
                              <p className="text-sm text-muted-foreground">${price}/night</p>
                            </div>
                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-3 w-3 text-white">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Guests</FormLabel>
              
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Adults</span>
                    <p className="text-sm text-muted-foreground">Age 18+</p>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleAdultsChange(-1)}
                      disabled={adults <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{adults}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleAdultsChange(1)}
                      disabled={adults >= 6}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Children</span>
                    <p className="text-sm text-muted-foreground">Age 0-17</p>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleChildrenChange(-1)}
                      disabled={children <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{children}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleChildrenChange(1)}
                      disabled={children >= 4}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requests or requirements..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Let us know if you have any special requirements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !selectedRoom || Object.keys(availableRooms).length === 0}
            >
              {isLoading ? "Processing..." : "Confirm Booking"}
            </Button>
          </form>
        </Form>
      </div>

      <div>
        <Card className="border bg-card p-6 sticky top-24">
          <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in</span>
              <span className="font-medium">{format(parseISO(form.watch("checkIn") || new Date()), "MMM dd, yyyy")}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-out</span>
              <span className="font-medium">{format(parseISO(form.watch("checkOut") || addDays(new Date(), 1)), "MMM dd, yyyy")}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room Type</span>
              <span className="font-medium">{selectedRoomType}</span>
            </div>
            
            {selectedRoom && selectedRoom.roomNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Number</span>
                <span className="font-medium">{selectedRoom.roomNumber}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guests</span>
              <span className="font-medium">
                {adults} {adults === 1 ? 'Adult' : 'Adults'}
                {children > 0 && `, ${children} ${children === 1 ? 'Child' : 'Children'}`}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-sm">
                <span>Room Rate</span>
                <span>${(totalPrice / nights).toFixed(2)} per night</span>
              </div>
              
              <div className="flex justify-between text-sm mt-2">
                <span>Total for {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span className="font-bold">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {hotel?.policies?.cancellationPolicy && (
            <div className="mt-6 bg-blue-50 p-3 rounded-md text-sm flex">
              <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-700">Cancellation Policy:</p>
                <p className="text-blue-600 mt-1">{hotel.policies.cancellationPolicy}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookingForm;