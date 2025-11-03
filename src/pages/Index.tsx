import { AISidebar } from "@/components/AISidebar";
import { DashboardView } from "@/components/DashboardView";
import { useState } from "react";

const Index = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);

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
        !isDashboardCollapsed ? (
          <div className="bg-canvas rounded-2xl flex gap-6 p-6 flex-1 overflow-hidden">
            {/* Dashboard area - smoothly transitions in */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Generating dashboard...</p>
                  </div>
                </div>
              ) : (
                <DashboardView 
                  title="Students Below 70% in Math" 
                  onCollapse={() => setIsDashboardCollapsed(true)}
                />
              )}
            </div>
            
            {/* Vertical divider */}
            <div className="w-px bg-border shrink-0" />
            
            {/* Sidebar - same position throughout */}
            <AISidebar
              onSubmit={handleSubmit}
              isLoading={isLoading}
              showHistory={true}
              userPrompt={userPrompt}
              isDashboardCollapsed={false}
            />
          </div>
        ) : (
          <div className="flex gap-6 flex-1 overflow-hidden">
            {/* Empty canvas area when collapsed */}
            <div className="flex-1 bg-canvas rounded-2xl flex items-start justify-start p-6">
              <h2 className="text-2xl font-semibold bg-gradient-purple bg-clip-text text-transparent">
                Innovare Main UI
              </h2>
            </div>
            
            {/* Sidebar - collapsed state */}
            <AISidebar
              onSubmit={handleSubmit}
              isLoading={isLoading}
              showHistory={true}
              userPrompt={userPrompt}
              isDashboardCollapsed={true}
              onExpand={() => setIsDashboardCollapsed(false)}
            />
          </div>
        )
      ) : (
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Empty canvas area before submission */}
          <div className="flex-1 bg-canvas rounded-2xl flex items-start justify-start p-6">
            <h2 className="text-2xl font-semibold bg-gradient-purple bg-clip-text text-transparent">
              Innovare Main UI
            </h2>
          </div>
          
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
