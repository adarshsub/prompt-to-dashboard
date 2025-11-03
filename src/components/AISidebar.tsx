import { X, Send, Loader2, BarChart3, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";
interface AISidebarProps {
  onSubmit?: (prompt: string) => void;
  isLoading?: boolean;
  showHistory?: boolean;
  userPrompt?: string;
}
const TEMPLATE_PROMPTS = {
  math: {
    performance: ["Show me all students below 70% in Math class.", "How does my Math class's average score compare to the school's average?", "Which Math topics had the lowest mastery rates?", "Which standards need review based on the data?"],
    engagement: ["Show student participation trends in Math.", "Which students need engagement support in Math?"]
  },
  english: {
    performance: ["Show me all students below 70% in English class.", "How does my English class's average score compare to the school's average?"],
    engagement: []
  }
};
export const AISidebar = ({
  onSubmit,
  isLoading = false,
  showHistory = false,
  userPrompt
}: AISidebarProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"performance" | "engagement">("performance");
  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]);
  };
  const handleRemoveSubject = (subject: string) => {
    setSelectedSubjects(prev => prev.filter(s => s !== subject));
  };
  const handlePromptClick = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };
  const handleSend = () => {
    if (prompt.trim() && onSubmit) {
      onSubmit(prompt);
    }
  };
  const getTemplatePrompts = () => {
    if (selectedSubjects.length === 0) return [];
    const subject = selectedSubjects[0].toLowerCase();
    return TEMPLATE_PROMPTS[subject as keyof typeof TEMPLATE_PROMPTS]?.[selectedCategory] || [];
  };
  const templatePrompts = getTemplatePrompts();
  return <div className="w-[280px] bg-sidebar rounded-2xl p-6 flex flex-col self-stretch">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-semibold bg-gradient-purple bg-clip-text text-transparent">
          Create with AI
        </h2>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {showHistory ? <>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor
          </p>

          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {userPrompt && <>
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-card-foreground">
                  {userPrompt}
                </div>
                <div className="text-xs text-muted-foreground text-right">09:23 am</div>
                
                {isLoading ? <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating response...
                  </div> : <>
                    <div className="font-semibold text-card-foreground text-sm mb-3">
                      Students Below 70% in Math
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-muted/60 rounded-lg aspect-[4/5]" />
                      <div className="space-y-2">
                        <div className="bg-muted/60 rounded-lg aspect-[4/3]" />
                        <div className="bg-muted/60 rounded-lg aspect-square" />
                        <div className="bg-muted/60 rounded-lg aspect-square" />
                      </div>
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
                  </>}
              </>}
          </div>
        </> : <>
          <p className="text-xs text-[#AC5CCC] mb-3.5 leading-relaxed">
            Enter your question about the data you'd like to visualize. Our AI will
            generate appropriate charts and insights based on your query.
          </p>
          <div className="h-px bg-[#E2E6E9] mb-6" />

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">
              Quick actions
            </h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Start with a template prompt for inspiration or use your own prompt below.
            </p>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Select dropdown(s) for template prompts.</p>

              <div className="space-y-2">
                {selectedSubjects.length > 0 && <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedSubjects.map(subject => <Badge key={subject} variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 pl-2.5 pr-1.5 py-1">
                        {subject}
                        <button onClick={() => handleRemoveSubject(subject)} className="ml-1.5 hover:bg-primary/30 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>)}
                  </div>}

                <Popover open={subjectsOpen} onOpenChange={setSubjectsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-card border-border text-card-foreground hover:bg-muted">
                      Subject
                      <ChevronDown className={cn("h-4 w-4 transition-transform", subjectsOpen && "rotate-180")} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[232px] p-3 bg-card border-border" align="start">
                    <div className="space-y-2">
                      {["All", "Math", "English"].map(subject => <div key={subject} className="flex items-center space-x-2">
                          <Checkbox id={subject} checked={selectedSubjects.includes(subject)} onCheckedChange={() => handleSubjectToggle(subject)} className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                          <label htmlFor={subject} className="text-sm text-card-foreground cursor-pointer flex-1">
                            {subject}
                          </label>
                        </div>)}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Button variant="outline" className="w-full justify-between bg-card border-border text-card-foreground hover:bg-muted" disabled={selectedSubjects.length === 0}>
                Term
                <ChevronDown className="h-4 w-4" />
              </Button>

              <Button variant="outline" className="w-full justify-between bg-card border-border text-card-foreground hover:bg-muted" disabled={selectedSubjects.length === 0}>
                Grade Level
                <ChevronDown className="h-4 w-4" />
              </Button>

              {selectedSubjects.length > 0 && <>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setSelectedCategory("performance")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors", selectedCategory === "performance" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                      Performance
                      <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px]", selectedCategory === "performance" ? "bg-primary-foreground/20" : "bg-background")}>
                        ○
                      </span>
                    </button>
                    <button onClick={() => setSelectedCategory("engagement")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors", selectedCategory === "engagement" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                      Engagement
                      <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px]", selectedCategory === "engagement" ? "bg-primary-foreground/20" : "bg-background")}>
                        ○
                      </span>
                    </button>
                  </div>

                  <div className="space-y-2 mt-3">
                    {templatePrompts.map((templatePrompt, index) => <button key={index} onClick={() => handlePromptClick(templatePrompt)} className={cn("w-full text-left p-3 rounded-lg border transition-colors text-sm flex items-start gap-2", prompt === templatePrompt ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-card/80")}>
                        <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-card-foreground leading-snug">{templatePrompt}</span>
                      </button>)}
                  </div>
                </>}
            </div>
          </div>
        </>}

      <div className="mt-auto">
        <div className="relative">
          <Textarea placeholder="What would you like to create?" value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }} disabled={isLoading} className="pr-10 bg-card border-border text-card-foreground placeholder:text-muted-foreground resize-none min-h-[88px]" rows={4} />
          <Button size="icon" onClick={handleSend} disabled={!prompt.trim() || isLoading} className="absolute right-1 bottom-1 h-8 w-8 bg-transparent hover:bg-muted text-muted-foreground hover:text-card-foreground disabled:opacity-50">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>;
};