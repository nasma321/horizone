import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetHotelsForSearchQueryQuery } from "@/lib/api";
import { 
  MapPin, 
  DollarSign, 
  Star, 
  Loader2,
  Wifi,
  Coffee,
  Tv
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";

export default function SearchResults() {
  const searchQuery = useSelector((state) => state.search.value);
  const { data: results, isLoading, error } = useGetHotelsForSearchQueryQuery(
    { query: searchQuery },
    { skip: !searchQuery }
  );
  const [sortedResults, setSortedResults] = useState([]);
  const [sortOption, setSortOption] = useState("relevance");
  
  useEffect(() => {
    if (results && Array.isArray(results)) {
      const validResults = results.filter(item => 
        item.hotel && 
        item.hotel.image && 
        item.hotel.name && 
        item.hotel.price
      );
      
      let sorted = [...validResults];
      
      switch (sortOption) {
        case "price-low":
          sorted.sort((a, b) => a.hotel.price - b.hotel.price);
          break;
        case "price-high":
          sorted.sort((a, b) => b.hotel.price - a.hotel.price);
          break;
        case "relevance":
        default:
          break;
      }
      
      setSortedResults(sorted);
    }
  }, [results, sortOption]);

  if (!searchQuery) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-4" />
        <p className="text-lg">Finding your perfect staycation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-500 mb-2">Something went wrong</p>
        <p>We couldn't find matches for your search. Please try again.</p>
      </div>
    );
  }

  if (!results || !Array.isArray(results) || results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg mb-2">No matches found</p>
        <p>Try adjusting your search criteria for more results.</p>
      </div>
    );
  }
  
  if (sortedResults.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg mb-2">No valid matches found</p>
        <p>Try adjusting your search criteria for more results.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div className="animate-fade-in-up">
          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">Your Perfect Staycations</h2>
          <p className="text-gray-600 mt-2">
            We found {sortedResults.length} perfect matches based on your preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Sort by:</span>
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="relevance">Best Match</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedResults.map((result, index) => {
          if (!result.hotel) return null;
          
          const amenities = [
            ["Free Wifi", <Wifi key="wifi" className="w-3 h-3 mr-1" />],
            ["Breakfast", <Coffee key="coffee" className="w-3 h-3 mr-1" />],
            ["Smart TV", <Tv key="tv" className="w-3 h-3 mr-1" />]
          ].slice(0, 2 + Math.floor(Math.random() * 2));
          
          return (
            <Card 
              key={result.hotel._id} 
              className={`overflow-hidden hover:shadow-lg transition-shadow animate-fade-in animation-delay-${(index % 5) * 100}`}
            >
              <div className="relative h-48 overflow-hidden group">
                <img 
                  src={result.hotel.image} 
                  alt={result.hotel.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="bg-white/90 text-black font-medium">
                    <DollarSign className="w-3.5 h-3.5 mr-1" /> {result.hotel.price}/night
                  </Badge>
                </div>
              </div>
              
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold line-clamp-1">{result.hotel.name}</h3>
                  <div className="flex items-center text-amber-400 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Star className="fill-amber-400 w-3.5 h-3.5" />
                    <span className="ml-1 text-sm font-medium text-amber-700">{result.hotel.rating || '4.8'}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{result.hotel.location}</span>
                </div>
                
                <p className="text-sm line-clamp-2 mb-3 text-gray-600">
                  {result.hotel.description || "Experience a wonderful stay at this beautiful hotel with everything you need for a perfect vacation."}
                </p>
                
                <div className="flex gap-1 flex-wrap mb-2">
                  {amenities.map(([name, icon]) => (
                    <Badge key={name} variant="outline" className="text-xs flex items-center">
                      {icon}
                      {name}
                    </Badge>
                  ))}
                </div>
                
                {result.confidence && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1 mt-3">
                    <div 
                      className="bg-gradient-to-r from-sky-500 to-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${result.confidence * 100}%` }}
                    ></div>
                  </div>
                )}
                
                {result.confidence && (
                  <div className="text-xs text-gray-500 mb-2">
                    Match: {Math.round(result.confidence * 100)}%
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-0 pb-4">
                <Link to={`/hotels/${result.hotel._id}`} className="w-full">
                  <Button 
                    variant="default" 
                    className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
                  >
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}