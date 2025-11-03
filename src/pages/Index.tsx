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
      {(showResults || isLoading) ? (
        <div className="bg-canvas rounded-2xl flex gap-6 p-6 flex-1 overflow-hidden">
          {/* Dashboard area - only shows after loading completes */}
          {showResults && (
            <>
              <DashboardView title="Students Below 70% in Math" />
              <div className="w-[1px] bg-[#E2E6E9] shrink-0" />
            </>
          )}
          
          {/* Sidebar - same position throughout */}
          <AISidebar
            onSubmit={handleSubmit}
            isLoading={isLoading}
            showHistory={true}
            userPrompt={userPrompt}
          />
        </div>
      ) : (
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Empty canvas area before submission */}
          <div className="flex-1 bg-canvas rounded-2xl" />
          
          {/* Sidebar - initial state */}
          <AISidebar
            onSubmit={handleSubmit}
            isLoading={false}
            showHistory={false}
            userPrompt={userPrompt}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
