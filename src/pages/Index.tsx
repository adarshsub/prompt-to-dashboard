import { AISidebar } from "@/components/AISidebar";
import { DashboardView } from "@/components/DashboardView";
import { useState, useEffect } from "react";
import { generateDashboardTitle } from "@/lib/promptUtils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { sendToN8N, postInsightsToN8N } from "@/lib/n8nApi";
import { ChartData, Insight } from "@/types/dashboard";
import { toast } from "sonner";

const Index = () => {
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      prompt: string;
      title: string;
      submittedAt: Date;
      isLoaded: boolean;
      charts?: ChartData[];
      insights?: Insight[];
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [currentCharts, setCurrentCharts] = useState<ChartData[]>([]);
  const [currentInsights, setCurrentInsights] = useState<Insight[]>([]);

  const handleSubmit = async (prompt: string) => {
    const newConversation = {
      prompt,
      title: generateDashboardTitle(prompt),
      submittedAt: new Date(),
      isLoaded: false,
    };

    setConversationHistory((prev) => [...prev, newConversation]);
    setIsLoading(true);
    setShowResults(true);
    setIsSidebarHidden(false);

    try {
      console.log("Submitting prompt:", prompt);
      
      // Call n8n webhook with the question
      const response = await sendToN8N(prompt);
      
      console.log("Received n8n response:", response);
      
      // Extract charts and insights from n8n response
      const charts = response.charts || [];
      const insights = response.insights || [];

      console.log("Extracted - Charts:", charts.length, "Insights:", insights.length);

      // If no data returned, show warning but still display empty dashboard
      if (charts.length === 0 && insights.length === 0) {
        console.warn("No charts or insights returned from n8n");
        toast.error("No data returned from n8n. Please check your webhook configuration.");
      }

      setCurrentCharts(charts);
      setCurrentInsights(insights);

      // Post insights back to n8n if we have any
      if (insights.length > 0) {
        console.log("Posting insights back to n8n");
        await postInsightsToN8N(insights);
      }

      // Mark the conversation as loaded with the data
      setConversationHistory((prev) =>
        prev.map((conv, idx) =>
          idx === prev.length - 1 ? { ...conv, isLoaded: true, charts, insights } : conv
        )
      );
      
      setIsDashboardCollapsed(false);
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error(`Failed to generate dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Remove the failed conversation
      setConversationHistory((prev) => prev.slice(0, -1));
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
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
      {showResults || isLoading ? (
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
                  title={
                    conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1].title : ""
                  }
                  charts={currentCharts}
                  insights={currentInsights}
                  onCollapse={() => setIsDashboardCollapsed(true)}
                  onAskQuestion={handleSubmit}
                />
              )}
            </div>

            {/* Vertical divider */}
            {!isSidebarHidden && (
              <div className="flex flex-col self-stretch pt-6 pb-2 shrink-0">
                <div className="w-px bg-border flex-1" />
              </div>
            )}

            {/* Sidebar - same position throughout */}
            {!isSidebarHidden && (
              <AISidebar
                onSubmit={handleSubmit}
                isLoading={isLoading}
                showHistory={true}
                conversationHistory={conversationHistory}
                isDashboardCollapsed={false}
                onExpand={() => setIsDashboardCollapsed(true)}
                onClose={handleCloseSidebar}
              />
            )}

            {/* Create with AI CTA button */}
            {isSidebarHidden && (
              <Button
                onClick={handleOpenSidebar}
                className="absolute top-8 right-8 bg-gradient-purple text-white hover:opacity-90 transition-opacity"
                size="sm"
              >
                <Sparkles className="h-4 w-4" />
                Create with AI
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-6 flex-1 overflow-hidden">
            {/* Empty canvas area when collapsed */}
            <div className="flex-1 bg-canvas rounded-2xl flex items-center justify-center relative">
              <h2 className="text-2xl font-medium text-muted-foreground">Main UI</h2>

              {/* Create with AI CTA button */}
              {isSidebarHidden && (
                <Button
                  onClick={handleOpenSidebar}
                  className="absolute top-8 right-8 bg-gradient-purple text-white hover:opacity-90 transition-opacity"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4" />
                  Create with AI
                </Button>
              )}
            </div>

            {/* Sidebar - collapsed state */}
            {!isSidebarHidden && (
              <AISidebar
                onSubmit={handleSubmit}
                isLoading={isLoading}
                showHistory={true}
                conversationHistory={conversationHistory}
                isDashboardCollapsed={true}
                onExpand={() => setIsDashboardCollapsed(false)}
                onClose={handleCloseSidebar}
              />
            )}
          </div>
        )
      ) : (
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Empty canvas area before submission */}
          <div className="flex-1 bg-canvas rounded-2xl flex items-center justify-center relative">
            <h2 className="text-2xl font-medium text-muted-foreground">Main UI</h2>

            {/* Create with AI CTA button */}
            {isSidebarHidden && (
              <Button
                onClick={handleOpenSidebar}
                className="absolute top-8 right-8 bg-gradient-purple text-white hover:opacity-90 transition-opacity"
                size="sm"
              >
                <Sparkles className="h-4 w-4" />
                Create with AI
              </Button>
            )}
          </div>

          {/* Sidebar - initial state */}
          {!isSidebarHidden && (
            <AISidebar
              onSubmit={handleSubmit}
              isLoading={false}
              showHistory={false}
              conversationHistory={[]}
              onClose={handleCloseSidebar}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
