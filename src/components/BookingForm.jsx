import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { format, addDays, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Calendar as CalendarIcon, User, Hotel, MapPin, Loader2 } from "lucide-react";

import { useGetHotelByIdQuery, useCreateBookingMutation } from "@/lib/api";

const formSchema = z.object({
  checkIn: z.date({
    required_error: "Check-in date is required",
  }),
  checkOut: z.date({
    required_error: "Check-out date is required",
  }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  specialRequests: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
}).refine(data => {
  return data.checkOut > data.checkIn;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"]
});

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: hotel, isLoading: isHotelLoading } = useGetHotelByIdQuery(id);
  const [createBooking, { isLoading: isBookingLoading }] = useCreateBookingMutation();
  
  const [roomNumber, setRoomNumber] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [numNights, setNumNights] = useState(1);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkIn: new Date(),
      checkOut: addDays(new Date(), 1),
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      phone: "",
      specialRequests: "",
      agreeToTerms: false
    }
  });

  const checkIn = form.watch("checkIn");
  const checkOut = form.watch("checkOut");

  useEffect(() => {
    const randomRoom = Math.floor(Math.random() * 900) + 100; // Random number between 100-999
    setRoomNumber(randomRoom);
  }, []);

  useEffect(() => {
    if (checkIn && checkOut && hotel) {
      const nights = Math.max(1, differenceInDays(checkOut, checkIn));
      setNumNights(nights);
      setTotalPrice(nights * hotel.price);
    }
  }, [checkIn, checkOut, hotel]);

  const onSubmit = async (values) => {
    try {
      toast.loading("Processing booking...");
      
      const bookingData = {
        hotelId: id,
        checkIn: format(values.checkIn, 'yyyy-MM-dd'),
        checkOut: format(values.checkOut, 'yyyy-MM-dd'),
        roomNumber: roomNumber,
        totalPrice: totalPrice,
        guestInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          specialRequests: values.specialRequests || ""
        }
      };
      
      await createBooking(bookingData).unwrap();
      toast.dismiss();
      toast.success("Booking confirmed!");
      navigate('/account/bookings');
    } catch (error) {
      toast.dismiss();
      toast.error("Booking failed. Please try again.");
      console.error(error);
    }
  };

  if (isHotelLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Loading hotel information...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <p className="mt-2">Hotel information not available</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Book Your Stay</h2>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src={hotel.image} 
                alt={hotel.name} 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{hotel.name}</h3>
              <p className="text-muted-foreground">{hotel.location}</p>
              <div className="flex items-center mt-2 text-sm">
                <Hotel className="h-4 w-4 mr-1" />
                <span>Room {roomNumber}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" /> Stay Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-in Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-out Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => 
                              date < new Date() || 
                              (checkIn && date <= checkIn)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <h3 className="text-xl font-semibold flex items-center mt-6">
                <User className="h-5 w-5 mr-2" /> Guest Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        {...field} 
                        placeholder="Any special requests or notes for your stay"
                        className="h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Room Rate</span>
                    <span>${hotel.price}/night</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Number of Nights</span>
                    <span>{numNights}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Cancellation Policy: Free cancellation up to 48 hours before check-in.</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full space-y-4">
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                              id="agreeToTerms"
                            />
                          </FormControl>
                          <div>
                            <FormLabel 
                              htmlFor="agreeToTerms" 
                              className="text-sm font-medium cursor-pointer"
                            >
                              I agree to the terms and conditions
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isBookingLoading}
                    >
                      {isBookingLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BookingForm;