import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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

function formatPercent(value: number, total: number) {
  if (total <= 0) return "0%";
  return `${((value / total) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export function DonutChart({ data, title }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const active = activeIndex != null ? data[activeIndex] : null;

  return (
    <div className="gradient-card shadow-card rounded-lg border border-border p-5 flex flex-col h-full min-h-[350px]">
      <h3 className="text-sm font-semibold font-display text-foreground mb-2 shrink-0">{title}</h3>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <div className="relative h-[220px] w-[220px] shrink-0">
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="flex w-[108px] flex-col items-center text-center">
              {active ? (
                <>
                  <span className="text-[11px] leading-tight text-muted-foreground line-clamp-2">{active.name}</span>
                  <span className="mt-1 text-2xl font-bold font-display leading-none text-foreground">
                    {active.value.toLocaleString("pt-BR")}
                  </span>
                  <span
                    className="mt-1 text-xs font-semibold tabular-nums"
                    style={{ color: COLORS[activeIndex! % COLORS.length] }}
                  >
                    {formatPercent(active.value, total)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold font-display leading-none text-foreground">
                    {total.toLocaleString("pt-BR")}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">Total de Itens</span>
                </>
              )}
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={3}
                cornerRadius={6}
                dataKey="value"
                stroke="none"
                isAnimationActive={false}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={activeIndex == null || activeIndex === index ? 1 : 0.35}
                    style={{ cursor: "pointer", outline: "none" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex w-full max-w-[280px] flex-col gap-1">
          {data.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <li key={item.name}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
                    isActive ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(index)}
                  onBlur={() => setActiveIndex(null)}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.name}</span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold tabular-nums text-foreground">
                      {item.value.toLocaleString("pt-BR")}
                    </span>
                    <span className="block text-[11px] tabular-nums text-muted-foreground">
                      {formatPercent(item.value, total)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
