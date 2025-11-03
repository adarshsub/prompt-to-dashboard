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
      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Left panel - always present */}
        <div className="flex-1 bg-canvas rounded-2xl overflow-hidden min-w-0">
          {(showResults || isLoading) && (
            <div className="p-6 h-full flex flex-col animate-in fade-in duration-300">
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Generating dashboard...</p>
                    </div>
                  </div>
                ) : (
                  <DashboardView title="Students Below 70% in Math" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - always on the right */}
        <AISidebar
          onSubmit={handleSubmit}
          isLoading={isLoading}
          showHistory={showResults || isLoading}
          userPrompt={userPrompt}
        />
      </div>
    </div>
  );
};

export default Index;
