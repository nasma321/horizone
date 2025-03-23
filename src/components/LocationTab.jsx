import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function LocationTab({ selectedLocation, name, onClick }) {
  const isSelected = selectedLocation === name;
  
  const handleClick = () => {
    onClick(name);
  };

  return (
    <button
      className={cn(
        "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isSelected ? "text-sky-600" : "text-gray-600 hover:text-gray-900"
      )}
      onClick={handleClick}
    >
      {name}
      {isSelected && (
        <motion.div
          layoutId="locationIndicator"
          className="absolute inset-0 rounded-full bg-sky-100"
          style={{ zIndex: -1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </button>
  );
}

export default LocationTab;