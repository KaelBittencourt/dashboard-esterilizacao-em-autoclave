import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "primary" | "accent";
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: KPICardProps) {
  return (
    <div className="gradient-card shadow-kpi rounded-lg border border-border p-5 transition-all hover:shadow-glow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={`text-3xl font-bold font-display tracking-tight ${variant === "primary" ? "text-gradient-primary" :
              variant === "accent" ? "text-accent" : "text-foreground"
            }`}>
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${variant === "primary" ? "bg-primary/10" :
            variant === "accent" ? "bg-accent/10" : "bg-muted"
          }`}>
          <Icon className={`h-5 w-5 ${variant === "primary" ? "text-primary" :
              variant === "accent" ? "text-accent" : "text-muted-foreground"
            }`} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${trend.value >= 0 ? "text-accent" : "text-destructive"}`}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
