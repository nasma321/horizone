import { useEffect, useState } from "react";
import StepSearch from "@/components/StepSearch";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import { Link } from "react-router";

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-[90vh] flex items-center">
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30"
        style={{ 
          opacity: Math.min(1, 1 - scrollY / 500),
        }}
      />
      
      <div className="container mx-auto px-4 md:px-8 z-10 mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Find Your Perfect <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500">Staycation</span> Experience
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Describe your dream destination and experience, and we'll find the perfect place for you.
          </p>
          
          <div className="flex justify-center">
            <Link to="/hotels">
              <Button 
                size="lg" 
                className="rounded-full bg-white text-gray-900 hover:bg-gray-100 flex items-center"
              >
                <Building className="mr-2 h-5 w-5" />
                Browse All Hotels
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StepSearch />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="flex space-x-4 text-white/80 text-sm">
            <div className="flex items-center">
              <span className="w-4 h-4 bg-indigo-400 rounded-full mr-2"></span>
              <span>AI Powered</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-purple-400 rounded-full mr-2"></span>
              <span>Personalized</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}