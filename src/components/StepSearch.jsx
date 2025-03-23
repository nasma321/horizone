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
  Search
} from "lucide-react";

export default function StepSearch() {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [searchData, setSearchData] = useState({
    location: "",
    budget: [200], // Default budget value
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
                <SelectItem value="urban">Urban City Center</SelectItem>
                <SelectItem value="beach">Beachfront</SelectItem>
                <SelectItem value="mountain">Mountain Retreat</SelectItem>
                <SelectItem value="countryside">Countryside</SelectItem>
                <SelectItem value="lakeside">Lakeside</SelectItem>
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
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center text-xl font-medium text-white mb-2">
              <Heart className="mr-2 text-sky-400" />
              What activities or amenities are important?
            </div>
            <Textarea
              placeholder="E.g., Swimming pool, spa, near hiking trails, family-friendly..."
              className="bg-black/20 border-none text-white h-24 resize-none"
              value={searchData.amenities}
              onChange={(e) => handleInputChange("amenities", e.target.value)}
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
            <Textarea
              placeholder="E.g., Quiet atmosphere, pet-friendly, ocean view..."
              className="bg-black/20 border-none text-white h-24 resize-none"
              value={searchData.preferences}
              onChange={(e) => handleInputChange("preferences", e.target.value)}
            />
            <div className="pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-full h-12 text-lg flex items-center gap-x-2"
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
    return (
      <div className="flex justify-between mb-6 px-4">
        {[1, 2, 3, 4, 5].map((stepNumber) => (
          <div 
            key={stepNumber}
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all
              ${step === stepNumber 
                ? "bg-sky-400 text-white" 
                : step > stepNumber 
                  ? "bg-sky-800 text-white/80" 
                  : "bg-white/20 text-white/60"}`}
            onClick={() => setStep(stepNumber)}
          >
            {stepNumber}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <Card className="bg-black/40 backdrop-blur-md border-none shadow-xl">
        <CardContent className="pt-6">
          {renderStepIndicator()}
          
          <div className="min-h-48">
            {renderStepContent()}
          </div>
          
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
            )}
            {step < 5 && (
              <Button 
                onClick={nextStep}
                className={`rounded-full ml-auto ${!searchData.location && step === 1 ? "opacity-70" : ""}`}
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