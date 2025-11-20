import { AISidebar } from "@/components/AISidebar";
import { DashboardView } from "@/components/DashboardView";
import { useState, useEffect } from "react";
import { generateDashboardTitle } from "@/lib/promptUtils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { sendToN8N } from "@/lib/n8nApi";
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
    
    // Clear previous data to ensure fresh results
    setCurrentCharts([]);
    setCurrentInsights([]);
    
    // Reference to clear prompt in sidebar
    const clearPromptRef = { shouldClear: false };

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

              // Helper to decode Plotly typed arrays like { dtype: 'i2'|'i4'|'f4'|'f8'|'u1', bdata: '...' }
              const decodeBData = (val: any): number[] | null => {
                try {
                  if (!val || typeof val !== 'object' || typeof val.bdata !== 'string') return null;
                  const base64 = val.bdata as string;
                  const dtype = String(val.dtype || '').toLowerCase();
                  const binary = atob(base64);
                  const bytes = new Uint8Array(binary.length);
                  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
                  switch (dtype) {
                    case 'i2':
                      return Array.from(new Int16Array(buf));
                    case 'i4':
                      return Array.from(new Int32Array(buf));
                    case 'f4':
                      return Array.from(new Float32Array(buf));
                    case 'f8':
                      return Array.from(new Float64Array(buf));
                    case 'u1':
                      return Array.from(new Uint8Array(buf));
                    default:
                      return null;
                  }
                } catch (err) {
                  console.warn('Failed to decode Plotly typed array', err);
                  return null;
                }
              };

              const asArray = (val: any): any[] => {
                if (Array.isArray(val)) return val;
                const decoded = decodeBData(val);
                return decoded ?? [];
              };

               const traces = Array.isArray(fig?.data) ? fig.data : [];
                if (traces.length) {
                  let type: ChartData['type'] = 'bar';
                  const items: any[] = [];
                  
                  // Detect multi-series bar/line charts
                  const barLineTraces = traces.filter(t => t && ['bar', 'line', 'area', 'scatter'].includes(t.type));
                  const isMultiSeries = barLineTraces.length > 1;
                  
                  if (isMultiSeries) {
                    // Handle multi-series: merge traces into single data points with multiple series
                    type = barLineTraces[0].type === 'line' ? 'line' : barLineTraces[0].type === 'area' ? 'area' : 'bar';
                    const dataMap = new Map<string, any>();
                    
                    barLineTraces.forEach(trace => {
                      const xArr = asArray(trace.x);
                      let yArr = asArray(trace.y);
                      if (yArr.length === 0 && trace.marker?.color) yArr = asArray(trace.marker.color);
                      const seriesName = trace.name || 'value';
                      
                      for (let i = 0; i < Math.min(xArr.length, yArr.length); i++) {
                        const name = String(xArr[i]);
                        if (name === '--') continue;
                        
                        if (!dataMap.has(name)) {
                          dataMap.set(name, { name });
                        }
                        const value = Number(yArr[i]);
                        dataMap.get(name)[seriesName] = Number(value.toFixed(2));
                      }
                    });
                    
                    const multiSeriesData = Array.from(dataMap.values());
                    if (multiSeriesData.length > 0) {
                      charts.push({ 
                        type, 
                        data: multiSeriesData, 
                        config: { 
                          title: fig?.layout?.title?.text,
                          series: barLineTraces.map(t => t.name || 'value')
                        } 
                      });
                    }
                  } else {
                    // Single-series: use existing logic
                    const processTrace = (trace: any) => {
                      if (!trace) return;
    
                       // Handle table type (convert to bar chart)
                       if (trace.type === 'table') {
                         if (trace.cells?.values && Array.isArray(trace.cells.values)) {
                           const columns = trace.cells.values;
                           
                           // First column is always names/labels
                           const nameColumn = Array.isArray(columns[0]) ? columns[0] : asArray(columns[0]);
                           
                           // Find the first numeric column (skip column 0)
                           let valueColumn = null;
                           for (let colIdx = 1; colIdx < columns.length; colIdx++) {
                             const col = Array.isArray(columns[colIdx]) ? columns[colIdx] : asArray(columns[colIdx]);
                             // Check if column contains numeric values
                             const hasNumericValues = col.some(val => !Number.isNaN(Number(val)));
                             if (hasNumericValues) {
                               valueColumn = col;
                               break;
                             }
                           }
                           
                           // If we found a numeric column, extract the data
                           if (valueColumn) {
                             for (let i = 0; i < Math.min(nameColumn.length, valueColumn.length); i++) {
                               const name = String(nameColumn[i] ?? '').trim();
                               const v = Number(valueColumn[i]);
                               // Filter out entries with "--" as x-value
                               if (name && name !== '--' && !Number.isNaN(v)) {
                                 items.push({ name, value: Number(v.toFixed(2)) });
                               }
                             }
                           }
                         }
                         return;
                       }
    
                      // Handle scatter type (can be line or area)
                      if (trace.type === 'scatter') {
                        if (trace.fill) type = 'area';
                        else if (trace.mode?.includes('lines')) type = 'line';
                        const xArr = asArray(trace.x);
                        let yArr = asArray(trace.y);
                        if (yArr.length === 0 && trace.marker?.color) yArr = asArray(trace.marker.color); // fallback
                        for (let i = 0; i < Math.min(xArr.length, yArr.length); i++) {
                          const name = String(xArr[i]);
                          const value = Number(yArr[i]);
                          // Filter out entries with "--" as x-value
                          if (name !== '--') {
                            items.push({ name, value: Number(value.toFixed(2)) });
                          }
                        }
                        return;
                      }
    
                       // Handle pie chart
                       if (trace.type === 'pie') {
                         type = 'pie';
                         const labels = asArray(trace.labels);
                         const values = asArray(trace.values);
                         for (let i = 0; i < Math.min(labels.length, values.length); i++) {
                           const name = String(labels[i]);
                           const value = Number(values[i]);
                           // Filter out entries with "--" as x-value
                           if (name !== '--') {
                             items.push({ name, value: Number(value.toFixed(2)) });
                           }
                         }
                         return;
                       }
  
                       // Handle histogram (convert to bar chart with frequency count)
                       if (trace.type === 'histogram') {
                         type = 'bar';
                         const xArr = asArray(trace.x);
                         
                         // Create frequency map
                         const frequencyMap = new Map<string, number>();
                         xArr.forEach(val => {
                           const key = String(val);
                           if (key !== '--') {
                             frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
                           }
                         });
                         
                         // Convert to chart items
                         frequencyMap.forEach((count, bin) => {
                           items.push({ name: bin, value: count });
                         });
                         
                         return;
                       }
  
                       // Handle bar and line/area fallbacks
                      if (trace.type === 'line') type = 'line';
                      else if (trace.type === 'area') type = 'area';
                      const xArr = asArray(trace.x);
                      let yArr = asArray(trace.y);
                      if (yArr.length === 0 && trace.marker?.color) yArr = asArray(trace.marker.color); // fallback when y is encoded in marker.color
                      for (let i = 0; i < Math.min(xArr.length, yArr.length); i++) {
                        const name = String(xArr[i]);
                        const value = Number(yArr[i]);
                        // Filter out entries with "--" as x-value
                        if (name !== '--') {
                          items.push({ name, value: Number(value.toFixed(2)) });
                        }
                      }
                    };
    
                    // Process all traces
                    traces.forEach(processTrace);
    
                    // Only add chart if we have valid data
                    if (items.length > 0) {
                      charts.push({ type, data: items, config: { title: fig?.layout?.title?.text } });
                    }
                  }
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

      // Mark the conversation as loaded with the data
      setConversationHistory((prev) =>
        prev.map((conv, idx) =>
          idx === prev.length - 1 ? { ...conv, isLoaded: true, charts, insights } : conv
        )
      );
      
      // Signal that prompt should be cleared
      clearPromptRef.shouldClear = true;
      
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
    
    return clearPromptRef.shouldClear;
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
