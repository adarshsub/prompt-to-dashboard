import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartData } from "@/types/dashboard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toTitleCase } from "@/lib/insightUtils";

interface ChartRendererProps {
  chart: ChartData;
  onAskQuestion: (question: string) => void;
}

// Use design system colors: blue accent, grays for secondary
const CHART_COLORS = {
  primary: "hsl(200, 100%, 50%)", // Blue accent (#00A6FF)
  secondary: "hsl(240, 5%, 50%)", // Muted-foreground from design system
  positive: "hsl(142, 76%, 36%)", // Green
  negative: "hsl(0, 84%, 60%)", // Red
  neutral: "hsl(240, 10%, 90%)", // Muted from design system
};

export const ChartRenderer = ({ chart, onAskQuestion }: ChartRendererProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    if (question.trim()) {
      onAskQuestion(question);
      setQuestion("");
      setIsOpen(false);
    }
  };

  // Determine bar color based on data (red for low values, green for high, blue default)
  const getBarColor = (value: number, dataKey: string) => {
    // If the chart is about students below a threshold, use red
    if (dataKey.toLowerCase().includes('below') || value < 70) {
      return CHART_COLORS.negative;
    }
    return CHART_COLORS.primary;
  };

  const chartTitle = chart.config?.title ? toTitleCase(chart.config.title) : '';

  const renderChart = () => {
    switch (chart.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart.data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.neutral} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke={CHART_COLORS.secondary}
                tick={{ fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke={CHART_COLORS.secondary} tick={{ fontSize: 12 }} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: `1px solid ${CHART_COLORS.neutral}`,
                  borderRadius: "6px"
                }}
                formatter={(value: any) => [`${value}%`, 'Score']}
                cursor={{ fill: 'transparent' }}
              />
              <Bar 
                dataKey="value" 
                fill={CHART_COLORS.primary} 
                maxBarSize={40}
                activeBar={{ fill: CHART_COLORS.primary, opacity: 0.7 }}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.neutral} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke={CHART_COLORS.secondary}
                tick={{ fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke={CHART_COLORS.secondary} tick={{ fontSize: 12 }} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: `1px solid ${CHART_COLORS.neutral}`,
                  borderRadius: "6px"
                }}
                formatter={(value: any) => [`${value}%`, 'Score']}
              />
              <Line type="monotone" dataKey="value" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ fill: CHART_COLORS.primary }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.value > 0 ? entry.name : null}
                outerRadius={80}
                fill={CHART_COLORS.primary}
                dataKey="value"
              >
                {chart.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? CHART_COLORS.primary : index === 1 ? CHART_COLORS.secondary : CHART_COLORS.neutral} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: `1px solid ${CHART_COLORS.neutral}`,
                  borderRadius: "6px"
                }}
                formatter={(value: any, name: any, props: any) => {
                  const label = props.payload.name;
                  if (label.includes('%')) {
                    return [`${value} students`, label];
                  }
                  return [value, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart.data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.neutral} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke={CHART_COLORS.secondary}
                tick={{ fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke={CHART_COLORS.secondary} tick={{ fontSize: 12 }} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: `1px solid ${CHART_COLORS.neutral}`,
                  borderRadius: "6px"
                }}
                formatter={(value: any) => [`${value}%`, 'Score']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_COLORS.primary} 
                fill={CHART_COLORS.primary} 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="text-muted-foreground">Unknown chart type</div>;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer hover:border-[#CD9DE0] rounded-lg transition-all p-4 bg-card border border-border h-full group">
          {chartTitle && (
            <h3 className="text-sm font-semibold text-card-foreground mb-3 text-center">{chartTitle}</h3>
          )}
          <div className="h-[calc(100%-2rem)]">
            {renderChart()}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 bg-card border-border" align="start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-card-foreground">Ask about this chart</p>
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
