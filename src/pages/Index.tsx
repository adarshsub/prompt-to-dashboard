import { AISidebar } from "@/components/AISidebar";
import { DashboardView } from "@/components/DashboardView";
import { useState } from "react";

const Index = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (prompt: string) => {
    setUserPrompt(prompt);
    setIsLoading(true);
    setShowResults(false);

    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="h-screen bg-background p-6 flex flex-col">
      {showResults ? (
        <div className="bg-canvas rounded-2xl flex gap-6 p-6 flex-1">
          <DashboardView title="Students Below 70% in Math" />
          <div className="w-[1px] bg-[#E2E6E9]"></div>
          <AISidebar
            onSubmit={handleSubmit}
            isLoading={isLoading}
            showHistory={userPrompt !== ""}
            userPrompt={userPrompt}
          />
        </div>
      ) : (
        <div className="flex gap-6 flex-1">
          <div className="flex-1 bg-canvas rounded-2xl">
            {/* Main canvas area for charts and visualizations */}
          </div>
          <AISidebar
            onSubmit={handleSubmit}
            isLoading={isLoading}
            showHistory={userPrompt !== ""}
            userPrompt={userPrompt}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
