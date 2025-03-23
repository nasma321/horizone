import { useState } from "react";
import { MapPin, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

function HotelCard({ hotel }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div 
      className="group relative rounded-xl overflow-hidden shadow-md transition-all duration-300 bg-white hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            isHovered ? "scale-110" : "scale-100"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-rose-500 rounded-full z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-rose-500")} />
        </Button>
        
        <div className="absolute bottom-2 left-2 z-10 flex gap-1">
          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md">
            ${hotel.price} / night
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1">{hotel.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="ml-1 font-medium text-sm">{hotel?.rating ?? "4.8"}</span>
          </div>
        </div>
        
        <div className="flex items-center text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">{hotel.location}</span>
        </div>
        
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
          {hotel.description || "Enjoy a comfortable stay in this beautiful hotel with amazing amenities and breathtaking views."}
        </p>
        
        <Link to={`/hotels/${hotel._id}`} className="block mt-4">
          <Button 
            variant="default" 
            className="w-full transition-all bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
          >
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default HotelCard;