import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashboardView } from "@/components/DashboardView";
import { useState } from "react";

interface ResultsPanelProps {
  onSubmit?: (prompt: string) => void;
  isLoading?: boolean;
  userPrompt?: string;
  title?: string;
}

export const ResultsPanel = ({
  onSubmit,
  isLoading = false,
  userPrompt,
  title = "Students Below 70% in Math"
}: ResultsPanelProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSend = () => {
    if (prompt.trim() && onSubmit) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="flex-1 bg-sidebar rounded-2xl p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-semibold bg-gradient-purple bg-clip-text text-transparent">
          Create with AI
        </h2>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        Lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor
      </p>

      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {userPrompt && (
          <>
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-card-foreground">
              {userPrompt}
            </div>
            <div className="text-xs text-muted-foreground text-right">09:23 am</div>
            
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating response...
              </div>
            ) : (
              <>
                <div className="font-semibold text-card-foreground text-sm mb-3">
                  {title}
                </div>
                
                {/* Embedded Dashboard View */}
                <div className="bg-canvas rounded-xl p-4 -mx-2">
                  <DashboardView title={title} />
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-card-foreground text-sm mb-2">
                    Query Your Insights
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Ask questions about the insights generated for your dashboard.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs rounded-full border border-border bg-card text-card-foreground hover:bg-muted">
                      Insight 1 <span className="ml-1 text-muted-foreground">○</span>
                    </button>
                    <button className="px-3 py-1.5 text-xs rounded-full border border-border bg-card text-card-foreground hover:bg-muted">
                      Insight 2 <span className="ml-1 text-muted-foreground">○</span>
                    </button>
                    <button className="px-3 py-1.5 text-xs rounded-full border border-border bg-card text-card-foreground hover:bg-muted">
                      Insight 3
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="mt-auto">
        <div className="relative">
          <Textarea
            placeholder="What would you like to create?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            className="pr-10 bg-card border-border text-card-foreground placeholder:text-muted-foreground resize-none min-h-[88px]"
            rows={4}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!prompt.trim() || isLoading}
            className="absolute right-1 bottom-1 h-8 w-8 bg-transparent hover:bg-muted text-muted-foreground hover:text-card-foreground disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
