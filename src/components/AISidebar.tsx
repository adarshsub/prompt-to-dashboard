import { X, Send, Loader2, Sparkles, ChevronDown, Plus, Minus, ChevronsLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useRef, useEffect } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
interface AISidebarProps {
  onSubmit?: (prompt: string) => void;
  isLoading?: boolean;
  showHistory?: boolean;
  userPrompt?: string;
  isDashboardCollapsed?: boolean;
  onExpand?: () => void;
  submittedAt?: Date | null;
}
const TEMPLATE_PROMPTS = {
  math: {
    performance: ["Show me all students below 70% in Math class.", "How does my Math class's average score compare to the school's average?", "Which Math topics had the lowest mastery rates?", "Which standards need review based on the data?"],
    engagement: ["Show student participation trends in Math.", "Which students need engagement support in Math?"]
  },
  english: {
    performance: ["Show me all students below 70% in English class.", "How does my English class's average score compare to the school's average?"],
    engagement: []
  },
  science: {
    performance: ["Show me all students below 70% in Science class.", "How does my Science class's average score compare to the school's average?"],
    engagement: []
  },
  history: {
    performance: ["Show me all students below 70% in History class.", "How does my History class's average score compare to the school's average?"],
    engagement: []
  }
};
export const AISidebar = ({
  onSubmit,
  isLoading = false,
  showHistory = false,
  userPrompt,
  isDashboardCollapsed = false,
  onExpand,
  submittedAt
}: AISidebarProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [termsOpen, setTermsOpen] = useState(false);
  const [selectedGradeLevels, setSelectedGradeLevels] = useState<string[]>([]);
  const [gradeLevelsOpen, setGradeLevelsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"performance" | "engagement" | null>("performance");
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!submittedAt) return;
    if (!isLoading && scrollContainerRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    }
  }, [submittedAt, isLoading]);

  // Maintain scroll position at bottom when isDashboardCollapsed changes
  useEffect(() => {
    if (showHistory && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [isDashboardCollapsed, showHistory]);

  // After dashboard generation, ensure we scroll to the bottom
  useEffect(() => {
    if (showHistory && !isLoading && scrollContainerRef.current) {
      // next tick to allow DOM to paint
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          container.scrollTop = container.scrollHeight;
        }
      }, 0);
    }
  }, [showHistory, isLoading, userPrompt]);
  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => {
      if (subject === "All") {
        // If toggling "All", add or remove all subjects
        return prev.includes("All") ? [] : ["All", "Math", "English", "Science", "History"];
      } else {
        // If toggling individual subject, remove "All" if it was selected
        const newSubjects = prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev.filter(s => s !== "All"), subject];
        return newSubjects;
      }
    });
  };
  const handleRemoveSubject = (subject: string) => {
    setSelectedSubjects(prev => prev.filter(s => s !== subject));
  };
  const handleTermToggle = (term: string) => {
    setSelectedTerms(prev => prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]);
  };
  const handleRemoveTerm = (term: string) => {
    setSelectedTerms(prev => prev.filter(t => t !== term));
  };
  const handleGradeLevelToggle = (level: string) => {
    setSelectedGradeLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
  };
  const handleRemoveGradeLevel = (level: string) => {
    setSelectedGradeLevels(prev => prev.filter(l => l !== level));
  };
  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    setFiltersOpen(false);
  };
  const handlePromptClick = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };
  const handleInsightToggle = (insight: string, insightNumber: number) => {
    const wasSelected = selectedInsights.includes(insight);
    if (wasSelected) {
      // Remove from selection
      setSelectedInsights(prev => prev.filter(i => i !== insight));

      // Remove the corresponding text from prompt
      setPrompt(prev => {
        // Pattern to match "For Insight X, tell me ..." up to next "; " or end
        const pattern = new RegExp(`(^|; )For Insight ${insightNumber}, tell me[^;]*`, 'g');
        let updated = prev.replace(pattern, '');
        // Clean up leading/trailing semicolons and extra spaces
        updated = updated.replace(/^;\s*/, '').replace(/;\s*$/, '').trim();
        return updated;
      });
    } else {
      // Add to selection
      setSelectedInsights(prev => [...prev, insight]);

      // Append to prompt
      setPrompt(prev => {
        if (!prev.trim()) {
          return `For Insight ${insightNumber}, tell me `;
        } else {
          return `${prev.trim()}; For Insight ${insightNumber}, tell me `;
        }
      });
    }
  };
  const handleSend = () => {
    if (prompt.trim() && onSubmit) {
      onSubmit(prompt);
    }
  };
  const getTemplatePrompts = () => {
    if (selectedSubjects.length === 0 || !selectedCategory) return [];

    // If "All" is selected, combine all subject prompts
    if (selectedSubjects.includes("All")) {
      const mathPrompts = TEMPLATE_PROMPTS.math[selectedCategory] || [];
      const englishPrompts = TEMPLATE_PROMPTS.english[selectedCategory] || [];
      const sciencePrompts = TEMPLATE_PROMPTS.science[selectedCategory] || [];
      const historyPrompts = TEMPLATE_PROMPTS.history[selectedCategory] || [];
      return [...mathPrompts, ...englishPrompts, ...sciencePrompts, ...historyPrompts];
    }

    // Combine prompts for all selected subjects
    const allPrompts = selectedSubjects.flatMap(subject => {
      const subjectKey = subject.toLowerCase();
      return TEMPLATE_PROMPTS[subjectKey as keyof typeof TEMPLATE_PROMPTS]?.[selectedCategory] || [];
    });
    return allPrompts;
  };
  const templatePrompts = getTemplatePrompts();
  return <div className={cn("w-[280px] bg-sidebar rounded-2xl flex flex-col overflow-hidden shrink-0 min-h-0", showHistory ? "pb-0 pr-1.5 pl-6 pt-6" : "p-6")}>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-semibold bg-gradient-purple bg-clip-text text-transparent">
          Create with AI
        </h2>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2 text-muted-foreground hover:text-white hover:bg-[#c69fdc]/75 transition-all">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {showHistory ? <>
          <p className="text-xs text-[#AC5CCC] mb-3.5 leading-relaxed">Enter a question about the data you'd like to visualize. Our AI will generate appropriate charts and insights.</p>
          <div className="h-px bg-[#E2E6E9] mb-6" />

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mb-3.5 pr-2 space-y-4" style={{
        scrollbarGutter: "stable"
      }}>
            {userPrompt && <>
                <div className="space-y-[4px]">
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-card-foreground ml-4">
                    {userPrompt}
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {submittedAt ? submittedAt.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : '09:23 am'}
                  </div>
                </div>
                
                {isLoading ? <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating response...
                  </div> : <>
                    <div className="space-y-[4px]">
                      <div className="bg-[#D9F2FF] rounded-lg p-3 mr-4">
                        <div className="font-semibold text-card-foreground text-sm mb-1">
                          Students Below 70% in Math
                        </div>
                        <div className={`grid grid-cols-2 gap-2 scale-y-[0.85] ${isDashboardCollapsed ? 'mb-1.5' : 'mb-0'}`}>
                          <div className="bg-white rounded-lg h-full" />
                          <div className="space-y-2">
                            <div className="bg-white rounded-lg aspect-[4/3]" />
                            <div className="bg-white rounded-lg aspect-square" />
                            
                          </div>
                        </div>
                        {isDashboardCollapsed && <Button variant="ghost" size="sm" onClick={onExpand} className="w-full justify-start gap-2 text-card-foreground bg-white/50 hover:bg-white/90 hover:text-[#2e2e37] h-8">
                            <ChevronsLeft className="h-4 w-4" />
                            <span className="text-xs">Expand Dashboard</span>
                          </Button>}
                      </div>
                      <div className="text-xs text-muted-foreground text-left pl-4">
                        {submittedAt ? new Date(submittedAt.getTime() + 2000).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) : '09:23 am'}
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 ref={headingRef} className="font-semibold text-card-foreground text-sm mb-2">
                        Query Your Insights
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        Ask questions about the insights generated for your dashboard.
                      </p>
                      <div className="flex gap-2 overflow-x-auto flex-nowrap pb-1">
                        <button onClick={() => handleInsightToggle("insight1", 1)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap flex-shrink-0 border", selectedInsights.includes("insight1") ? "bg-primary text-primary-foreground border-primary" : "bg-white text-black border-[#E2E6E9]")}>
                          Insight 1
                          <span className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", selectedInsights.includes("insight1") ? "bg-white/20" : "bg-[#E2E6E9]")}>
                            {selectedInsights.includes("insight1") ? <Minus className="h-2.5 w-2.5" color="#FFFFFF" strokeWidth={2.5} /> : <Plus className="h-2.5 w-2.5" color="#FFFFFF" strokeWidth={2.5} />}
                          </span>
                        </button>
                        <button onClick={() => handleInsightToggle("insight2", 2)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap flex-shrink-0 border", selectedInsights.includes("insight2") ? "bg-primary text-primary-foreground border-primary" : "bg-white text-black border-[#E2E6E9]")}>
                          Insight 2
                          <span className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", selectedInsights.includes("insight2") ? "bg-white/20" : "bg-[#E2E6E9]")}>
                            {selectedInsights.includes("insight2") ? <Minus className="h-2.5 w-2.5" color="#FFFFFF" strokeWidth={2.5} /> : <Plus className="h-2.5 w-2.5" color="#FFFFFF" strokeWidth={2.5} />}
                          </span>
                        </button>
                        <button onClick={() => handleInsightToggle("insight3", 3)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap flex-shrink-0 border", selectedInsights.includes("insight3") ? "bg-primary text-primary-foreground border-primary" : "bg-white text-black border-[#E2E6E9]")}>
                          Insight 3
                          <span className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", selectedInsights.includes("insight3") ? "bg-white/20" : "bg-[#E2E6E9]")}>
                            {selectedInsights.includes("insight3") ? <Minus className="h-2.5 w-2.5" color="#FFFFFF" strokeWidth={2.5} /> : <Plus className="h-2.5 w-2.5" color="#FFFFFF" strokeWidth={2.5} />}
                          </span>
                        </button>
                      </div>
                    </div>
                  </>}
              </>}
          </div>
        </> : <>
          <p className="text-xs text-[#AC5CCC] mb-3.5 leading-relaxed">Enter a question about the data you'd like to visualize. Our AI will generate appropriate charts and insights.</p>
          <div className="h-px bg-[#E2E6E9] mb-6" />

          <div className={cn("flex-1 overflow-y-auto mb-3.5 pr-2", selectedSubjects.length > 0 && "max-h-[400px]")} style={{
        scrollbarGutter: "stable"
      }}>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">
              Quick actions
            </h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Start by filtering for a template prompt or write your own prompt below.</p>

            <div className="space-y-[7.8px]">
              <div className="space-y-2">
                <Popover open={subjectsOpen} onOpenChange={setSubjectsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between items-center bg-card border-border text-card-foreground hover:bg-white hover:border-[#c69fdc] transition-all min-h-10 py-1.5 rounded-full text-sm">

                      {selectedSubjects.length > 0 ? <div className="flex flex-wrap items-center gap-1 flex-1 mr-2 min-h-0">
                          {(selectedSubjects.includes("All") ? ["All"] : selectedSubjects).map(subject => <Badge key={subject} variant="secondary" className="pl-2 pr-1 py-0.5 text-xs h-6" style={{
                      backgroundColor: '#EBF8FF',
                      color: '#00A6FF',
                      borderColor: '#00A6FF',
                      borderWidth: '1px'
                    }}>
                              {subject}
                              <button onClick={e => {
                        e.stopPropagation();
                        handleRemoveSubject(subject);
                      }} className="ml-1 hover:bg-[#00A6FF]/30 rounded-full p-0.5">
                                <X className="h-2.5 w-2.5" style={{
                          color: '#00A6FF'
                        }} />
                              </button>
                            </Badge>)}
                        </div> : <span style={{
                    color: '#6F8090'
                  }}>Subjects</span>}
                      <div className="self-center flex-shrink-0">
                        <ChevronDown className={cn("h-4 w-4 transition-transform text-[#2e2e37]", subjectsOpen && "rotate-180")} />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[232px] p-3 bg-card border-border" align="start">
                    <div className="space-y-2">
                      {["All", "Math", "English", "Science", "History"].map(subject => <div key={subject} className="flex items-center space-x-2">
                          <Checkbox id={subject} checked={selectedSubjects.includes("All") || selectedSubjects.includes(subject)} onCheckedChange={() => handleSubjectToggle(subject)} />
                          <label htmlFor={subject} className="text-sm text-card-foreground cursor-pointer flex-1">
                            {subject}
                          </label>
                        </div>)}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="justify-center gap-2 text-[#AC5CCC] hover:text-[#AC5CCC] hover:bg-[#c69fdc]/10 transition-all text-xs font-medium h-8 px-3">
                    <Plus className="h-4 w-4" />
                    <span>More filters</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[232px] p-3 bg-card border-border" align="start">
                  <div className="space-y-2">
                    {["Terms", "Grade Levels"].map(filter => <div key={filter} className="flex items-center space-x-2">
                        <Checkbox id={filter} checked={activeFilters.includes(filter)} onCheckedChange={() => handleFilterToggle(filter)} className="border-[#AC5CCC] data-[state=checked]:bg-[#AC5CCC] data-[state=checked]:border-[#AC5CCC]" />
                        <label htmlFor={filter} className="text-sm text-card-foreground cursor-pointer flex-1">
                          {filter}
                        </label>
                      </div>)}
                  </div>
                </PopoverContent>
              </Popover>

              {activeFilters.includes("Terms") && <div className="space-y-2">
                  {selectedTerms.length > 0 && <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedTerms.map(term => <Badge key={term} variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 pl-2.5 pr-1.5 py-1">
                        {term}
                        <button onClick={() => handleRemoveTerm(term)} className="ml-1.5 hover:bg-primary/30 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>)}
                  </div>}

                <Popover open={termsOpen} onOpenChange={setTermsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-card border-border text-card-foreground hover:bg-white hover:border-[#c69fdc] transition-all rounded-full text-sm">
                      <span style={{
                    color: '#6F8090'
                  }}>Terms</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform text-[#2e2e37]", termsOpen && "rotate-180")} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[232px] p-3 bg-card border-border" align="start">
                    <div className="space-y-2">
                      {["Fall 2025", "Spring 2025", "Fall 2024", "Spring 2024"].map(term => <div key={term} className="flex items-center space-x-2">
                          <Checkbox id={term} checked={selectedTerms.includes(term)} onCheckedChange={() => handleTermToggle(term)} />
                          <label htmlFor={term} className="text-sm text-card-foreground cursor-pointer flex-1">
                            {term}
                          </label>
                        </div>)}
                    </div>
                  </PopoverContent>
                </Popover>
                </div>}

              {activeFilters.includes("Grade Levels") && <div className="space-y-2">
                {selectedGradeLevels.length > 0 && <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedGradeLevels.map(level => <Badge key={level} variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 pl-2.5 pr-1.5 py-1">
                        {level}
                        <button onClick={() => handleRemoveGradeLevel(level)} className="ml-1.5 hover:bg-primary/30 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>)}
                  </div>}

                <Popover open={gradeLevelsOpen} onOpenChange={setGradeLevelsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-card border-border text-card-foreground hover:bg-white hover:border-[#c69fdc] transition-all rounded-full text-sm">
                      <span style={{
                    color: '#6F8090'
                  }}>Grade Levels</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform text-[#2e2e37]", gradeLevelsOpen && "rotate-180")} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[232px] p-3 bg-card border-border" align="start">
                    <div className="space-y-2">
                      {["9th Grade", "10th Grade", "11th Grade", "12th Grade"].map(level => <div key={level} className="flex items-center space-x-2">
                          <Checkbox id={level} checked={selectedGradeLevels.includes(level)} onCheckedChange={() => handleGradeLevelToggle(level)} />
                          <label htmlFor={level} className="text-sm text-card-foreground cursor-pointer flex-1">
                            {level}
                          </label>
                        </div>)}
                    </div>
                  </PopoverContent>
                </Popover>
                </div>}


              {selectedSubjects.length > 0 && <>
                  <div className="flex gap-2 mt-4 pt-2 overflow-x-auto flex-nowrap pb-1">
                    <button onClick={() => setSelectedCategory(prev => prev === "performance" ? null : "performance")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap flex-shrink-0 border", selectedCategory === "performance" ? "bg-primary text-primary-foreground border-primary" : "bg-white text-black border-[#E2E6E9]")}>
                      Performance
                      <span className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", selectedCategory === "performance" ? "bg-white/20" : "bg-[#E2E6E9]")}>
                        {selectedCategory === "performance" ? <Minus className="h-2.5 w-2.5" color="#FFFFFF" strokeWidth={2.5} /> : <Plus className="h-2.5 w-2.5" color="#FFFFFF" strokeWidth={2.5} />}
                      </span>
                    </button>
                    <button onClick={() => setSelectedCategory(prev => prev === "engagement" ? null : "engagement")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap flex-shrink-0 border", selectedCategory === "engagement" ? "bg-primary text-primary-foreground border-primary" : "bg-white text-black border-[#E2E6E9]")}>
                      Engagement
                      <span className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", selectedCategory === "engagement" ? "bg-white/20" : "bg-[#E2E6E9]")}>
                        {selectedCategory === "engagement" ? <Minus className="h-2.5 w-2.5" color="#FFFFFF" strokeWidth={2.5} /> : <Plus className="h-2.5 w-2.5" color="#FFFFFF" strokeWidth={2.5} />}
                      </span>
                    </button>
                  </div>

                  {selectedCategory && <div className="space-y-2 mt-2">
                    {templatePrompts.map((templatePrompt, index) => {
                const showMultipleSubjects = selectedSubjects.includes("All") || selectedSubjects.length > 1;

                // Detect which subject is in this specific prompt
                const promptSubject = templatePrompt.includes("Math") ? "Math" : templatePrompt.includes("English") ? "English" : templatePrompt.includes("Science") ? "Science" : "History";

                // Build display subject text
                let displaySubject = promptSubject;
                if (showMultipleSubjects) {
                  const activeSubjects = selectedSubjects.includes("All") ? ["Math", "English", "Science", "History"] : selectedSubjects.filter(s => s !== "All");

                  // Format with commas and "and"
                  if (activeSubjects.length === 2) {
                    displaySubject = activeSubjects.join(" and ");
                  } else if (activeSubjects.length > 2) {
                    displaySubject = activeSubjects.slice(0, -1).join(", ") + ", and " + activeSubjects[activeSubjects.length - 1];
                  }
                }

                // Adjust grammar for multiple subjects
                let adjustedPrompt = templatePrompt;
                if (showMultipleSubjects) {
                  adjustedPrompt = adjustedPrompt.replace(`${promptSubject} class.`, `${promptSubject} classes.`).replace(`${promptSubject} class's`, `${promptSubject} classes'`).replace("does my", "do my").replace("score compare", "scores compare");
                }
                const parts = adjustedPrompt.split(promptSubject);
                return <button key={index} onClick={() => handlePromptClick(adjustedPrompt)} className={cn("w-full text-left p-3 rounded-lg border transition-colors text-xs flex items-center gap-2", prompt === adjustedPrompt ? "border-primary bg-primary/5" : "border-border bg-card hover:border-[#c69fdc] hover:bg-card/80")}>
                          <Sparkles className="h-4 w-4 flex-shrink-0" color="#323232" />
                          <span className="text-card-foreground leading-snug px-0.5">
                            {parts.map((part, i) => <React.Fragment key={i}>
                                {part}
                                {i < parts.length - 1 && <strong>{displaySubject}</strong>}
                              </React.Fragment>)}
                          </span>
                        </button>;
              })}
                  </div>}
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
        }} disabled={isLoading} className="pr-10 bg-card border-border text-card-foreground placeholder:text-muted-foreground resize-none h-[88px] min-h-[88px] max-h-[88px] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#c69fdc]" rows={4} />
          <Button size="icon" onClick={handleSend} disabled={!prompt.trim() || isLoading} className="absolute right-1 bottom-1 h-8 w-8 bg-transparent hover:bg-muted text-muted-foreground hover:text-card-foreground disabled:opacity-50">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>;
};