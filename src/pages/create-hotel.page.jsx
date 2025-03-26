import CreateHotelForm from "@/components/CreateHotelForm";

export default function CreateHotelPage() {
  return (
    <main className="container mx-auto px-4 py-12 min-h-screen">
    <h1 className="text-3xl md:text-4xl font-bold mb-8" style={{ paddingTop: "50px" }}>Create a New Hotel</h1>
    <CreateHotelForm />
    </main>
  );
}