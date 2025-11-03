import { AISidebar } from "@/components/AISidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6 flex gap-6">
      <div className="flex-1 bg-canvas rounded-2xl">
        {/* Main canvas area for charts and visualizations */}
      </div>
      <AISidebar />
    </div>
  );
};

export default Index;
