import BookingForm from "@/components/BookingForm";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useParams } from "react-router";

export default function BookingFormPage() {
  const { id } = useParams();
  const { isSignedIn } = useUser();

  return (
    <main className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-8" style={{ paddingTop: "50px" }}>Book Your Stay</h1>
      
      <SignedIn>
        <BookingForm />
      </SignedIn>
      
      <SignedOut>
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Please sign in to book</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to make a booking.</p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to={`/hotels/${id}`}>Back to Hotel</Link>
            </Button>
            <Button asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </SignedOut>
    </main>
  );
}