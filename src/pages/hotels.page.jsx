import { useState, useEffect } from "react";
import { useGetHotelsQuery, useGetHotelLocationsQuery } from "@/lib/api";
import HotelCard from "@/components/HotelCard";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, RefreshCw, MapPin, ArrowDown, ArrowUp } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { motion } from "framer-motion";

const HotelsPage = () => {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortDirection, setSortDirection] = useState("none");
  
  const queryParams = {
    ...(selectedLocation !== "all" && { location: selectedLocation }),
    ...(sortDirection !== "none" && { sortBy: "price", order: sortDirection })
  };
  
  const { 
    data: hotels, 
    isLoading, 
    isError, 
    refetch 
  } = useGetHotelsQuery(queryParams);
  
  const { 
    data: locations, 
    isLoading: isLoadingLocations 
  } = useGetHotelLocationsQuery();

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
  };

  const toggleSortDirection = () => {
    if (sortDirection === "none") {
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortDirection("none");
    }
  };

  const resetFilters = () => {
    setSelectedLocation("all");
    setSortDirection("none");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 text-sky-500 animate-spin mb-4" />
          <p className="text-lg">Loading hotels...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg p-8">
          <p className="text-red-500 text-lg font-medium mb-4">Failed to load hotels</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
          All Hotels
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mt-2">
        Find your ideal stay from our collection of premium hotels and resorts across the globe
        </p>
      </motion.div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <p className="text-sm font-medium mb-1.5 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-sky-600" />
                Filter by Location
              </p>
              <Select 
                value={selectedLocation} 
                onValueChange={handleLocationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations?.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetFilters}
                disabled={selectedLocation === "all" && sortDirection === "none"}
                className="h-10"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Reset Filters
              </Button>
            </div>
          </div>

          <div className="flex items-end">
            <Button 
              variant={sortDirection !== "none" ? "default" : "outline"}
              className={`h-10 ${
                sortDirection !== "none" ? "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700" : ""
              }`}
              onClick={toggleSortDirection}
            >
              Price 
              {sortDirection === "asc" && <ArrowUp className="ml-1.5 w-4 h-4" />}
              {sortDirection === "desc" && <ArrowDown className="ml-1.5 w-4 h-4" />}
              {sortDirection === "none" && <ChevronDown className="ml-1.5 w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {hotels?.length} {hotels?.length === 1 ? "hotel" : "hotels"} found
        {selectedLocation !== "all" && ` in ${selectedLocation}`}
        {sortDirection !== "none" && ` sorted by price ${sortDirection === "asc" ? "low to high" : "high to low"}`}
      </div>

      {hotels?.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {hotels.map((hotel) => (
            <motion.div 
              key={hotel._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <HotelCard hotel={hotel} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-lg mb-2">No hotels found</p>
          <p className="text-muted-foreground mb-6">Try changing your filters or check back later for new listings</p>
          <Button onClick={resetFilters}>View All Hotels</Button>
        </div>
      )}
    </main>
  );
};

export default HotelsPage;