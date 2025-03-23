import { useGetHotelsForSearchQueryQuery } from "@/lib/api";
import { useState } from "react";
import HotelCard from "./HotelCard";
import LocationTab from "./LocationTab";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function HotelListings() {
  const searchValue = useSelector((state) => state.search.value);

  const {
    data: hotels,
    isLoading,
    isError,
    error,
  } = useGetHotelsForSearchQueryQuery({
    query: searchValue,
  });

  const locations = ["ALL", "France", "Italy", "Australia", "Japan"];
  const [selectedLocation, setSelectedLocation] = useState("ALL");

  const handleSelectedLocation = (location) => {
    setSelectedLocation(location);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Top trending hotels worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover the most trending hotels worldwide for an unforgettable
            experience.
          </p>
        </div>
        <div className="flex items-center gap-x-4 mb-8 overflow-x-auto pb-2">
          {locations.map((location, i) => (
            <LocationTab
              key={i}
              selectedLocation={selectedLocation}
              name={location}
              onClick={handleSelectedLocation}
            />
          ))}
        </div>
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
          <span className="ml-2 text-lg">Finding amazing hotels...</span>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Top trending hotels worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover the most trending hotels worldwide for an unforgettable
            experience.
          </p>
        </div>
        <div className="flex items-center gap-x-4 mb-8 overflow-x-auto pb-2">
          {locations.map((location, i) => (
            <LocationTab
              key={i}
              selectedLocation={selectedLocation}
              name={location}
              onClick={handleSelectedLocation}
            />
          ))}
        </div>
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-500 font-medium text-lg mb-2">Something went wrong</p>
          <p className="text-gray-600">{error?.toString() || "Error loading hotels. Please try again later."}</p>
        </div>
      </section>
    );
  }

  const filteredHotels =
    selectedLocation === "ALL"
      ? hotels
      : hotels.filter(({ hotel }) => {
          return hotel.location
            .toLowerCase()
            .includes(selectedLocation.toLowerCase());
        });

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
          Top trending hotels worldwide
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Discover the most trending hotels worldwide for an unforgettable
          experience. Each property is carefully selected to ensure an exceptional stay.
        </p>
      </motion.div>
      
      <div className="flex items-center gap-x-4 mb-8 overflow-x-auto pb-2">
        {locations.map((location, i) => (
          <LocationTab
            key={i}
            selectedLocation={selectedLocation}
            name={location}
            onClick={handleSelectedLocation}
          />
        ))}
      </div>
      
      {filteredHotels?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg mb-2">No hotels found for this location</p>
          <p className="text-gray-600">Try selecting a different location or search with different criteria.</p>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredHotels.map(({hotel, confidence}) => (
            <motion.div key={hotel._id} variants={item}>
              <HotelCard hotel={hotel} confidence={confidence} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}