import { useState } from "react";
import { SignedIn, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import UserBookings from "@/components/UserBookings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const UserBookingsPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState("bookings");

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <main className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ paddingTop: "50px" }}>My Account</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back
          </p>
        </div>
        <Button asChild>
          <Link to="/hotels">Find Hotels</Link>
        </Button>
      </div>

      <Tabs defaultValue="bookings" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="mt-0">
          <UserBookings />
        </TabsContent>
      
      </Tabs>
    </main>
  );
};

export default UserBookingsPage;