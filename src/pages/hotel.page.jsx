import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetHotelByIdQuery } from "@/lib/api";
import {
  Coffee,
  MapPin,
  MenuSquare,
  Star,
  Tv,
  Wifi,
  Heart,
  Share,
  ArrowLeft,
  Loader2,
  Users,
  Bed
} from "lucide-react";

import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

export default function HotelPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  
  const { data: hotel, isLoading, isError, error } = useGetHotelByIdQuery(id);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Group rooms by type for display
  const [roomTypes, setRoomTypes] = useState([]);
  
  useEffect(() => {
    if (hotel?.rooms) {
      // Group rooms by type and calculate availability and prices
      const types = {};
      
      hotel.rooms.forEach(room => {
        if (!types[room.type]) {
          types[room.type] = {
            type: room.type,
            price: room.price,
            capacity: room.capacity,
            availableCount: 0,
            amenities: room.amenities || []
          };
        }
        
        if (room.available) {
          types[room.type].availableCount++;
        }
      });
      
      // Convert to array and sort by price
      setRoomTypes(Object.values(types).sort((a, b) => a.price - b.price));
    }
  }, [hotel]);

  const handleBookRoomType = (roomType) => {
    // In a real app, this would navigate to a booking page with room type preset
    navigate(`/booking/${id}?roomType=${roomType}`);
  };

  const images = hotel ? [
    hotel.image,
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025",
  ] : [];

  // Helper function to get icon for amenity
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="h-5 w-5" />;
    if (amenityLower.includes('breakfast')) return <Coffee className="h-5 w-5" />;
    if (amenityLower.includes('restaurant')) return <MenuSquare className="h-5 w-5" />;
    if (amenityLower.includes('tv')) return <Tv className="h-5 w-5" />;
    return <Star className="h-5 w-5" />;
  };

  if (isLoading)
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
          <span className="ml-2 text-lg">Loading hotel details...</span>
        </div>
      </div>
    );

  if (isError) return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <p className="text-red-500 font-medium text-lg mb-2">Error loading hotel details</p>
        <p className="text-gray-600 mb-6">{error?.toString() || "Please try again later."}</p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="mb-4"
        >
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to results
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold">{hotel.name}</h1>
            <div className="flex items-center mt-2">
              <MapPin className="h-5 w-5 text-muted-foreground mr-1" />
              <p className="text-muted-foreground">{hotel.location}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isAdmin && (
              <Button asChild variant="outline">
                <Link to={`/hotels/${id}/bookings`}>
                  <Users className="mr-2 h-4 w-4" />
                  View Bookings
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2">
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden h-[400px]">
                <img
                  src={images[selectedImage]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`h-20 rounded-md overflow-hidden cursor-pointer transition-all ${
                      selectedImage === idx ? "ring-2 ring-sky-500" : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">About this hotel</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-6">
                  {hotel.amenities && hotel.amenities.length > 0 ? (
                    hotel.amenities.map((amenity, index) => {
                      const icon = getAmenityIcon(amenity);
                      
                      return (
                        <div key={index} className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                            {icon}
                          </div>
                          <span>{amenity}</span>
                        </div>
                      );
                    })
                  ) : (
                    // Default amenities if none specified
                    <>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                          <Wifi className="h-5 w-5" />
                        </div>
                        <span>Free High-Speed WiFi</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                          <MenuSquare className="h-5 w-5" />
                        </div>
                        <span>Gourmet Restaurant</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                          <Tv className="h-5 w-5" />
                        </div>
                        <span>Smart TV</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                          <Coffee className="h-5 w-5" />
                        </div>
                        <span>Coffee Service</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Room Types Section - Replaces the old Room Information section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Room Types</h2>
                {roomTypes.length > 0 ? (
                  <div className="space-y-4">
                    {roomTypes.map((roomType, index) => (
                      <div key={index} className="border rounded-md p-5 hover:border-sky-200 hover:bg-sky-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <Bed className="h-5 w-5 text-sky-600 mr-2" />
                              <h3 className="font-semibold text-lg">{roomType.type} Room</h3>
                            </div>
                            <p className="text-muted-foreground mt-1">
                              Capacity: {roomType.capacity} {roomType.capacity === 1 ? 'person' : 'people'} 
                              • {roomType.availableCount} available
                            </p>
                            
                            {roomType.amenities && roomType.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {roomType.amenities.map((amenity, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="mt-4">
                              <p className="text-sm text-gray-600">
                                {roomType.type === 'Standard' ? 
                                  'Perfect for budget-conscious travelers who still want comfort.' :
                                  roomType.type === 'Deluxe' ? 
                                  'Enhanced comfort with additional amenities and more space.' :
                                  roomType.type === 'Suite' ?
                                  'Spacious accommodation with separate living area.' :
                                  'Our most luxurious offering with premium features and service.'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold">${roomType.price}</p>
                            <p className="text-sm text-muted-foreground">per night</p>
                            
                            <Button 
                              onClick={() => handleBookRoomType(roomType.type)}
                              size="sm"
                              className="mt-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No room information available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="col-span-1">
          <div className="sticky top-24">
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold">${hotel.price}</p>
                    <p className="text-sm text-muted-foreground">starting price per night</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="ml-1 font-bold">{hotel?.rating || "4.8"}</span>
                    <span className="text-muted-foreground ml-1">
                      ({hotel?.reviews || "124"} reviews)
                    </span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
                  onClick={() => navigate(`/booking/${id}`)}
                >
                  View All Rooms
                </Button>
                
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Star className="h-3 w-3 text-green-500 mr-2" />
                    {hotel.policies?.cancellationPolicy || "Free cancellation up to 24 hours before check-in"}
                  </li>
                  <li className="flex items-center">
                    <Star className="h-3 w-3 text-green-500 mr-2" />
                    No payment required today
                  </li>
                  {hotel.policies?.checkInTime && (
                    <li className="flex items-center">
                      <Star className="h-3 w-3 text-green-500 mr-2" />
                      Check-in from {hotel.policies.checkInTime}
                    </li>
                  )}
                  {hotel.policies?.checkOutTime && (
                    <li className="flex items-center">
                      <Star className="h-3 w-3 text-green-500 mr-2" />
                      Check-out until {hotel.policies.checkOutTime}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}