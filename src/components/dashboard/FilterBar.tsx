import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, FilterX } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (d: Date | undefined) => void;
  onEndDateChange: (d: Date | undefined) => void;
  materialFilter: string;
  onMaterialFilterChange: (v: string) => void;
  sectorFilter: string;
  onSectorFilterChange: (v: string) => void;
  materials: string[];
  sectors: string[];
}

export function FilterBar({
  startDate, endDate, onStartDateChange, onEndDateChange,
  materialFilter, onMaterialFilterChange,
  sectorFilter, onSectorFilterChange,
  materials, sectors,
}: FilterBarProps) {
  const hasFilters = startDate || endDate || materialFilter !== "all" || sectorFilter !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal bg-muted border-border", !startDate && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "dd/MM/yyyy") : "Data início"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            initialFocus
            className="p-3 pointer-events-auto"
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal bg-muted border-border", !endDate && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "dd/MM/yyyy") : "Data fim"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={onEndDateChange}
            disabled={(date) => startDate ? date < startDate : false}
            initialFocus
            className="p-3 pointer-events-auto"
            locale={ptBR}
          />
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
            onStartDateChange(undefined); 
            onEndDateChange(undefined); 
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
