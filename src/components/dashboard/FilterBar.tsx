import { CalendarIcon, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MONTHS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Fev" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Abr" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Ago" },
  { value: 9, label: "Set" },
  { value: 10, label: "Out" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dez" },
];

interface FilterBarProps {
  availableYears: number[];
  selectedYears: number[];
  onSelectedYearsChange: (years: number[]) => void;
  selectedMonths: number[];
  onSelectedMonthsChange: (months: number[]) => void;
  materialFilter: string;
  onMaterialFilterChange: (v: string) => void;
  sectorFilter: string;
  onSectorFilterChange: (v: string) => void;
  materials: string[];
  sectors: string[];
}

function toggleValue(values: number[], value: number): number[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value].sort((a, b) => a - b);
}

function selectionLabel(labels: string[], empty: string, plural: string) {
  if (labels.length === 0) return empty;
  if (labels.length <= 3) return labels.join(", ");
  return `${labels.length} ${plural}`;
}

export function FilterBar({
  availableYears,
  selectedYears,
  onSelectedYearsChange,
  selectedMonths,
  onSelectedMonthsChange,
  materialFilter,
  onMaterialFilterChange,
  sectorFilter,
  onSectorFilterChange,
  materials,
  sectors,
}: FilterBarProps) {
  const latestYear = availableYears[0];
  const yearIsDefault =
    latestYear != null && selectedYears.length === 1 && selectedYears[0] === latestYear;
  const hasFilters =
    !yearIsDefault || selectedMonths.length > 0 || materialFilter !== "all" || sectorFilter !== "all";

  const yearLabels = [...selectedYears]
    .sort((a, b) => b - a)
    .map(String);
  const monthLabels = MONTHS.filter((m) => selectedMonths.includes(m.value)).map((m) => m.label);

  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[168px] justify-start text-left font-normal bg-muted border-border",
              selectedYears.length === 0 && "text-muted-foreground",
            )}
            title={yearLabels.join(", ") || "Todos os anos"}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{selectionLabel(yearLabels, "Todos os anos", "anos")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-3 bg-popover border-border" align="start">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Anos</p>
            {selectedYears.length > 0 && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onSelectedYearsChange([])}
              >
                Limpar
              </button>
            )}
          </div>
          <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {availableYears.length === 0 && (
              <p className="px-2 py-3 text-xs text-muted-foreground">Nenhum ano disponível</p>
            )}
            {availableYears.map((year) => {
              const active = selectedYears.includes(year);
              return (
                <button
                  key={year}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectedYearsChange(toggleValue(selectedYears, year))}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-left text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[190px] justify-start text-left font-normal bg-muted border-border",
              selectedMonths.length === 0 && "text-muted-foreground",
            )}
            title={monthLabels.join(", ") || "Todos os meses"}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{selectionLabel(monthLabels, "Todos os meses", "meses")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[248px] p-3 bg-popover border-border" align="start">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Meses</p>
            {selectedMonths.length > 0 && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onSelectedMonthsChange([])}
              >
                Limpar
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {MONTHS.map((month) => {
              const active = selectedMonths.includes(month.value);
              return (
                <button
                  key={month.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectedMonthsChange(toggleValue(selectedMonths, month.value))}
                  className={cn(
                    "rounded-md border px-1 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {month.label}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <Select value={materialFilter} onValueChange={onMaterialFilterChange}>
        <SelectTrigger className="w-[200px] bg-muted border-border text-foreground">
          <SelectValue placeholder="Material / Tecido" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-60">
          <SelectItem value="all">Todos</SelectItem>
          {materials.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sectorFilter} onValueChange={onSectorFilterChange}>
        <SelectTrigger className="w-[180px] bg-muted border-border text-foreground">
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">Todos os setores</SelectItem>
          {sectors.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            onSelectedYearsChange(latestYear != null ? [latestYear] : []);
            onSelectedMonthsChange([]);
            onMaterialFilterChange("all");
            onSectorFilterChange("all");
          }}
          className="text-muted-foreground hover:text-destructive h-9 w-9 ml-auto sm:ml-0"
          title="Limpar todos os filtros"
        >
          <FilterX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
