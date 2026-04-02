import { useQuery } from "@tanstack/react-query";

export interface MaterialRecord {
  timestamp: string;
  date: string;
  material: string;
  internacao: number;
  emergencia: number;
  centroCirurgico: number;
  melhorEmCasa: number;
  saudeMental: number;
  total: number;
}

export interface TecidoRecord {
  timestamp: string;
  date: string;
  material: string;
  internacao: number;
  emergencia: number;
  saudeMental: number;
  centroCirurgico: number;
  total: number;
}

const MATERIAIS_URL =
  "https://docs.google.com/spreadsheets/d/1yUJVpUNoyNohGk9CVsJx5EHuwM6Kg-659wrZwzlMmug/gviz/tq?tqx=out:csv";
const TECIDOS_URL =
  "https://docs.google.com/spreadsheets/d/1H9yOmavCT29fCuaSJwFlHPnVYH03Daxd3vdSJmD9o6w/gviz/tq?tqx=out:csv";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }
  return rows;
}

function parseNum(val: string): number {
  if (!val || val === '""' || val === "") return 0;
  const cleaned = val.replace(/"/g, "").trim();
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

function parseDateStr(val: string): string {
  const cleaned = val.replace(/"/g, "").trim();
  // Format: DD/MM/YYYY
  const parts = cleaned.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return cleaned;
}

async function fetchMateriais(): Promise<MaterialRecord[]> {
  const res = await fetch(MATERIAIS_URL);
  const text = await res.text();
  const rows = parseCSV(text);
  // Skip header
  return rows.slice(1).map((r) => {
    const internacao = parseNum(r[3]);
    const emergencia = parseNum(r[4]);
    const centroCirurgico = parseNum(r[5]);
    const melhorEmCasa = parseNum(r[6]);
    const saudeMental = parseNum(r[7]);
    return {
      timestamp: r[0]?.replace(/"/g, "") || "",
      date: parseDateStr(r[1] || ""),
      material: r[2]?.replace(/"/g, "") || "",
      internacao,
      emergencia,
      centroCirurgico,
      melhorEmCasa,
      saudeMental,
      total: internacao + emergencia + centroCirurgico + melhorEmCasa + saudeMental,
    };
  });
}

async function fetchTecidos(): Promise<TecidoRecord[]> {
  const res = await fetch(TECIDOS_URL);
  const text = await res.text();
  const rows = parseCSV(text);
  return rows.slice(1).map((r) => {
    const internacao = parseNum(r[3]);
    const emergencia = parseNum(r[4]);
    const saudeMental = parseNum(r[5]);
    const centroCirurgico = parseNum(r[6]);
    return {
      timestamp: r[0]?.replace(/"/g, "") || "",
      date: parseDateStr(r[1] || ""),
      material: r[2]?.replace(/"/g, "") || "",
      internacao,
      emergencia,
      saudeMental,
      centroCirurgico,
      total: internacao + emergencia + saudeMental + centroCirurgico,
    };
  });
}

export function useMateriais() {
  return useQuery({
    queryKey: ["materiais"],
    queryFn: fetchMateriais,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 min
    staleTime: 2 * 60 * 1000,
  });
}

export function useTecidos() {
  return useQuery({
    queryKey: ["tecidos"],
    queryFn: fetchTecidos,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
