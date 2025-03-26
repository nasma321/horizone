import { useState } from "react";
import { useGetAllBookingsQuery } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Search, 
  Calendar, 
  User, 
  Building,
  Loader2,
  ArrowUpDown,
  Check,
  X,
  Eye,
  Filter,
  RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router";

const AdminBookingsPage = () => {
  const { data: bookings, isLoading, error, refetch } = useGetAllBookingsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filterAndSortBookings = () => {
    if (!bookings) return [];

    let filteredBookings = [...bookings];

    if (statusFilter !== "all") {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.status === statusFilter
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredBookings = filteredBookings.filter(
        (booking) =>
          booking._id.toLowerCase().includes(term) ||
          (booking.user?.firstName && booking.user.firstName.toLowerCase().includes(term)) ||
          (booking.user?.lastName && booking.user.lastName.toLowerCase().includes(term)) ||
          (booking.user?.email && booking.user.email.toLowerCase().includes(term)) ||
          (booking.hotelId && booking.hotelId.toString().toLowerCase().includes(term)) ||
          (booking.hotel?.name && booking.hotel.name.toLowerCase().includes(term))
      );
    }

    filteredBookings.sort((a, b) => {
      let valueA, valueB;

      switch (sortField) {
        case "createdAt":
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case "checkIn":
          valueA = new Date(a.checkIn).getTime();
          valueB = new Date(b.checkIn).getTime();
          break;
        case "price":
          valueA = a.totalPrice || 0;
          valueB = b.totalPrice || 0;
          break;
        case "guest":
          valueA = a.user ? `${a.user.firstName} ${a.user.lastName}` : "";
          valueB = b.user ? `${b.user.firstName} ${b.user.lastName}` : "";
          break;
        default:
          valueA = a[sortField] || "";
          valueB = b[sortField] || "";
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filteredBookings;
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
        <p className="text-red-600 mb-4">
          Error loading bookings: {error.data?.message || "An error occurred"}
        </p>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  const filteredBookings = filterAndSortBookings();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Bookings</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium">Search</label>
          <div className="relative mt-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, guest name, hotel..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-1/5">
          <label className="text-sm font-medium">Filter by Status</label>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="checked-out">Checked Out</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Booking ID</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("user")}>
                Guest
                {sortField === "user" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("hotelId")}>
                Hotel
                {sortField === "hotelId" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("checkIn")}>
                Check-in
                {sortField === "checkIn" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead>Room</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                Status
                {sortField === "status" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("totalPrice")}>
                Total
                {sortField === "totalPrice" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
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
                  <TableCell>
                    {booking.hotel ? (
                      <Link to={`/hotels/${booking.hotelId}`} className="hover:underline">
                        {booking.hotel.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">ID: {booking.hotelId}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      {format(new Date(booking.checkIn), "MMM dd, yyyy")}
                      <div className="text-xs text-muted-foreground">
                        to {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>#{booking.roomNumber}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                  </TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminBookingsPage;