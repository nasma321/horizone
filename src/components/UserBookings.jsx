import { useState } from "react";
import { useGetUserBookingsQuery, useCancelBookingMutation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Info, AlertCircle, Bed } from "lucide-react";
import { formatDistance, format } from "date-fns";
import { useNavigate } from "react-router";
import { Link } from "react-router";
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

const UserBookings = () => {
  const navigate = useNavigate();
  const { data: bookings, isLoading, error, refetch } = useGetUserBookingsQuery();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      toast.loading("Cancelling booking...");
      await cancelBooking(selectedBooking._id).unwrap();
      toast.success("Booking cancelled successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
    } finally {
      setSelectedBooking(null);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg my-4">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-red-800 mb-1">Error loading bookings</h3>
        <p className="text-red-600 mb-4">
          {error.data?.message || "Something went wrong. Please try again later."}
        </p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  if (!bookings?.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg my-4">
        <Info className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium mb-2">No bookings found</h3>
        <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
        <Button asChild>
          <Link to="/hotels">Browse Hotels</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <Card
            key={booking._id}
            className={`overflow-hidden transition-all hover:shadow-md ${
              booking.status === "cancelled" ? "opacity-75" : ""
            }`}
          >
            {booking.hotel?.image && (
              <div className="relative h-40 overflow-hidden">
                <img
                  src={booking.hotel.image}
                  alt={booking.hotel.name}
                  className="w-full h-full object-cover"
                />
                {booking.status === "cancelled" && (
                  <div className="absolute inset-0 bg-white/80 flex justify-center items-center">
                    <span className="text-red-500 font-bold text-lg">CANCELLED</span>
                  </div>
                )}
              </div>
            )}

            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">{booking.hotel?.name || "Unknown Hotel"}</CardTitle>
              {booking.hotel?.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {booking.hotel.location}
                </div>
              )}
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Check-in</p>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-green-600" />
                    <span className="text-sm font-medium">
                      {format(new Date(booking.checkIn), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-out</p>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-red-600" />
                    <span className="text-sm font-medium">
                      {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Room</p>
                  <div className="flex items-center">
                    <Bed className="h-3.5 w-3.5 mr-1" />
                    <span className="text-sm font-medium">
                      {booking.roomType || 'Standard'} #{booking.roomNumber}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-sm font-medium">${booking.totalPrice}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <div className="flex items-center">
                  <p className="text-xs text-muted-foreground mr-2">Status:</p>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="flex items-center">
                  <p className="text-xs text-muted-foreground mr-2">Payment:</p>
                  {getPaymentStatusBadge(booking.paymentStatus)}
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-3">
                Booked {formatDistance(new Date(booking.createdAt), new Date(), { addSuffix: true })}
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/bookings/${booking._id}`)}
              >
                View Details
              </Button>

              {booking.status !== "cancelled" &&
                booking.status !== "checked-in" &&
                booking.status !== "checked-out" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this booking? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelBooking}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Cancel Booking
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserBookings;