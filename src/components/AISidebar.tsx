import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const AISidebar = () => {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="w-[280px] bg-sidebar rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-semibold bg-gradient-purple bg-clip-text text-transparent">
          Create with AI
        </h2>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        Enter your question about the data you'd like to visualize. Our AI will
        generate appropriate charts and insights based on your query.
      </p>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">
          Quick actions
        </h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Start with a template prompt for inspiration or use your own prompt below.
        </p>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-2">
            Select dropdown(s) for template prompts
          </p>
          
          <Select>
            <SelectTrigger className="bg-card border-border text-card-foreground">
              <SelectValue placeholder="Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="history">History</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="bg-card border-border text-card-foreground">
              <SelectValue placeholder="Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="q1">Q1 2024</SelectItem>
              <SelectItem value="q2">Q2 2024</SelectItem>
              <SelectItem value="q3">Q3 2024</SelectItem>
              <SelectItem value="q4">Q4 2024</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="bg-card border-border text-card-foreground">
              <SelectValue placeholder="Grade Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="elementary">Elementary</SelectItem>
              <SelectItem value="middle">Middle School</SelectItem>
              <SelectItem value="high">High School</SelectItem>
              <SelectItem value="college">College</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-auto">
        <div className="relative">
          <Input
            placeholder="What would you like to create?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="pr-10 bg-card border-border text-card-foreground placeholder:text-muted-foreground"
          />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-transparent hover:bg-muted text-muted-foreground hover:text-card-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
