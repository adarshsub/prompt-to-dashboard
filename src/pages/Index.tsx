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

      // Helper to extract charts and insights from flexible n8n payloads
      function extractChartsAndInsights(data: any): { charts: ChartData[]; insights: Insight[]; invalidSql: boolean } {
        const charts: ChartData[] = [];
        const insights: Insight[] = [];
        let invalidSql = false;
        const seen: any[] = [];

        // Accept direct proxy shape { charts, insights }
        if (data && (Array.isArray((data as any).charts) || Array.isArray((data as any).insights))) {
          if (Array.isArray((data as any).charts)) charts.push(...(data as any).charts);
          if (Array.isArray((data as any).insights)) insights.push(...(data as any).insights);
          return { charts, insights, invalidSql };
        }

        const visit = (node: any) => {
          if (node == null) return;
          if (typeof node === 'string') {
            if (node.includes('Invalid SQL. Please try again.')) invalidSql = true;
            return;
          }
          if (typeof node !== 'object') return;
          if (seen.includes(node)) return;
          seen.push(node);

          // Direct fields - parse insights output
          if (typeof (node as any).output === 'string') {
            const output = (node as any).output;
            
            // Remove everything from "**Related Factors" onwards
            const cleanedOutput = output.split('**Related Factors')[0];
            
            // Split by asterisks and process each part
            const parts = cleanedOutput.split('*').map((p: string) => p.trim()).filter((p: string) => p.length > 0);
            
            for (const part of parts) {
              // Remove labels and clean up
              const cleaned = part
                .replace(/\*\*Blurb:\*\*/gi, '')
                .replace(/\*\*Key Observations:\*\*/gi, '')
                .replace(/\*\*/g, '')
                .replace(/Blurb:/gi, '')
                .replace(/Key Observations:/gi, '')
                .trim();
              
              // Skip if it's just a label or empty
              if (cleaned.length > 0 && 
                  !cleaned.toLowerCase().match(/^(blurb|key observations):?$/)) {
                insights.push({ text: cleaned, id: `insight-${insights.length}` });
              }
            }
          }

          // Plotly figure -> ChartData
          if (typeof (node as any).plotly_figure_json === 'string') {
            try {
              const fig = JSON.parse((node as any).plotly_figure_json);
              const trace = Array.isArray(fig?.data) ? fig.data[0] : undefined;
              if (trace) {
                let type: ChartData['type'] = 'bar';
                if (trace.type === 'line') type = 'line';
                else if (trace.type === 'pie') type = 'pie';
                else if (trace.type === 'area') type = 'area';

                const items: any[] = [];
                if (type === 'pie' && Array.isArray(trace.labels) && Array.isArray(trace.values)) {
                  for (let i = 0; i < trace.labels.length; i++) {
                    items.push({ name: String(trace.labels[i]), value: Number(trace.values[i]) });
                  }
                } else if (Array.isArray(trace.x) && Array.isArray(trace.y)) {
                  for (let i = 0; i < trace.x.length; i++) {
                    items.push({ name: String(trace.x[i]), value: Number(trace.y[i]) });
                  }
                }

                charts.push({ type, data: items, config: { title: fig?.layout?.title?.text } });
              }
            } catch (e) {
              console.warn('Failed to parse plotly_figure_json', e);
            }
          }

          // Status / error indicators
          if (typeof (node as any).status === 'string' && (node as any).status.toLowerCase() !== 'success') {
            invalidSql = true;
          }
          if ((node as any).error_details) invalidSql = true;

          // Drill down
          if (Array.isArray(node)) node.forEach(visit);
          else Object.values(node).forEach(visit);
        };

        visit(data);
        return { charts, insights, invalidSql };
      }

      // Call n8n webhook with the exact question
      const data = await sendToN8N(prompt);
      console.log("Received n8n response:", data);

      const { charts, insights, invalidSql } = extractChartsAndInsights(data);

      console.log("Extracted - Charts:", charts.length, "Insights:", insights.length);

      if (invalidSql) {
        toast.error("Invalid SQL. Please try again.");
      }

      // If no visualizable data extracted, avoid false "no data" errors
      if (charts.length === 0 && insights.length === 0) {
        const nonEmpty = (() => {
          if (data == null) return false;
          if (Array.isArray(data)) return data.length > 0;
          if (typeof data === 'object') return Object.keys(data as any).length > 0;
          if (typeof data === 'string') return data.trim().length > 0;
          return true;
        })();
        if (!nonEmpty) {
          console.warn("No charts/insights and empty response from n8n");
          toast.error("No data returned from n8n. Please check your webhook configuration.");
        } else {
          console.info("Received response from n8n but no charts/insights parsed; proceeding without error.");
        }
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
