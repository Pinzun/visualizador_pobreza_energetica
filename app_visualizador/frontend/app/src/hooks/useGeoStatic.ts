// src/hooks/useGeoStatic.ts
import { useEffect, useState } from "react";
// --- Imports estáticos (entran al bundle) ---
// Asegúrate de tener en tsconfig.json: "resolveJsonModule": true
import REGIONES_DATA from "../data/cut_regiones.json";
import BOUNDS_DATA from "../data/bounds.json";
import TAB_META_JSON from "../data/tab_meta.json";

export type Indicator = { value: string; label: string };
export type TabMetaEntry = {
  key: string;
  label: string;
  indicators: Indicator[];
};
export type TabMeta = Record<string, TabMetaEntry>;

//Reexport para usar en InfoPanel
export const TAB_META: TabMeta = TAB_META_JSON as TabMeta;
// --- Tipos mínimos (ajústalos si tienes esquema exacto) ---
type RegionesIndex = Record<string, unknown>;
type ComunasIndex = Record<string, unknown>;

// BBox en formato de tu JSON: [[latS, lonW], [latN, lonE]]
export type BBoxLL = [[number, number], [number, number]];

export type Bounds = {
  CHILE_BOUNDS?: BBoxLL;
  REGION_BOUNDS?: Record<string, BBoxLL>;
  COMUNAS_BOUNDS?: Record<string, BBoxLL>;
};

type Status = "idle" | "loading" | "partial" | "ready" | "error";
type UseGeoStaticProps = { region?: string };

// --- Import de todas las comunas (eager) para que queden en el bundle ---
const comunasModules = import.meta.glob("../data/comunas/comunas_*.json", {
  eager: true,
});

// -------- Helpers de validación/normalización de bounds --------
function isNum(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function toBBoxLL(b: unknown): BBoxLL | undefined {
  if (
    Array.isArray(b) &&
    b.length === 2 &&
    Array.isArray(b[0]) &&
    (b[0] as unknown[]).length === 2 &&
    Array.isArray(b[1]) &&
    (b[1] as unknown[]).length === 2 &&
    (b[0] as unknown[]).every(isNum) &&
    (b[1] as unknown[]).every(isNum)
  ) {
    return b as BBoxLL;
  }
  return undefined;
}

function normalizeBoundsJson(json: any): Bounds {
  const out: Bounds = {};

  const chile = toBBoxLL(json?.CHILE_BOUNDS);
  if (chile) out.CHILE_BOUNDS = chile;

  const src = json?.REGION_BOUNDS ?? {};
  const rb: Record<string, BBoxLL> = {};
  for (const [k, v] of Object.entries(src)) {
    const bb = toBBoxLL(v);
    if (bb) rb[k] = bb;
    else console.warn("[useGeoStatic] bbox inválido para región:", k, v);
  }
  if (Object.keys(rb).length) out.REGION_BOUNDS = rb;

  // 👇 NUEVO: comunas
  const cbSrc = json?.COMUNAS_BOUNDS ?? {};
  const cb: Record<string, BBoxLL> = {};
  for (const [k, v] of Object.entries(cbSrc)) {
    const bb = toBBoxLL(v);
    if (bb) cb[k] = bb;
  }
  if (Object.keys(cb).length) out.COMUNAS_BOUNDS = cb;
  return out;
}

// -------- Construir índice { [codRegion]: ComunasIndex } --------
function buildComunasByRegion() {
  const map: Record<string, ComunasIndex> = {};
  for (const [path, mod] of Object.entries(comunasModules)) {
    // path similar a: ../data/comunas/comunas_13.json
    const m = path.match(/comunas_(.+)\.json$/);
    if (!m) continue;
    const code = m[1]; // "13", "01", ...
    const data = (mod as any).default as ComunasIndex;
    map[code] = data;
  }
  return map;
}

const COMUNAS_BY_REGION = buildComunasByRegion();

// -------------------------- Hook --------------------------
export default function useGeoStatic({ region }: UseGeoStaticProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [regiones, setRegiones] = useState<RegionesIndex | null>(null);
  const [comunas, setComunas] = useState<ComunasIndex | null>(null);
  const [bounds, setBounds] = useState<Bounds | null>(null);

  // Carga base (sin red)
  useEffect(() => {
    try {
      setStatus("loading");
      setError(null);

      setRegiones(REGIONES_DATA as RegionesIndex);

      const normalized = normalizeBoundsJson(BOUNDS_DATA);
      setBounds(normalized);

      setStatus("partial"); // base lista (regiones/bounds)
    } catch (e: any) {
      console.error("[useGeoStatic] base error", e);
      setError(String(e?.message ?? e));
      setStatus("error");
    }
  }, []);

  // Carga comunas según región seleccionada
  useEffect(() => {
    if (!region) {
      setComunas(null);
      // Si venías en ready por comunas previas, podrías bajar a partial (UX a gusto)
      setStatus((s) => (s === "loading" ? "partial" : s));
      return;
    }
    const data = COMUNAS_BY_REGION[region] ?? null;
    setComunas(data);
    setStatus(data ? "ready" : "partial");
  }, [region]);

  return {
    status, // 'idle' | 'loading' | 'partial' | 'ready' | 'error'
    error,
    regiones, // index por código de región
    comunas, // index por CUT_COM de la región actual
    bounds, // { CHILE_BOUNDS, REGION_BOUNDS } con formato [[latS,lonW],[latN,lonE]]
    clearMemoryCache: () => {}, // no-op (compatibilidad)
  };
}
