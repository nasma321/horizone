import { useEffect } from "react";
import { SignedIn } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { Helmet } from "react-helmet";
import BookingDetails from "@/components/BookingDetails";

const BookingDetailsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <SignedIn>
      <Helmet>
        <title>Booking Details | Wanderlux</title>
      </Helmet>
      <main className="container mx-auto px-4 py-12 min-h-screen">
        <BookingDetails />
      </main>
    </SignedIn>
  );
};

export default BookingDetailsPage;