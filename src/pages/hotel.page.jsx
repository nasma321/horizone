import { useState } from "react";
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
  Map,
  Calendar
} from "lucide-react";

import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";

export default function HotelPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: hotel, isLoading, isError, error } = useGetHotelByIdQuery(id);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleBook = async () => {
    try {
      navigate(`/booking/${id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const images = hotel ? [
    hotel.image,
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025",
  ] : [];

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
                </div>
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
                    <p className="text-sm text-muted-foreground">per night</p>
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
                  onClick={handleBook}
                >
                  Book Now
                </Button>
                
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Star className="h-3 w-3 text-green-500 mr-2" />
                    Free cancellation up to 48 hours before check-in
                  </li>
                  <li className="flex items-center">
                    <Star className="h-3 w-3 text-green-500 mr-2" />
                    No payment required today
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}