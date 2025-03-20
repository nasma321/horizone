import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { format, isBefore, isAfter } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  Hotel, 
  CreditCard, 
  XCircle, 
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

// Import the hooks from your API file
import { useGetUserBookingsQuery, useCancelBookingMutation } from "@/lib/api";

const UserBookings = () => {
  const { user, isLoaded } = useUser();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Use RTK Query hooks instead of direct fetch
  const { 
    data: bookings = [], 
    isLoading,
    refetch
  } = useGetUserBookingsQuery(user?.id, {
    skip: !isLoaded || !user
  });
  
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId).unwrap();
      toast.success("Booking cancelled successfully");
      // Refetch the bookings after cancellation
      refetch();
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
    }
  };

  const getBookingStatus = (booking) => {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    if (booking.status === "cancelled") {
      return {
        label: "Cancelled",
        color: "destructive",
        icon: <XCircle className="h-4 w-4" />
      };
    } else if (isAfter(now, checkOut)) {
      return {
        label: "Completed",
        color: "default",
        icon: <CheckCircle2 className="h-4 w-4" />
      };
    } else if (isAfter(now, checkIn) && isBefore(now, checkOut)) {
      return {
        label: "Active",
        color: "success",
        icon: <Hotel className="h-4 w-4" />
      };
    } else {
      return {
        label: "Upcoming",
        color: "secondary",
        icon: <Clock className="h-4 w-4" />
      };
    }
  };

  const filterBookings = (type) => {
    return bookings.filter(booking => {
      const status = getBookingStatus(booking);
      if (type === "upcoming") return status.label === "Upcoming";
      if (type === "active") return status.label === "Active";
      if (type === "past") return status.label === "Completed" || status.label === "Cancelled";
      return true;
    });
  };

  const getBookingDates = (booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return `${format(checkIn, 'MMM dd, yyyy')} - ${format(checkOut, 'MMM dd, yyyy')}`;
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      <Tabs defaultValue="upcoming" className="w-full mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>
        
        {["upcoming", "active", "past", "all"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-0">
            {filterBookings(tabValue).length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <div className="mx-auto mb-4 bg-muted w-16 h-16 rounded-full flex items-center justify-center">
                  {tabValue === "upcoming" && <Clock className="h-8 w-8 text-muted-foreground" />}
                  {tabValue === "active" && <Hotel className="h-8 w-8 text-muted-foreground" />}
                  {tabValue === "past" && <CheckCircle2 className="h-8 w-8 text-muted-foreground" />}
                  {tabValue === "all" && <Calendar className="h-8 w-8 text-muted-foreground" />}
                </div>
                <h2 className="text-xl font-semibold mb-2">No {tabValue} bookings</h2>
                <p className="text-muted-foreground mb-6">
                  {tabValue === "upcoming" && "You don't have any upcoming stays."}
                  {tabValue === "active" && "You don't have any active stays."}
                  {tabValue === "past" && "You don't have any past bookings."}
                  {tabValue === "all" && "You haven't made any bookings yet."}
                </p>
                <Button onClick={() => window.location.href = "/"}>
                  Explore Hotels
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filterBookings(tabValue).map((booking) => {
                  const status = getBookingStatus(booking);
                  return (
                    <Card key={booking._id} className="overflow-hidden">
                      {booking.hotel?.image && (
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={booking.hotel.image} 
                            alt={booking.hotel.name} 
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                          />
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">
                            {booking.hotel?.name || "Hotel"}
                          </CardTitle>
                          <Badge variant={status.color === "success" ? "success" : status.color === "destructive" ? "destructive" : "secondary"} className="flex items-center gap-1">
                            {status.icon}
                            <span>{status.label}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-2 text-sm text-muted-foreground pb-2">
                        {booking.hotel?.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{booking.hotel.location}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{getBookingDates(booking)}</span>
                        </div>
                        <div className="flex items-center">
                          <Hotel className="h-4 w-4 mr-2" />
                          <span>Room {booking.roomNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          <span>${booking.totalPrice || (booking.hotel?.price || 0)}</span>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          View Details
                        </Button>
                        
                        {status.label === "Upcoming" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel Booking</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to cancel this booking? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p className="text-sm text-muted-foreground mb-2">Booking details:</p>
                                <p className="font-medium">{booking.hotel?.name}</p>
                                <p className="text-sm">{getBookingDates(booking)}</p>
                                
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-amber-800">Cancellation Policy</p>
                                    <p className="text-sm text-amber-700">Free cancellation up to 48 hours before check-in. Cancellations after this may be subject to a fee.</p>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  className="mr-2"
                                  onClick={() => document.querySelector('[data-state="open"]')?.close()}
                                >
                                  Keep Booking
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => {
                                    handleCancelBooking(booking._id);
                                    document.querySelector('[data-state="open"]')?.close();
                                  }}
                                  disabled={isCancelling}
                                >
                                  {isCancelling ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...
                                    </>
                                  ) : (
                                    "Cancel Booking"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Booking Details Modal */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
          <DialogContent className="sm:max-w-[540px]">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-semibold text-lg">{selectedBooking.hotel?.name || "Hotel"}</h4>
                <p className="text-muted-foreground text-sm">{selectedBooking.hotel?.location}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-1">Check-in</h5>
                  <p className="font-medium">{format(new Date(selectedBooking.checkIn), 'MMM dd, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">After 3:00 PM</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-1">Check-out</h5>
                  <p className="font-medium">{format(new Date(selectedBooking.checkOut), 'MMM dd, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">Before 11:00 AM</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-1">Room Details</h5>
                <div className="flex justify-between">
                  <p className="font-medium">Room {selectedBooking.roomNumber}</p>
                  <p className="font-medium">${selectedBooking.totalPrice || (selectedBooking.hotel?.price || 0)}</p>
                </div>
                {selectedBooking.guestInfo && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-muted-foreground mb-1">Guest Information</h5>
                    <p>{selectedBooking.guestInfo.firstName} {selectedBooking.guestInfo.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.guestInfo.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.guestInfo.phone}</p>
                  </div>
                )}
                {selectedBooking.guestInfo?.specialRequests && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-muted-foreground mb-1">Special Requests</h5>
                    <p className="text-sm">{selectedBooking.guestInfo.specialRequests}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm">Booking ID: {selectedBooking._id}</p>
                <Badge variant="outline">{getBookingStatus(selectedBooking).label}</Badge>
              </div>
            </div>
            
            <DialogFooter>
              {getBookingStatus(selectedBooking).label === "Upcoming" && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleCancelBooking(selectedBooking._id);
                    setSelectedBooking(null);
                  }}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...
                    </>
                  ) : (
                    "Cancel Booking"
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserBookings;