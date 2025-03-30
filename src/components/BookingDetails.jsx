import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { useGetBookingByIdQuery, useCancelBookingMutation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  User,
  DollarSign,
  ArrowLeft,
  ClipboardList,
  Home,
  HelpCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Bed,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, error, refetch } = useGetBookingByIdQuery(id);
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  const handleCancelBooking = async () => {
    try {
      toast.loading("Cancelling booking...");
      await cancelBooking(id).unwrap();
      toast.success("Booking cancelled successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      case "checked-in":
        return <Badge className="bg-blue-100 text-blue-700">Checked In</Badge>;
      case "checked-out":
        return <Badge className="bg-purple-100 text-purple-700">Checked Out</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "refunded":
        return <Badge className="bg-blue-100 text-blue-700">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg my-4">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-red-800 mb-1">Error loading booking details</h3>
        <p className="text-red-600 mb-4">
          {error.data?.message || "Something went wrong. Please try again later."}
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={refetch}>Try Again</Button>
          <Button variant="outline" asChild>
            <Link to="/account">Back to Account</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg my-4">
        <HelpCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium mb-2">Booking not found</h3>
        <p className="text-gray-500 mb-4">The booking you're looking for could not be found.</p>
        <Button asChild>
          <Link to="/account">Back to Account</Link>
        </Button>
      </div>
    );
  }

  const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
  const pricePerNight = booking.totalPrice / nights;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
      <Button variant="ghost" asChild className="mt-12 mb-4 -ml-3">
        <Link to="/account">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Link>
      </Button>

        
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              Booking #{id.slice(-6)}
              {getStatusBadge(booking.status)}
            </h1>
            {booking.hotel && (
              <p className="text-muted-foreground mt-1">
                {booking.hotel.name}, {booking.hotel.location}
              </p>
            )}
          </div>
          {booking.status !== "cancelled" &&
            booking.status !== "checked-in" &&
            booking.status !== "checked-out" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Cancel Booking</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this booking? This action cannot be undone.
                      {booking.hotel?.policies?.cancellationPolicy && (
                        <p className="mt-2 text-sm bg-blue-50 text-blue-600 p-2 rounded">
                          <strong>Cancellation Policy:</strong> {booking.hotel.policies.cancellationPolicy}
                        </p>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelBooking}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isCancelling}
                    >
                      {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Booking Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Check-in</h3>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      <p className="font-medium">
                        {format(new Date(booking.checkIn), "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                    {booking.hotel?.policies?.checkInTime && (
                      <p className="text-sm text-muted-foreground ml-6">
                        From {booking.hotel.policies.checkInTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Room</h3>
                    <p className="font-medium flex items-center mt-1">
                      <Bed className="h-4 w-4 mr-2" />
                      {booking.roomType || 'Standard'} Room (#{booking.roomNumber})
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Guests</h3>
                    <p className="font-medium flex items-center mt-1">
                      <User className="h-4 w-4 mr-2" />
                      {booking.guests?.adults || 1} {(booking.guests?.adults || 1) === 1 ? "Adult" : "Adults"}
                      {booking.guests?.children > 0 && `, ${booking.guests.children} ${booking.guests.children === 1 ? "Child" : "Children"}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Check-out</h3>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-red-600" />
                      <p className="font-medium">
                        {format(new Date(booking.checkOut), "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                    {booking.hotel?.policies?.checkOutTime && (
                      <p className="text-sm text-muted-foreground ml-6">
                        Until {booking.hotel.policies.checkOutTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                    <p className="font-medium flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2" />
                      {nights} {nights === 1 ? "Night" : "Nights"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Booking Date</h3>
                    <p className="font-medium flex items-center mt-1">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      {format(new Date(booking.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-4 bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm font-medium">Special Requests</h3>
                  <p className="text-sm mt-1">{booking.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hotel Details Card */}
          {booking.hotel && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Hotel Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  {booking.hotel.image && (
                    <div className="md:w-1/3">
                      <img
                        src={booking.hotel.image}
                        alt={booking.hotel.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="md:w-2/3">
                    <h3 className="font-medium text-lg">{booking.hotel.name}</h3>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {booking.hotel.location}
                    </div>
                    
                    {booking.hotel.policies && (
                      <div className="mt-4 text-sm">
                        <h4 className="font-medium">Hotel Policies</h4>
                        <ul className="mt-1 space-y-1 text-muted-foreground">
                          <li>Check-in: From {booking.hotel.policies.checkInTime || "14:00"}</li>
                          <li>Check-out: Until {booking.hotel.policies.checkOutTime || "11:00"}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to={`/hotels/${booking.hotelId}`}>View Hotel Details</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Payment Details Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payment Details</CardTitle>
              <CardDescription>Booking Reference: #{id.slice(-6)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>{booking.roomType || 'Standard'} Room (per night)</span>
                  <span>${pricePerNight.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Nights</span>
                  <span>x {nights}</span>
                </div>
                {/* Optional taxes and fees would go here */}
                <div className="border-t pt-3 mt-3 flex justify-between items-center font-medium">
                  <span>Total</span>
                  <span className="text-lg">${booking.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm">Payment Status</span>
                  {getPaymentStatusBadge(booking.paymentStatus)}
                </div>
              </div>
            </CardContent>
            {booking.status !== "cancelled" && booking.paymentStatus === "pending" && (
              <CardFooter>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  asChild
                >
                  <Link to={`/booking/payment?bookingId=${booking._id}`}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay Now
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;