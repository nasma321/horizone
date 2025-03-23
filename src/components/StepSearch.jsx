import { useState } from "react";
import { useDispatch } from "react-redux";
import { submit } from "@/lib/features/searchSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Heart, 
  ChevronRight,
  ChevronLeft,
  Search,
  Bed,
  Coffee
} from "lucide-react";

export default function StepSearch() {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [searchData, setSearchData] = useState({
    location: "",
    budget: [200],
    dateRange: "",
    activities: "",
    amenities: "",
    preferences: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const searchQuery = `I want a staycation ${
      searchData.location ? `in ${searchData.location}` : ''
    } with a budget of $${searchData.budget[0]} per night. ${
      searchData.dateRange ? `Date range: ${searchData.dateRange}.` : ''
    } ${
      searchData.activities ? `I'm interested in these activities: ${searchData.activities}.` : ''
    } ${
      searchData.amenities ? `I need these amenities: ${searchData.amenities}.` : ''
    } ${
      searchData.preferences ? `Additional preferences: ${searchData.preferences}.` : ''
    }`;
    
    dispatch(submit(searchQuery));
    setIsSubmitting(false);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center text-xl font-medium text-white mb-2">
              <MapPin className="mr-2 text-sky-400" />
              Where would you like to stay?
            </div>
            <Select 
              value={searchData.location}
              onValueChange={(value) => handleInputChange("location", value)}
            >
              <SelectTrigger className="bg-black/20 border-none text-white h-12">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="Italy">Italy</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="urban">Urban City Center</SelectItem>
                <SelectItem value="beach">Beachfront</SelectItem>
                <SelectItem value="mountain">Mountain Retreat</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Or describe your ideal location..."
              className="bg-black/20 border-none text-white h-12"
              value={typeof searchData.location === 'string' ? searchData.location : ''}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center text-xl font-medium text-white mb-2">
              <DollarSign className="mr-2 text-sky-400" />
              What's your budget per night?
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">$50</span>
              <span className="text-white font-medium">$1000+</span>
            </div>
            <Slider
              defaultValue={searchData.budget}
              max={1000}
              min={50}
              step={10}
              className="mb-6"
              onValueChange={(value) => handleInputChange("budget", value)}
            />
            <div className="text-white text-center font-medium">
              ${searchData.budget[0]} per night
            </div>
            
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20= w-full"
                onClick={() => handleInputChange("budget", [100])}
              >
                Budget
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 w-full"
                onClick={() => handleInputChange("budget", [250])}
              >
                Mid-range
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 w-full"
                onClick={() => handleInputChange("budget", [500])}
              >
                Luxury
              </Button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center text-xl font-medium text-white mb-2">
              <Calendar className="mr-2 text-sky-400" />
              When are you planning to go?
            </div>
            <Input
              type="text"
              placeholder="E.g., Next weekend, July 15-20, Flexible..."
              className="bg-black/20 border-none text-white h-12"
              value={searchData.dateRange}
              onChange={(e) => handleInputChange("dateRange", e.target.value)}
            />
            <div className="text-white/70 text-sm">
              You can be specific or flexible with your dates
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div 
                className="bg-black/20 rounded-lg p-3 cursor-pointer hover:bg-black/30 transition-colors border border-white/10"
                onClick={() => handleInputChange("dateRange", "Next weekend")}
              >
                <h3 className="font-medium text-white mb-1">Next weekend</h3>
                <p className="text-xs text-white/70">Perfect for a quick getaway</p>
              </div>
              <div 
                className="bg-black/20 rounded-lg p-3 cursor-pointer hover:bg-black/30 transition-colors border border-white/10"
                onClick={() => handleInputChange("dateRange", "Within 30 days")}
              >
                <h3 className="font-medium text-white mb-1">Within 30 days</h3>
                <p className="text-xs text-white/70">Planning a trip soon</p>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center text-xl font-medium text-white mb-2">
              <Bed className="mr-2 text-sky-400" />
              What amenities are important?
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Room Service", "Pet Friendly", "Parking"].map((amenity) => (
                <div 
                  key={amenity}
                  className={`
                    flex items-center gap-2 p-2 rounded border cursor-pointer transition-all
                    ${searchData.amenities?.includes(amenity) 
                      ? "bg-sky-400/20 border-sky-400/50" 
                      : "bg-black/20 border-white/10 hover:bg-black/30"}
                  `}
                  onClick={() => {
                    const currentAmenities = searchData.amenities ? searchData.amenities.split(", ").filter(a => a) : [];
                    const isSelected = currentAmenities.includes(amenity);
                    
                    let newAmenities;
                    if (isSelected) {
                      newAmenities = currentAmenities.filter(a => a !== amenity);
                    } else {
                      newAmenities = [...currentAmenities, amenity];
                    }
                    
                    handleInputChange("amenities", newAmenities.join(", "));
                  }}
                >
                  <div className={`w-4 h-4 rounded-sm border ${searchData.amenities?.includes(amenity) ? "bg-sky-400 border-sky-400" : "border-white/50"}`}>
                    {searchData.amenities?.includes(amenity) && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-4 h-4">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <span className="text-white">{amenity}</span>
                </div>
              ))}
            </div>
            
            <Input
              type="text"
              placeholder="Any other specific amenities..."
              className="bg-black/20 border-none text-white h-12 mt-2"
              onChange={(e) => {
                const currentAmenities = searchData.amenities ? searchData.amenities : "";
                const customAmenity = e.target.value;
                if (customAmenity && !currentAmenities.includes(customAmenity)) {
                  handleInputChange("amenities", currentAmenities ? `${currentAmenities}, ${customAmenity}` : customAmenity);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.target.value = '';
                }
              }}
            />
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center text-xl font-medium text-white mb-2">
              <Sparkles className="mr-2 text-sky-400" />
              Any additional preferences?
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {["Quiet", "Ocean View", "City View", "Family Friendly", "Adults Only", "Eco-Friendly", "Luxury", "Budget Friendly"].map((pref) => (
                <div 
                  key={pref}
                  className={`
                    flex items-center gap-2 p-2 rounded border cursor-pointer transition-all
                    ${searchData.preferences?.includes(pref) 
                      ? "bg-sky-400/20 border-sky-400/50" 
                      : "bg-black/20 border-white/10 hover:bg-black/30"}
                  `}
                  onClick={() => {
                    const currentPrefs = searchData.preferences ? searchData.preferences.split(", ").filter(p => p) : [];
                    const isSelected = currentPrefs.includes(pref);
                    
                    let newPrefs;
                    if (isSelected) {
                      newPrefs = currentPrefs.filter(p => p !== pref);
                    } else {
                      newPrefs = [...currentPrefs, pref];
                    }
                    
                    handleInputChange("preferences", newPrefs.join(", "));
                  }}
                >
                  <div className={`w-4 h-4 rounded-sm border ${searchData.preferences?.includes(pref) ? "bg-sky-400 border-sky-400" : "border-white/50"}`}>
                    {searchData.preferences?.includes(pref) && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-4 h-4">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <span className="text-white">{pref}</span>
                </div>
              ))}
            </div>
            
            <Textarea
              placeholder="Any specific requirements or preferences for your perfect stay..."
              className="bg-black/20 border-none text-white h-20 resize-none"
              value={searchData.activities}
              onChange={(e) => handleInputChange("activities", e.target.value)}
            />
            
            <div className="pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-full h-12 text-lg flex items-center gap-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
              >
                <Search className="w-5 h-5 mr-2" />
                Find My Perfect Staycation
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, icon: MapPin, title: "Location" },
      { number: 2, icon: DollarSign, title: "Budget" },
      { number: 3, icon: Calendar, title: "Dates" },
      { number: 4, icon: Coffee, title: "Amenities" },
      { number: 5, icon: Sparkles, title: "Preferences" }
    ];
    
    return (
      <div className="flex justify-between mb-6 px-4">
        {steps.map((stepItem) => {
          const Icon = stepItem.icon;
          return (
            <div 
              key={stepItem.number}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setStep(stepItem.number)}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all
                  ${step === stepItem.number 
                    ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white" 
                    : step > stepItem.number 
                      ? "bg-sky-800 text-white/80" 
                      : "bg-white/20 text-white/60"}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-xs ${step === stepItem.number ? "text-white" : "text-white/60"}`}>
                {stepItem.title}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <Card className="bg-black/60 backdrop-blur-md border-none shadow-xl overflow-hidden">
        <CardContent className="pt-6">
          {renderStepIndicator()}
          
          <div className="min-h-48 transition-all duration-300">
            {renderStepContent()}
          </div>
          
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="rounded-full border-white/30 hover:text-white"
              >
                <ChevronLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
            )}
            {step < 5 && (
              <Button 
                onClick={nextStep}
                className={`rounded-full ml-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 ${!searchData.location && step === 1 ? "opacity-70" : ""}`}
                disabled={step === 1 && !searchData.location}
              >
                Next
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}