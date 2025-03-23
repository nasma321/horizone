import Hero from "@/components/Hero";
import SearchResults from "@/components/SearchResults";
import { useSelector } from "react-redux";

export default function HomePage() {
  const searchQuery = useSelector((state) => state.search.value);

  return (
    <div style={{ paddingTop: "60px" }}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-0"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center z-[-1]"
          style={{
            backgroundImage: "url('/assets/hero/hero_1.jpg')",
            filter: searchQuery ? "blur(2px)" : "none",
            transition: "filter 0.5s ease"
          }}
        ></div>
        
        <Hero />
      </div>
      
      {searchQuery && (
        <div className="bg-white py-8">
          <SearchResults />
        </div>
      )}

      {!searchQuery && (
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Wanderlux for Your Staycation?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-sky-100 rounded-full text-sky-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 22v-9H4v9" />
                    <path d="M2 13v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3" />
                    <path d="M12 2v8" />
                    <path d="m9 5 3-3 3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Personalized Recommendations</h3>
                <p className="text-gray-600">Our AI technology helps you discover the perfect staycation tailored to your unique preferences.</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-sky-100 rounded-full text-sky-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                    <path d="M8.5 8.5v.01" />
                    <path d="M16 15.5v.01" />
                    <path d="M12 12v.01" />
                    <path d="M11 17v.01" />
                    <path d="M7 14v.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Exclusive Local Experiences</h3>
                <p className="text-gray-600">Discover hidden gems and authentic local experiences you won't find anywhere else.</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-sky-100 rounded-full text-sky-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Hassle-Free Booking</h3>
                <p className="text-gray-600">Simple, transparent booking process with no hidden fees and 24/7 customer support.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}