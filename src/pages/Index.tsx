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
      <div className="bg-canvas rounded-2xl flex gap-6 p-6 flex-1 overflow-hidden relative">
        {/* Dashboard View - slides in from right */}
        <div
          className={`flex-1 transition-all duration-700 ease-in-out ${
            showResults
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0 absolute inset-0 pointer-events-none"
          }`}
        >
          {showResults && <DashboardView title="Students Below 70% in Math" />}
        </div>

        {/* Vertical divider - only visible when results are shown */}
        <div
          className={`w-[1px] bg-[#E2E6E9] shrink-0 transition-opacity duration-700 ${
            showResults ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Sidebar - always visible, content transitions */}
        <div className="transition-all duration-700 ease-in-out">
          <AISidebar
            onSubmit={handleSubmit}
            isLoading={isLoading}
            showHistory={showResults}
            userPrompt={userPrompt}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
