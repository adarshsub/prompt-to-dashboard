import { ChevronsRight, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartData, Insight } from "@/types/dashboard";
import { ChartRenderer } from "@/components/ChartRenderer";
import { InsightCard } from "@/components/InsightCard";

interface DashboardViewProps {
  title: string;
  onCollapse?: () => void;
  charts?: ChartData[];
  insights?: Insight[];
  onAskQuestion?: (question: string) => void;
}

export const DashboardView = ({ title, onCollapse, charts = [], insights = [], onAskQuestion }: DashboardViewProps) => {

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="h-8 w-8 text-[#797985] hover:text-white hover:bg-primary/40 transition-all rounded-lg"
          >
            <ChevronsRight className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2 pb-1 border-b-2 border-primary">
            <BarChart2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-card-foreground">{title}</span>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-9 rounded-[6px]">
          Save
        </Button>
      </div>

      <div className="flex-1 px-6 overflow-y-auto" style={{ maxHeight: '60%' }}>
        {charts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
            {charts.map((chart, index) => (
              <div 
                key={index}
                className={`min-h-[320px] ${chart.data.length > 4 ? 'md:col-span-2' : ''}`}
              >
                <ChartRenderer
                  chart={chart}
                  onAskQuestion={(q) => onAskQuestion?.(q)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl font-medium text-muted-foreground">
              Output of Visualizations
            </h2>
          </div>
        )}
      </div>

      <div className="px-6 pb-2 pt-8 shrink-0">
        <h3 className="text-sm font-semibold text-[#1B247E] bg-[#f7f7f7] py-1 px-6 -mx-6">Key Insights</h3>
      </div>

      <div className="px-6 pb-6 overflow-y-auto shrink-0" style={{ maxHeight: '30%' }}>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              index={index}
              onAskQuestion={(q) => onAskQuestion?.(q)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
