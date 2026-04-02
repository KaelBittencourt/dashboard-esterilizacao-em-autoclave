
interface BarChartProps {
  data: { name: string; value: number }[];
  title: string;
  color?: string;
}

export function BarChartComponent({ data, title, color = "hsl(210 100% 56%)" }: BarChartProps) {
  // Encontrar o valor máximo para definir a proporção das barras (evitando divisão por zero)
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="gradient-card shadow-card rounded-lg border border-border p-5 flex flex-col h-full min-h-[350px]">
      <h3 className="text-sm font-semibold font-display text-foreground mb-4">{title}</h3>
      <div className="flex-1 flex flex-col justify-between gap-4">
        {data.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
            Nenhum dado disponível.
          </div>
        ) : (
          data.map((item, index) => {
            const percentage = (item.value / maxVal) * 100;
            return (
              <div key={`${item.name}-${index}`} className="flex flex-col gap-1.5 w-full">
                <div className="flex justify-between items-end text-sm w-full">
                  {/* Nome do item (truncate evita quebrar linha e sobrepor) */}
                  <span className="font-medium text-foreground truncate pr-4" title={item.name}>
                    {item.name}
                  </span>
                  {/* Valor exato no canto direito */}
                  <span className="text-xs font-semibold text-muted-foreground shrink-0">
                    {item.value.toLocaleString('pt-BR')} itens
                  </span>
                </div>
                {/* Linha da barra de progresso */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
