import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetHotelByIdQuery, useGetHotelBookingsQuery } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, isBefore, isAfter } from "date-fns";
import { 
  ArrowLeft,
  Calendar, 
  User, 
  Loader2,
  Eye,
  Hotel
} from "lucide-react";
import { Link } from "react-router";

const HotelBookingsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: hotel, isLoading: isLoadingHotel } = useGetHotelByIdQuery(id);
  const { data: bookings, isLoading: isLoadingBookings, error, refetch } = useGetHotelBookingsQuery(id);

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

  const getBookingStatus = (booking) => {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    if (booking.status === "cancelled") {
      return "Cancelled";
    } else if (isAfter(now, checkOut)) {
      return "Past";
    } else if (isAfter(now, checkIn) && isBefore(now, checkOut)) {
      return "Current";
    } else {
      return "Upcoming";
    }
  };

  // Group bookings by status
  const groupedBookings = bookings?.reduce((acc, booking) => {
    const status = getBookingStatus(booking);
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(booking);
    return acc;
  }, {});

  const isLoading = isLoadingHotel || isLoadingBookings;

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
        <p className="text-red-600 mb-4">
          Error loading bookings: {error.data?.message || "An error occurred"}
        </p>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg my-4">
        <p className="text-gray-600 mb-4">Hotel not found</p>
        <Button onClick={() => navigate("/hotels")}>Back to Hotels</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-3">
            <Link to={`/hotels/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hotel
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Bookings for {hotel.name}</h1>
          <p className="text-muted-foreground">{hotel.location}</p>
        </div>
        <Button onClick={refetch}>Refresh Bookings</Button>
      </div>

      {(!bookings || bookings.length === 0) ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">No bookings found for this hotel</p>
        </div>
      ) : (
        <div className="space-y-8">
          {["Current", "Upcoming", "Past", "Cancelled"].map((status) => {
            const statusBookings = groupedBookings[status] || [];
            if (statusBookings.length === 0) return null;
            
            return (
              <div key={status} className="space-y-4">
                <h2 className="text-xl font-semibold">{status} Bookings ({statusBookings.length})</h2>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Booking ID</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statusBookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell className="font-medium">
                            #{booking._id.slice(-6)}
                          </TableCell>
                          <TableCell>
                            {booking.user ? (
                              <div>
                                <div className="font-medium">{booking.user.firstName} {booking.user.lastName}</div>
                                <div className="text-xs text-muted-foreground">{booking.user.email}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell>#{booking.roomNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              <div>
                                {format(new Date(booking.checkIn), "MMM dd")} - {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>${booking.totalPrice}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="ghost">
                              <Link to={`/bookings/${booking._id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HotelBookingsPage;