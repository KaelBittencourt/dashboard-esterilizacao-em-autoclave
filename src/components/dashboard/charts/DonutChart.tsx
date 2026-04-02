import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "hsl(210 100% 56%)",
  "hsl(172 66% 50%)",
  "hsl(28 100% 55%)",
  "hsl(265 85% 65%)",
  "hsl(350 80% 60%)",
  "hsl(142 70% 50%)",
];

interface DonutChartProps {
  data: { name: string; value: number }[];
  title: string;
}

export function DonutChart({ data, title }: DonutChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="gradient-card shadow-card rounded-lg border border-border p-5 flex flex-col h-full min-h-[350px]">
      <h3 className="text-sm font-semibold font-display text-foreground mb-4 shrink-0">{title}</h3>
      <div className="relative flex-1 w-full min-h-[300px]">
        {/* Texto central customizado para dar visual de Dashboard moderno */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-4 z-10">
          <span className="text-3xl font-bold font-display text-foreground leading-none">{total.toLocaleString('pt-BR')}</span>
          <span className="text-xs text-muted-foreground mt-1">Total de Itens</span>
        </div>

        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="48%"
                innerRadius="65%"
                outerRadius="85%"
                paddingAngle={5}
                cornerRadius={6}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220 18% 14%)",
                  border: "1px solid hsl(220 15% 18%)",
                  borderRadius: "8px",
                  color: "hsl(213 31% 91%)",
                  fontSize: 12,
                }}
                itemStyle={{ color: "hsl(213 31% 91%)", fontWeight: 500 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "hsl(215 20% 55%)", paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
