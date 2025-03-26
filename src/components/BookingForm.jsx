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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
import { Calendar, Clock, Users, CreditCard, Home, Star, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

const formSchema = z.object({
  checkIn: z.string().min(1, { message: "Check-in date is required" }),
  checkOut: z.string().min(1, { message: "Check-out date is required" }),
  roomNumber: z.number().positive({ message: "Please select a room" }),
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

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRoomNumber = queryParams.get('room') ? parseInt(queryParams.get('room')) : null;
  
  const { data: hotel, isLoading: isLoadingHotel } = useGetHotelByIdQuery(id);
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [nights, setNights] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkIn: format(new Date(), "yyyy-MM-dd"),
      checkOut: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      roomNumber: initialRoomNumber || 0,
      guests: {
        adults: 1,
        children: 0
      },
      specialRequests: ""
    }
  });

  useEffect(() => {
    if (hotel?.rooms && hotel.rooms.length > 0) {
      const available = hotel.rooms.filter(room => room.available);
      setAvailableRooms(available);
      
      if (initialRoomNumber) {
        const room = available.find(r => r.roomNumber === initialRoomNumber);
        if (room) {
          setSelectedRoom(room);
          form.setValue("roomNumber", initialRoomNumber);
        }
      } 
      else if (available.length > 0 && !selectedRoom) {
        setSelectedRoom(available[0]);
        form.setValue("roomNumber", available[0].roomNumber);
      }
    } else if (hotel) {
      const defaultRooms = [];
      for (let i = 101; i <= 110; i++) {
        defaultRooms.push({
          roomNumber: i,
          type: i % 4 === 0 ? 'Deluxe' : i % 4 === 1 ? 'Suite' : 'Standard',
          capacity: i % 3 + 1,
          price: hotel.price,
          available: true
        });
      }
      setAvailableRooms(defaultRooms);
      
      if (defaultRooms.length > 0) {
        setSelectedRoom(defaultRooms[0]);
        form.setValue("roomNumber", defaultRooms[0].roomNumber);
      }
    }
  }, [hotel, initialRoomNumber, form]);

  useEffect(() => {
    const values = form.getValues();
    const checkIn = parseISO(values.checkIn);
    const checkOut = parseISO(values.checkOut);
    
    if (isAfter(checkOut, checkIn)) {
      const nights = differenceInDays(checkOut, checkIn);
      setNights(nights);
      
      if (selectedRoom) {
        setTotalPrice(selectedRoom.price * nights);
      } else if (hotel) {
        setTotalPrice(hotel.price * nights);
      }
    }
  }, [form.watch("checkIn"), form.watch("checkOut"), selectedRoom, hotel]);

  const handleRoomSelect = (roomNumber) => {
    const room = availableRooms.find(r => r.roomNumber === parseInt(roomNumber));
    setSelectedRoom(room);
    form.setValue("roomNumber", parseInt(roomNumber));
  };

  const handleSubmit = async (values) => {
    if (!selectedRoom) {
      toast.error("Please select a room");
      return;
    }
    
    try {
      toast.loading("Processing booking...");
      
      const result = await createBooking({
        hotelId: id,
        roomNumber: values.roomNumber,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        guests: values.guests,
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
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Room</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value ? field.value.toString() : ""} 
                      onValueChange={handleRoomSelect}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRooms.length > 0 ? (
                          availableRooms.map((room) => (
                            <SelectItem key={room.roomNumber} value={room.roomNumber.toString()}>
                              Room #{room.roomNumber} - {room.type || 'Standard'} (${room.price}/night)
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No rooms available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Choose from available rooms
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guests.adults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select 
                          value={field.value.toString()} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Adults" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Adult' : 'Adults'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guests.children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select 
                          value={field.value.toString()} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Children" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Child' : 'Children'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            <Button type="submit" className="w-full" disabled={isLoading || availableRooms.length === 0}>
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
              <span className="text-muted-foreground">Room</span>
              <span className="font-medium">
                {selectedRoom ? `#${selectedRoom.roomNumber} - ${selectedRoom.type || 'Standard'}` : 'Not selected'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guests</span>
              <span className="font-medium">
                {form.watch("guests.adults")} {form.watch("guests.adults") === 1 ? 'Adult' : 'Adults'}
                {form.watch("guests.children") > 0 && `, ${form.watch("guests.children")} ${form.watch("guests.children") === 1 ? 'Child' : 'Children'}`}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-sm">
                <span>Room Rate</span>
                <span>${selectedRoom ? selectedRoom.price : hotel.price} per night</span>
              </div>
              
              <div className="flex justify-between text-sm mt-2">
                <span>Total for {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span className="font-bold">${totalPrice}</span>
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