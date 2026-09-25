import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardHeader({ onRefresh, isRefreshing }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border w-full">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
              Esterilização em Autoclave
            </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Dashboard Analítico
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
        </div>
      </div>
    </header>
  );
}
