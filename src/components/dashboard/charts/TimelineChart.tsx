import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TimelineChartProps {
  data: { date: string; total: number;[key: string]: any }[];
  lines?: { key: string; color: string; name: string }[];
  title: string;
}

export function TimelineChart({ data, lines, title }: TimelineChartProps) {
  const defaultLines = [{ key: "total", color: "hsl(210 100% 56%)", name: "Total" }];
  const chartLines = lines || defaultLines;

  return (
    <div className="gradient-card shadow-card rounded-lg border border-border p-5">
      <h3 className="text-sm font-semibold font-display text-foreground mb-4 shrink-0">{title}</h3>
      <div className="w-full">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {chartLines.map((l) => (
                <linearGradient key={`gradient-${l.key}`} id={`gradient-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={l.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={l.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              tickMargin={12}
            />
            <YAxis
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickMargin={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 18% 14%)",
                border: "1px solid hsl(220 15% 18%)",
                borderRadius: "8px",
                color: "hsl(213 31% 91%)",
                fontSize: 12,
              }}
              itemStyle={{ fontSize: 12, fontWeight: 500 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "hsl(215 20% 55%)", paddingTop: "10px" }} />
            {chartLines.map((l) => (
              <Area
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={l.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#gradient-${l.key})`}
                activeDot={{ r: 5, fill: l.color, stroke: "hsl(220 18% 14%)", strokeWidth: 2 }}
                name={l.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
