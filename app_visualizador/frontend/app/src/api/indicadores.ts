// src/api/indicadores.ts
export type Desglose = {
  porcentaje_sin_acceso: string;
  total_sin_acceso: string;
  total_viviendas: string;
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
  // pestaña/indicador “acceso a electricidad”
  acceso_electricidad: "/api/public/acceso_electricidad",
  acceso_agua_caliente: "/api/public/acceso_agua_caliente",
  acceso_coccion: "/api/public/acceso_coccion",
  calidad_calefaccion: "/api/public/calidad_calefaccion",
  calidad_coccion: "/api/public/calidad_coccion",
  calidad_saidi: "/api/public/calidad_saidi",
  habitabilidad_ineficiencia: "/api/public/habitabilidad_ineficiencia",
  habitabilidad_irrecuperable: "/api/public/habitabilidad_irrecuperable",
  // ejemplo de otros indicadores:
  // ineficiencia_termica: "/api/public/ineficiencia_termica",
  // acceso_coccion: "/api/public/acceso_coccion",
};

// Si no llega indicador, usaremos este como default:
const DEFAULT_INDICATOR = "acceso_electricidad";

export async function fetchIndicador(
  indicator: string | null | undefined,
  cut?: string
): Promise<IndicadorPayload> {
  const key = indicator ?? DEFAULT_INDICATOR;
  const base =
    INDICATOR_ENDPOINTS[key] ?? INDICATOR_ENDPOINTS[DEFAULT_INDICATOR];

  console.log("Fetching indicador:", key, "from", base, "cut:", cut);
  const url = cut ? `${base}?cut=${encodeURIComponent(cut)}` : base;
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
