import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetHotelsForSearchQueryQuery } from "@/lib/api";
import { 
  MapPin, 
  DollarSign, 
  Star, 
  Loader2 
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
  
  // Debug the API response structure
  useEffect(() => {
    if (results) {
      console.log("API Response Structure:", results);
    }
    if (error) {
      console.error("API Error:", error);
    }
  }, [results, error]);

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
        <Loader2 className="w-12 h-12 text-sky-400 animate-spin mb-4" />
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
        <h2 className="text-2xl font-bold">Your Perfect Staycations</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm">Sort by:</span>
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-white/10 border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="relevance">Best Match</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedResults.map((result) => {
          if (!result.hotel) return null;
          
          return (
            <Card key={result.hotel._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={result.hotel.image} 
                  alt={result.hotel.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="bg-white/90 text-black font-medium">
                    <DollarSign className="w-4 h-4 mr-1" /> {result.hotel.price}/night
                  </Badge>
                </div>
              </div>
              
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{result.hotel.name}</h3>
                  <div className="flex items-center text-amber-400">
                    <Star className="fill-amber-400 w-4 h-4" />
                    <span className="ml-1 text-sm">{result.hotel.rating || '4.8'}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{result.hotel.location}</span>
                </div>
                
                <p className="text-sm line-clamp-3 mb-3">
                  {result.hotel.description}
                </p>
                
                <div className="flex gap-1 flex-wrap mb-2">
                  {['Free Wifi', 'Breakfast', 'Pool'].map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 pb-4">
                <Link to={`/hotels/${result.hotel._id}`} className="w-full">
                  <Button variant="default" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {sortedResults.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {sortedResults.length} results based on your preferences
        </div>
      )}
    </div>
  );
}