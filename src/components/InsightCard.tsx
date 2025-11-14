import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Insight } from "@/types/dashboard";
import { formatInsightText } from "@/lib/insightUtils";

interface InsightCardProps {
  insight: Insight;
  index: number;
  onAskQuestion: (question: string) => void;
}

export const InsightCard = ({ insight, index, onAskQuestion }: InsightCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const handleSubmit = () => {
    if (question.trim()) {
      onAskQuestion(question);
      setQuestion("");
      setIsOpen(false);
    }
  };

  const formattedText = formatInsightText(insight.text);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div 
          className="flex items-center gap-3 py-4 px-6 bg-card rounded-lg border border-border cursor-pointer hover:border-[#CD9DE0] transition-all"
          onClick={(e) => { 
            const rect = e.currentTarget.getBoundingClientRect();
            setPos({ x: rect.left, y: rect.top }); 
            setIsOpen(true); 
          }}
        >
          
          <span className="text-sm font-semibold text-card-foreground">{index + 1}.</span>
          <span className="text-xs leading-relaxed text-card-foreground flex-1">{formattedText}</span>
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary shrink-0 bg-white rounded-[5px] text-xs h-8 px-3"
            onClick={(e) => {
              e.stopPropagation();
              // Handle intervention generation
            }}
          >
            Generate Intervention
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 bg-card border-border" align="start" forceMount style={{ position: 'fixed', left: pos?.x ?? 0, top: pos?.y ?? 0, transform: 'none' }}>
        <div className="space-y-2">
          <p className="text-sm font-medium text-card-foreground">Ask about this insight</p>
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question..."
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 bg-white"
            />
            <Button onClick={handleSubmit} size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
