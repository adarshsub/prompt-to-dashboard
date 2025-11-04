import { AISidebar } from "@/components/AISidebar";
import { DashboardView } from "@/components/DashboardView";
import { useState } from "react";
import { generateDashboardTitle } from "@/lib/promptUtils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [dashboardTitle, setDashboardTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  const handleSubmit = (prompt: string) => {
    setUserPrompt(prompt);
    setDashboardTitle(generateDashboardTitle(prompt));
    setSubmittedAt(new Date());
    setIsLoading(true);
    setShowResults(false);
    setIsSidebarHidden(false);

    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
      // Automatically expand dashboard view
      setIsDashboardCollapsed(false);
    }, 2000);
  };

  const handleCloseSidebar = () => {
    setIsSidebarHidden(true);
    setIsDashboardCollapsed(true);
  };

  const handleOpenSidebar = () => {
    setIsSidebarHidden(false);
  };

  return (
    <div className="h-screen bg-background p-6 flex flex-col overflow-hidden">
      {(showResults || isLoading) ? (
        !isDashboardCollapsed ? (
          <div className="bg-canvas rounded-2xl flex gap-6 pt-0.5 px-6 pb-6 flex-1 overflow-hidden">
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
                  title={dashboardTitle} 
                  onCollapse={() => setIsDashboardCollapsed(true)}
                />
              )}
            </div>
            
            {/* Vertical divider */}
            {!isSidebarHidden && <div className="flex flex-col self-stretch pt-6 pb-2 shrink-0">
              <div className="w-px bg-border flex-1" />
            </div>}
            
            {/* Sidebar - same position throughout */}
            {!isSidebarHidden && <AISidebar
              onSubmit={handleSubmit}
              isLoading={isLoading}
              showHistory={true}
              userPrompt={userPrompt}
              dashboardTitle={dashboardTitle}
              isDashboardCollapsed={false}
              onExpand={() => setIsDashboardCollapsed(true)}
              submittedAt={submittedAt}
              onClose={handleCloseSidebar}
            />}

            {/* Create with AI CTA button */}
            {isSidebarHidden && <Button
              onClick={handleOpenSidebar}
              className="absolute top-8 right-8 bg-gradient-purple text-white hover:opacity-90 transition-opacity"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create with AI
            </Button>}
          </div>
        ) : (
          <div className="flex gap-6 flex-1 overflow-hidden">
            {/* Empty canvas area when collapsed */}
            <div className="flex-1 bg-canvas rounded-2xl flex items-center justify-center relative">
              <h2 className="text-2xl font-medium text-muted-foreground">
                Main UI
              </h2>

              {/* Create with AI CTA button */}
              {isSidebarHidden && <Button
                onClick={handleOpenSidebar}
                className="absolute top-8 right-8 bg-gradient-purple text-white hover:opacity-90 transition-opacity"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create with AI
              </Button>}
            </div>
            
            {/* Sidebar - collapsed state */}
            {!isSidebarHidden && <AISidebar
              onSubmit={handleSubmit}
              isLoading={isLoading}
              showHistory={true}
              userPrompt={userPrompt}
              dashboardTitle={dashboardTitle}
              isDashboardCollapsed={true}
              onExpand={() => setIsDashboardCollapsed(false)}
              submittedAt={submittedAt}
              onClose={handleCloseSidebar}
            />}
          </div>
        )
      ) : (
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Empty canvas area before submission */}
          <div className="flex-1 bg-canvas rounded-2xl flex items-center justify-center relative">
            <h2 className="text-2xl font-medium text-muted-foreground">
              Main UI
            </h2>

            {/* Create with AI CTA button */}
            {isSidebarHidden && <Button
              onClick={handleOpenSidebar}
              className="absolute top-8 right-8 bg-gradient-purple text-white hover:opacity-90 transition-opacity"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create with AI
            </Button>}
          </div>
          
          {/* Sidebar - initial state */}
          {!isSidebarHidden && <AISidebar
            onSubmit={handleSubmit}
            isLoading={false}
            showHistory={false}
            userPrompt={userPrompt}
            onClose={handleCloseSidebar}
          />}
        </div>
      )}
    </div>
  );
};

export default Index;
