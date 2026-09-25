import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useMateriais, useTecidos } from "@/hooks/useGoogleSheetsData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KPICard } from "@/components/dashboard/KPICard";
import { TimelineChart } from "@/components/dashboard/charts/TimelineChart";
import { BarChartComponent } from "@/components/dashboard/charts/BarChartComponent";
import { DonutChart } from "@/components/dashboard/charts/DonutChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Scissors, TrendingUp, Calendar, Activity, BarChart3, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  filterByMaterial, filterBySector,
  getUniqueValues, aggregateByDate, aggregateByMaterial,
  aggregateBySector, aggregateByDateAndSector,
  getDailyAverage, getPeakDay,
  SECTORS_MATERIAIS, SECTORS_TECIDOS,
} from "@/lib/dataUtils";

const PERIOD_STORAGE_KEY = "dashboard-date-filter";

function readStoredPeriod(): { years: number[]; months: number[] } {
  try {
    const raw = localStorage.getItem(PERIOD_STORAGE_KEY);
    if (!raw) return { years: [], months: [] };
    const parsed = JSON.parse(raw) as { years?: unknown; months?: unknown };
    const years = Array.isArray(parsed.years)
      ? parsed.years.filter((y): y is number => Number.isInteger(y))
      : [];
    const months = Array.isArray(parsed.months)
      ? parsed.months.filter((m): m is number => Number.isInteger(m) && m >= 1 && m <= 12)
      : [];
    return { years, months };
  } catch {
    return { years: [], months: [] };
  }
}

function yearFromDate(date: string): number | null {
  const year = Number(date.slice(0, 4));
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : null;
}

function monthFromDate(date: string): number | null {
  const month = Number(date.slice(5, 7));
  return month >= 1 && month <= 12 ? month : null;
}

export default function Dashboard() {
  const { data: materiais, isLoading: loadingM, refetch: refetchM, isFetching: fetchingM } = useMateriais();
  const { data: tecidos, isLoading: loadingT, refetch: refetchT, isFetching: fetchingT } = useTecidos();

  const [activeTab, setActiveTab] = useState("materiais");
  const [selectedYears, setSelectedYears] = useState<number[]>(() => readStoredPeriod().years);
  const [selectedMonths, setSelectedMonths] = useState<number[]>(() => readStoredPeriod().months);
  const [yearsReady, setYearsReady] = useState(false);
  const [materialFilter, setMaterialFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const isLoading = loadingM || loadingT;
  const isFetching = fetchingM || fetchingT;

  const handleRefresh = useCallback(() => {
    setIsManualRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  }, []);

  const currentData = activeTab === "materiais" ? materiais : tecidos;
  const currentSectors = activeTab === "materiais" ? SECTORS_MATERIAIS : SECTORS_TECIDOS;

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const record of [...(materiais ?? []), ...(tecidos ?? [])]) {
      const year = yearFromDate(record.date);
      if (year) years.add(year);
    }
    return [...years].sort((a, b) => b - a);
  }, [materiais, tecidos]);

  const initializedYears = useRef(false);

  const yearsForFilter = useMemo(() => {
    const known = availableYears.length > 0
      ? selectedYears.filter((year) => availableYears.includes(year))
      : selectedYears;
    if (known.length > 0) return known;
    if (!yearsReady && availableYears.length > 0) return [availableYears[0]];
    return known;
  }, [selectedYears, availableYears, yearsReady]);

  useEffect(() => {
    if (initializedYears.current || availableYears.length === 0) return;
    initializedYears.current = true;
    setSelectedYears((current) => {
      const valid = current.filter((year) => availableYears.includes(year));
      return valid.length > 0 ? valid : [availableYears[0]];
    });
    setYearsReady(true);
  }, [availableYears]);

  useEffect(() => {
    if (!yearsReady) return;
    localStorage.setItem(
      PERIOD_STORAGE_KEY,
      JSON.stringify({ years: yearsForFilter, months: selectedMonths }),
    );
  }, [yearsForFilter, selectedMonths, yearsReady]);

  const handleYearsChange = useCallback((years: number[]) => {
    setYearsReady(true);
    setSelectedYears(years);
  }, []);

  const filtered = useMemo(() => {
    if (!currentData) return [];
    let d: typeof currentData = [...currentData];
    if (yearsForFilter.length > 0 || selectedMonths.length > 0) {
      const years = new Set(yearsForFilter);
      const months = new Set(selectedMonths);
      d = d.filter((r) => {
        const year = yearFromDate(r.date);
        const month = monthFromDate(r.date);
        if (years.size > 0 && (year == null || !years.has(year))) return false;
        if (months.size > 0 && (month == null || !months.has(month))) return false;
        return true;
      });
    }
    d = filterByMaterial(d as any, materialFilter) as typeof currentData;
    d = filterBySector(d as any, sectorFilter) as typeof currentData;
    return d;
  }, [currentData, yearsForFilter, selectedMonths, materialFilter, sectorFilter]);

  const uniqueMaterials = useMemo(() => currentData ? getUniqueValues(currentData as any, "material") : [], [currentData]);

  const totalItems = useMemo(() => filtered.reduce((s, r) => s + r.total, 0), [filtered]);
  const dailyAvg = useMemo(() => getDailyAverage(filtered), [filtered]);
  const peak = useMemo(() => getPeakDay(filtered), [filtered]);
  const uniqueTypes = useMemo(() => new Set(filtered.map((r) => r.material)).size, [filtered]);

  const timelineData = useMemo(() => aggregateByDate(filtered), [filtered]);
  const byMaterial = useMemo(() => aggregateByMaterial(filtered), [filtered]);
  const bySector = useMemo(() => aggregateBySector(filtered), [filtered]);
  const bySectorTimeline = useMemo(() => aggregateByDateAndSector(filtered), [filtered]);

  const tableColumns = activeTab === "materiais"
    ? [
      { key: "date", label: "Data" },
      { key: "material", label: "Material" },
      { key: "internacao", label: "Internação" },
      { key: "emergencia", label: "Emergência" },
      { key: "centroCirurgico", label: "Centro Cirúrgico" },
      { key: "melhorEmCasa", label: "Melhor em Casa" },
      { key: "saudeMental", label: "Saúde Mental" },
      { key: "total", label: "Total" },
    ]
    : [
      { key: "date", label: "Data" },
      { key: "material", label: "Tecido" },
      { key: "internacao", label: "Internação" },
      { key: "emergencia", label: "Emergência" },
      { key: "saudeMental", label: "Saúde Mental" },
      { key: "centroCirurgico", label: "Centro Cirúrgico" },
      { key: "total", label: "Total" },
    ];

  const tableData = useMemo(() => {
    return [...filtered]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((r) => {
        const parts = r.date.split("-");
        const dateFormatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : r.date;
        return { ...r, date: dateFormatted };
      });
  }, [filtered]);

  // Alerts
  const alerts = useMemo(() => {
    const result: string[] = [];
    if (peak && peak.total > dailyAvg * 2) {
      result.push(`Pico de uso detectado em ${peak.date}: ${peak.total} itens (${Math.round(peak.total / dailyAvg * 100)}% da média)`);
    }
    const topMaterial = byMaterial[0];
    if (topMaterial && totalItems > 0 && topMaterial.value / totalItems > 0.3) {
      result.push(`${topMaterial.name} representa ${Math.round(topMaterial.value / totalItems * 100)}% do total esterilizado`);
    }
    return result;
  }, [peak, dailyAvg, byMaterial, totalItems]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative">
      {/* Tela de Loading / Atualização */}
      {isManualRefreshing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="text-center space-y-4 bg-card px-8 py-6 rounded-2xl border border-border shadow-2xl flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <p className="text-sm font-semibold text-foreground tracking-tight">Atualizando Dashboard...</p>
            <p className="text-xs text-muted-foreground">Sincronizando com o banco de dados</p>
          </div>
        </div>
      )}

      <div className="w-full">
        <DashboardHeader onRefresh={handleRefresh} isRefreshing={isManualRefreshing || isFetching} />
      </div>

      <div className="w-full max-w-[1440px] mx-auto flex flex-col px-6 sm:px-10 lg:px-16 xl:px-20 pb-10">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setMaterialFilter("all"); setSectorFilter("all"); }}>
          <div className="pt-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="bg-muted border border-border self-start sm:self-auto">
              <TabsTrigger value="materiais" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display text-sm">
                <Package className="h-4 w-4 mr-1.5" /> Materiais
              </TabsTrigger>
              <TabsTrigger value="tecidos" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-display text-sm">
                <Scissors className="h-4 w-4 mr-1.5" /> Tecidos
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <a href="https://forms.gle/8KhaoUWKnVTvGe7f8" target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow font-semibold transition-all hover:scale-[1.02]">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Novo Registro — Materiais
                </Button>
              </a>
              <a href="https://forms.gle/1YwQU8YBXtJpxwaw5" target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gradient-accent text-accent-foreground font-semibold transition-all hover:scale-[1.02]">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Novo Registro — Tecidos
                </Button>
              </a>
            </div>
          </div>

          <FilterBar
            availableYears={availableYears}
            selectedYears={yearsForFilter}
            onSelectedYearsChange={handleYearsChange}
            selectedMonths={selectedMonths}
            onSelectedMonthsChange={setSelectedMonths}
            materialFilter={materialFilter}
            onMaterialFilterChange={setMaterialFilter}
            sectorFilter={sectorFilter}
            onSectorFilterChange={setSectorFilter}
            materials={uniqueMaterials}
            sectors={currentSectors}
          />

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="pt-4">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground">{alert}</p>
                </div>
              ))}
            </div>
          )}

          <TabsContent value="materiais" className="mt-0">
            <DashboardContent
              totalItems={totalItems}
              dailyAvg={dailyAvg}
              peak={peak}
              uniqueTypes={uniqueTypes}
              timelineData={timelineData}
              byMaterial={byMaterial}
              bySector={bySector}
              bySectorTimeline={bySectorTimeline}
              tableData={tableData}
              tableColumns={tableColumns}
              variant="primary"
              label="Materiais"
            />
          </TabsContent>
          <TabsContent value="tecidos" className="mt-0">
            <DashboardContent
              totalItems={totalItems}
              dailyAvg={dailyAvg}
              peak={peak}
              uniqueTypes={uniqueTypes}
              timelineData={timelineData}
              byMaterial={byMaterial}
              bySector={bySector}
              bySectorTimeline={bySectorTimeline}
              tableData={tableData}
              tableColumns={tableColumns}
              variant="accent"
              label="Tecidos"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface DashboardContentProps {
  totalItems: number;
  dailyAvg: number;
  peak: { date: string; total: number } | null;
  uniqueTypes: number;
  timelineData: any[];
  byMaterial: { name: string; value: number }[];
  bySector: { name: string; value: number }[];
  bySectorTimeline: any[];
  tableData: any[];
  tableColumns: { key: string; label: string }[];
  variant: "primary" | "accent";
  label: string;
}

function DashboardContent({
  totalItems, dailyAvg, peak, uniqueTypes,
  timelineData, byMaterial, bySector, bySectorTimeline,
  tableData, tableColumns, variant, label,
}: DashboardContentProps) {
  return (
    <div className="pt-2 pb-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Esterilizado" value={totalItems} icon={Package} variant={variant} />
        <KPICard title="Média Diária" value={dailyAvg} subtitle="itens/dia" icon={TrendingUp} />
        <KPICard title="Pico de Uso" value={peak ? peak.total : "—"} subtitle={peak?.date} icon={Activity} variant={variant} />
        <KPICard title={`Tipos de ${label}`} value={uniqueTypes} icon={BarChart3} />
      </div>

      {/* Evolução Diária (Linha Inteira) */}
      <div className="w-full">
        <TimelineChart data={timelineData} title={`Evolução Diária — ${label}`} />
      </div>

      {/* Distribuição por Setor & Top 5 Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DonutChart data={bySector} title="Distribuição por Setor" />
        <BarChartComponent
          data={byMaterial.slice(0, 5)}
          title={`Top 5 ${label} por Volume`}
          color={variant === "primary" ? "hsl(210 100% 56%)" : "hsl(172 66% 50%)"}
        />
      </div>

      {/* Evolução por Setor (Linha Inteira) */}
      <div className="w-full">
        <TimelineChart
          data={bySectorTimeline}
          title="Evolução por Setor"
          lines={[
            { key: "internacao", color: "hsl(210 100% 56%)", name: "Internação" },
            { key: "emergencia", color: "hsl(172 66% 50%)", name: "Emergência" },
            { key: "centroCirurgico", color: "hsl(28 100% 55%)", name: "Centro Cirúrgico" },
            { key: "saudeMental", color: "hsl(265 85% 65%)", name: "Saúde Mental" },
          ]}
        />
      </div>

      {/* Data Table */}
      <DataTable data={tableData} columns={tableColumns} title={`Registros — ${label}`} />
    </div>
  );
}
