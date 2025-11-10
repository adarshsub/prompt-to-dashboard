import { ChartData } from "@/types/dashboard";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface MiniChartProps {
  chart: ChartData;
}

const COLORS = ["hsl(286, 50%, 58%)", "hsl(240, 5%, 50%)", "hsl(240, 10%, 90%)"];

export const MiniChart = ({ chart }: MiniChartProps) => {
  const renderChart = () => {
    switch (chart.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart.data}>
              <Bar dataKey="value" fill="hsl(286, 50%, 58%)" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.data}>
              <Line type="monotone" dataKey="value" stroke="hsl(286, 50%, 58%)" strokeWidth={1} dot={false} />
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
                outerRadius={20}
                fill="hsl(286, 50%, 58%)"
                dataKey="value"
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart.data}>
              <Area type="monotone" dataKey="value" stroke="hsl(286, 50%, 58%)" fill="hsl(286, 50%, 58%)" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return <div className="w-full h-full">{renderChart()}</div>;
};
