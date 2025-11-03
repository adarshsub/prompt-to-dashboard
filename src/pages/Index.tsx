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
    <div className="h-screen bg-background p-6 flex flex-col overflow-hidden">
      <div className="bg-canvas rounded-2xl flex gap-6 p-6 flex-1 overflow-hidden">
        {/* Dashboard - slides in from left with smooth transition */}
        <div 
          className={`transition-all duration-700 ease-in-out ${
            showResults 
              ? "flex-1 opacity-100 translate-x-0" 
              : "w-0 opacity-0 -translate-x-full overflow-hidden"
          }`}
        >
          {showResults && <DashboardView title="Students Below 70% in Math" />}
        </div>

        {/* Vertical divider - fades in when dashboard appears */}
        <div 
          className={`w-[1px] bg-[#E2E6E9] shrink-0 transition-opacity duration-700 ${
            showResults ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Sidebar - always present, same instance */}
        <AISidebar
          onSubmit={handleSubmit}
          isLoading={isLoading}
          showHistory={showResults}
          userPrompt={userPrompt}
        />
      </div>
    </div>
  );
};

export default Index;
