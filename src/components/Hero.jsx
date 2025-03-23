import StepSearch from "@/components/StepSearch";

export default function Hero() {
  return (
    <div className="">
      <div className="relative z-10 flex flex-col items-center text-white justify-center px-8 pt-32 pb-32">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">
          Find Your Best Staycation
        </h1>
        <p className="text-xl mb-12 text-center max-w-2xl">
          Describe your dream destination and experience, and we'll find the
          perfect place for you.
        </p>

        <StepSearch />
      </div>
    </div>
  );
}