import type { MaterialRecord, TecidoRecord } from "@/hooks/useGoogleSheetsData";

type Record = MaterialRecord | TecidoRecord;

export function filterByDateRange(records: Record[], range: string): Record[] {
  if (range === "all") return records;
  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const cutoff = new Date(now.getTime() - days * 86400000);
  return records.filter((r) => new Date(r.date) >= cutoff);
}

export function filterByMaterial(records: Record[], material: string): Record[] {
  if (material === "all") return records;
  return records.filter((r) => r.material === material);
}

export function filterBySector(records: Record[], sector: string): Record[] {
  if (sector === "all") return records;
  const sectorKey = sectorToKey(sector);
  return records.filter((r) => (r as any)[sectorKey] > 0);
}

function sectorToKey(sector: string): string {
  const map: { [k: string]: string } = {
    "Internação": "internacao",
    "Emergência": "emergencia",
    "Centro Cirúrgico": "centroCirurgico",
    "Melhor em Casa": "melhorEmCasa",
    "Saúde Mental": "saudeMental",
  } as any;
  return (map as any)[sector] || sector;
}

export function getUniqueValues(records: Record[], key: keyof Record): string[] {
  return [...new Set(records.map((r) => String(r[key])))].filter(Boolean).sort();
}

export function aggregateByDate(records: Record[]): { date: string; total: number }[] {
  const map = new Map<string, number>();
  records.forEach((r) => {
    const existing = map.get(r.date) || 0;
    map.set(r.date, existing + r.total);
  });
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({
      date: formatDateLabel(date),
      total,
    }));
}

export function aggregateByMaterial(records: Record[]): { name: string; value: number }[] {
  const map = new Map<string, number>();
  records.forEach((r) => {
    map.set(r.material, (map.get(r.material) || 0) + r.total);
  });
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

export function aggregateBySector(records: Record[]): { name: string; value: number }[] {
  const sectors: { key: string; label: string }[] = [
    { key: "internacao", label: "Internação" },
    { key: "emergencia", label: "Emergência" },
    { key: "centroCirurgico", label: "Centro Cirúrgico" },
    { key: "melhorEmCasa", label: "Melhor em Casa" },
    { key: "saudeMental", label: "Saúde Mental" },
  ];
  return sectors
    .map((s) => ({
      name: s.label,
      value: records.reduce((sum, r) => sum + ((r as any)[s.key] || 0), 0),
    }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function aggregateByDateAndSector(records: Record[]): { date: string; internacao: number; emergencia: number; centroCirurgico: number; saudeMental: number }[] {
  const map = new Map<string, any>();
  records.forEach((r) => {
    const existing = map.get(r.date) || { date: r.date, internacao: 0, emergencia: 0, centroCirurgico: 0, saudeMental: 0 };
    existing.internacao += (r as any).internacao || 0;
    existing.emergencia += (r as any).emergencia || 0;
    existing.centroCirurgico += (r as any).centroCirurgico || 0;
    existing.saudeMental += (r as any).saudeMental || 0;
    map.set(r.date, existing);
  });
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, v]) => ({ ...v, date: formatDateLabel(v.date) }));
}

function formatDateLabel(iso: string): string {
  const parts = iso.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return iso;
}

function formatFullDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return iso;
}

export function getDailyAverage(records: Record[]): number {
  const dates = new Set(records.map((r) => r.date));
  if (dates.size === 0) return 0;
  const total = records.reduce((s, r) => s + r.total, 0);
  return Math.round(total / dates.size);
}

export function getPeakDay(records: Record[]): { date: string; total: number } | null {
  const map = new Map<string, number>();
  records.forEach((r) => map.set(r.date, (map.get(r.date) || 0) + r.total));
  let peak = { date: "", total: 0 };
  map.forEach((total, date) => {
    if (total > peak.total) peak = { date, total };
  });
  return peak.date ? { ...peak, date: formatFullDate(peak.date) } : null;
}

export const SECTORS_MATERIAIS = ["Internação", "Emergência", "Centro Cirúrgico", "Melhor em Casa", "Saúde Mental"];
export const SECTORS_TECIDOS = ["Internação", "Emergência", "Saúde Mental", "Centro Cirúrgico"];
