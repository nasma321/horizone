import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateBookingMutation, useGetHotelByIdQuery } from "@/lib/api";
import { toast } from "sonner";
import { useParams } from "react-router";
import { useEffect, useState } from "react";

const formSchema = z.object({
  checkIn: z.string().min(1, { message: "Check-in date is required" }),
  checkOut: z.string().min(1, { message: "Check-out date is required" }),
});

const BookingForm = () => {
  const { id } = useParams();
  const { data: hotel } = useGetHotelByIdQuery(id);
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  
  const [roomNumber, setRoomNumber] = useState(0);
  
  useEffect(() => {
    const randomRoom = Math.floor(Math.random() * 900) + 100; // Random number between 100-999
    setRoomNumber(randomRoom);
  }, []);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkIn: "",
      checkOut: "",
    }
  });

  const handleSubmit = async (values) => {
    try {
      toast.loading("Processing booking...");
      await createBooking({
        hotelId: id,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        roomNumber: roomNumber,
      }).unwrap();
      toast.success("Booking successful!");
    } catch (error) {
      toast.error("Booking failed");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6">Book Your Stay</h2>
      {hotel && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold">{hotel.name}</h3>
          <p className="text-muted-foreground">{hotel.location}</p>
          <p className="font-medium mt-2">${hotel.price} per night</p>
          <p className="text-sm text-muted-foreground mt-1">Room {roomNumber}</p>
        </div>
      )}
      
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="checkIn" className="block text-sm font-medium mb-1">Check-in Date</label>
            <Input id="checkIn" {...form.register("checkIn")} type="date" />
            {form.formState.errors.checkIn && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.checkIn.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="checkOut" className="block text-sm font-medium mb-1">Check-out Date</label>
            <Input id="checkOut" {...form.register("checkOut")} type="date" />
            {form.formState.errors.checkOut && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.checkOut.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Confirm Booking"}
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;