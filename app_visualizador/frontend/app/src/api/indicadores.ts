// src/api/indicadores.ts
import { getIndicadorCache, setIndicadorCache } from "../utils/indicadorCache";

// Caché en memoria para la sesión actual (más rápido que IndexedDB)
const sessionCache = new Map<string, IndicadorPayload>();

export type Desglose = {
  indicador: number; // llegó como número en el payload real
  total_a: string; // ← nombre real del backend
  total_b: string;
};

export type TipoEnergeticoRaw = {
  red_electrica?: string;
  generador?: string;
  solar?: string;
  eolica?: string;
  otro?: string;
  no_tiene?: string;
  no_declara?: string;
};

export type LeyendaBin = {
  min: number;
  max: number;
  label: string;
  color: string;
};

export type LeyendaMapa = {
  titulo: string;
  nota?: string;
  unidad?: string;
  tipo: "discreto" | "secuencial";
  formato_tooltip?: string;
  bins: LeyendaBin[];
};

// Payload base “amplio” para distintos indicadores.
// Se agregan campos opcionales que ya usas en Mapa/Panel.
export type IndicadorPayload = {
  colores_mapa?: Record<string, string>;
  leyenda_mapa?: LeyendaMapa;
  // nombres específicos del indicador de acceso electricidad:
  desglose_acceso_electricidad?: Desglose;
  tipo_energetico?: TipoEnergeticoRaw;

  // Si otras rutas devuelven claves diferentes, pueden convivir aquí como opcionales:
  // p.ej. desglose_otra_cosa?: {...}
  // series?: any;
  [k: string]: any;
};

// Mapa indicador → endpoint (ajusta/añade según tus rutas reales)
export const INDICATOR_ENDPOINTS: Record<string, string> = {
  // Acceso
  acceso_electricidad: "/api/public/acceso_electricidad",
  acceso_coccion: "/api/public/acceso_coccion",
  acceso_agua_caliente: "/api/public/acceso_agua_caliente",
  acceso_zonas_t: "/api/public/acceso_zonas_t",
  // Calidad
  calidad_coccion: "/api/public/calidad_coccion",
  calidad_calefaccion: "/api/public/calidad_calefaccion",
  calidad_saidi: "/api/public/calidad_saidi",
  // Asequibilidad
  asequibilidad_med_nac_proporcion:
    "/api/public/asequibilidad_med_nac_proporcion",
  asequibilidad_med_nac_menor: "/api/public/asequibilidad_med_nac_menor",
  asequibilidad_med_nac_doble: "/api/public/asequibilidad_med_nac_doble",
  asequibilidad_gasto_10p: "/api/public/asequibilidad_gasto_10p",
  asequibilidad_g_insuficiente: "/api/public/asequibilidad_g_insuficiente",
  asequibilidad_vuln: "/api/public/asequibilidad_vuln",
  asequibilidad_g_excesivo: "/api/public/asequibilidad_g_excesivo",
  asequibilidad_gasto_energ_p: "/api/public/asequibilidad_gasto_energ_p",
  // Habitabilidad
  habitabilidad_irrecuperable: "/api/public/habitabilidad_irrecuperable",
  habitabilidad_frio: "/api/public/habitabilidad_frio",
  habitabilidad_calor: "/api/public/habitabilidad_calor",
  habitabilidad_conservacion: "/api/public/habitabilidad_conservacion",
};

// Si no llega indicador, usaremos este como default:
const DEFAULT_INDICATOR = "acceso_electricidad";

export async function fetchIndicador(
  indicator: string | null | undefined,
  cut?: string,
): Promise<IndicadorPayload> {
  const key = indicator ?? DEFAULT_INDICATOR;
  const base =
    INDICATOR_ENDPOINTS[key] ?? INDICATOR_ENDPOINTS[DEFAULT_INDICATOR];

  const sessionKey = `${key}:${cut ?? "nacional"}`;

  // 1) Caché de sesión (Map en memoria) — instantáneo
  const fromSession = sessionCache.get(sessionKey);
  if (fromSession) {
    console.log("useIndicador [session-cache]:", key, cut);
    return fromSession;
  }

  // 2) Caché persistente (IndexedDB) — evita round-trip al backend entre recargas
  const fromIdb = await getIndicadorCache(key, cut);
  if (fromIdb) {
    console.log("useIndicador [idb-cache]:", key, cut);
    const payload = fromIdb as IndicadorPayload;
    sessionCache.set(sessionKey, payload);
    return payload;
  }

  // 3) Red
  console.log("useIndicador [fetch]:", key, "cut:", cut);
  const url = cut ? `${base}?cut=${encodeURIComponent(cut)}` : base;
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const payload: IndicadorPayload = await res.json();

  // Guardar en ambos niveles
  sessionCache.set(sessionKey, payload);
  setIndicadorCache(key, cut, payload); // async, no bloqueamos

  return payload;
}
