import { ChevronsRight, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DashboardViewProps {
  title: string;
  onCollapse?: () => void;
}

const INSIGHTS = [
  "Lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor",
  "Lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor",
  "Lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor",
];

export const DashboardView = ({ title, onCollapse }: DashboardViewProps) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="h-8 w-8 text-[#797985] hover:text-white hover:bg-[#AC5CCC]/75 transition-all rounded-lg"
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

      <div className="flex-1 flex items-center justify-center px-6 overflow-y-auto">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-muted-foreground">
            Output of Visualizations
          </h2>
        </div>
      </div>

      <div className="px-6 pb-2 shrink-0">
        <h3 className="text-sm font-semibold text-[#1B247E] bg-[#f7f7f7] py-1 px-6 -mx-6">Key Insights</h3>
      </div>

      <div className="px-6 pb-6 overflow-y-auto max-h-[40%] shrink-0">
        <div className="space-y-3">
          {INSIGHTS.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-4 py-4 px-6 bg-card rounded-lg border border-border"
            >
              <div className="flex items-start gap-2 flex-1">
                <div className="flex items-start gap-2 text-card-foreground">
                  <span className="font-semibold">{index + 1}.</span>
                  <span className="text-sm leading-relaxed px-2">{insight}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary shrink-0 bg-white rounded-[5px] text-xs h-8 px-3"
              >
                Generate Intervention
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
