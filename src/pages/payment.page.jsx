import CheckoutForm from "@/components/CheckoutForm";
import { useSearchParams } from "react-router";
import { useGetBookingByIdQuery } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { format } from "date-fns";

function PaymentPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const { data: booking, isLoading, error } = useGetBookingByIdQuery(bookingId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h2>
        <p className="mb-6">We couldn't find the booking you're looking for.</p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const formattedCheckIn = format(checkInDate, "MMM dd, yyyy");
  const formattedCheckOut = format(checkOutDate, "MMM dd, yyyy");

  return (
    <main className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6" style={{ paddingTop: "50px" }}> Review Your Booking</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-600">Hotel:</span>
                  <span className="font-medium">{booking.hotelName || "Hotel"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{booking.roomType || "Standard"} #{booking.roomNumber}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{formattedCheckIn}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{formattedCheckOut}</span>
                </li>
                <li className="flex justify-between font-bold pt-3 border-t">
                  <span>Total Amount:</span>
                  <span>${booking.totalPrice?.toFixed(2) || "0.00"}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
              <p className="text-gray-600 mb-4">
                Secure payment processing by Stripe
              </p>
            </div>
          </div>
          
          <div>
            <CheckoutForm bookingId={bookingId} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default PaymentPage;