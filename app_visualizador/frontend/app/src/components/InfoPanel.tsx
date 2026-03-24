// src/components/InfoPanel.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import TabSelector from "./TabSelector";
import PieAcceso from "./PieAcceso";
import CommonBarChart from "./BarChart";

import {
  TAB_META,
  type Indicator,
  type TabMetaEntry,
} from "../hooks/useGeoStatic";
import useIndicador from "../hooks/useIndicador";
import type { IndicadorPayload } from "../api/indicadores";

type DivNivel = "nacional" | "region" | "comuna";

type InfoPanelProps = {
  selectedDivAdmi: DivNivel;
  selectedDivAdmiName?: string;
  currentCut?: string | undefined;
  onIndicatorChange?: (value: string | null) => void;
  onMapDataChange?: (data: {
    colores_mapa?: Record<string, string>;
    leyenda_mapa?: IndicadorPayload["leyenda_mapa"];
  }) => void;
};

function InfoPanel({
  selectedDivAdmi,
  selectedDivAdmiName,
  currentCut,
  onIndicatorChange,
  onMapDataChange,
}: InfoPanelProps) {
  const labels: Record<DivNivel, string> = {
    nacional: "País",
    region: "Región",
    comuna: "Comuna",
  };

  // 1) Pestañas desde TAB_META
  const tabs = useMemo(
    () =>
      Object.values(TAB_META).map(({ key, label }: TabMetaEntry) => ({
        key,
        label,
      })),
    [],
  );

  const [currentTab, setCurrentTab] = useState<string>(tabs[0]?.key ?? "");

  // 2) Opciones de indicador para la pestaña actual
  const indicatorOptions: Indicator[] = useMemo(() => {
    return currentTab ? (TAB_META[currentTab]?.indicators ?? []) : [];
  }, [currentTab]);

  // 3) Indicador seleccionado (default = primero de la pestaña)
  const [indicator, setIndicator] = useState<string | null>(
    indicatorOptions[0]?.value ?? null,
  );

  // Reset del indicador cuando cambian las opciones (pestaña distinta o TAB_META cambia)
  useEffect(() => {
    const next = indicatorOptions[0]?.value ?? null;
    setIndicator(next);
  }, [indicatorOptions]);

  // 4) Notificar al padre si cambió el indicador
  const lastSent = useRef<string | null>(null);
  useEffect(() => {
    if (!onIndicatorChange) return;
    if (indicator !== lastSent.current) {
      lastSent.current = indicator;
      onIndicatorChange(indicator);
    }
  }, [indicator, onIndicatorChange]);

  // 5) Fetch del indicador seleccionado
  const {
    data: payload,
    loading,
    error,
  } = useIndicador(indicator || undefined, currentCut);

  // 6) Derivar campos del payload (tolerante a variaciones entre rutas)
  const desglose = payload?.desglose ?? (payload as any)?.desglose ?? undefined;
  const tipo_energetico = payload?.tipo ?? undefined;

  // 7) Sincronizar datos de mapa con el padre (incluye reset si no hay datos)
  useEffect(() => {
    if (!onMapDataChange) return;
    onMapDataChange({
      colores_mapa: payload?.colores_mapa || undefined,
      leyenda_mapa: payload?.leyenda_mapa || undefined,
    });
  }, [payload?.colores_mapa, payload?.leyenda_mapa, onMapDataChange]);

  // 8) Títulos según indicador (con fallback)
  const TITULOS = {
    pie: {
      // Acceso
      acceso_electricidad: "Viviendas con/sin acceso a electricidad",
      acceso_coccion: "Hogares con/sin sistema de cocción",
      acceso_agua_caliente: "Hogares con/sin sistema de agua caliente",
      acceso_zonas_t: "Hogares sin acceso por zona térmica",
      // Calidad
      calidad_coccion: "Hogares con cocción deficiente",
      calidad_calefaccion: "Hogares con calefacción deficiente",
      calidad_saidi: "Hogares afectados por interrupciones eléctricas",
      // Asequibilidad
      asequibilidad_med_nac_proporcion:
        "Proporción del gasto respecto a la mediana nacional",
      asequibilidad_med_nac_menor:
        "Hogares con gasto menor a la mediana nacional",
      asequibilidad_med_nac_doble:
        "Hogares con gasto mayor al doble de la mediana",
      asequibilidad_gasto_10p: "Hogares con gasto energético sobre el 10%",
      asequibilidad_g_insuficiente: "Hogares con gasto energético insuficiente",
      asequibilidad_vuln: "Hogares vulnerables energéticamente",
      asequibilidad_g_excesivo: "Hogares con gasto energético excesivo",
      asequibilidad_gasto_energ_p: "Gasto energético per cápita",
      // Habitabilidad
      habitabilidad_irrecuperable: "Viviendas en condición irrecuperable",
      habitabilidad_frio: "Viviendas con déficit térmico en frío",
      habitabilidad_calor: "Viviendas con déficit térmico en calor",
      habitabilidad_conservacion: "Viviendas con problemas de conservación",
      default: "Desglose principal",
    },
    barras: {
      // Acceso
      acceso_electricidad: "Tecnología de abastecimiento de energía eléctrica",
      acceso_coccion: "Tipo de combustible/tecnología de cocción",
      acceso_agua_caliente: "Tecnología de agua caliente sanitaria",
      acceso_zonas_t: "Distribución por zona térmica",
      // Calidad
      calidad_coccion: "Combustible usado para cocción",
      calidad_calefaccion: "Combustible usado para calefacción",
      calidad_saidi: "Duración promedio de interrupciones por región",
      // Asequibilidad
      asequibilidad_med_nac_proporcion: "Distribución del gasto por región",
      asequibilidad_med_nac_menor: "Distribución por región",
      asequibilidad_med_nac_doble: "Distribución por región",
      asequibilidad_gasto_10p: "Distribución por región",
      asequibilidad_g_insuficiente: "Distribución por región",
      asequibilidad_vuln: "Distribución por región",
      asequibilidad_g_excesivo: "Distribución por región",
      asequibilidad_gasto_energ_p: "Gasto energético per cápita por región",
      // Habitabilidad
      habitabilidad_irrecuperable: "Distribución por región",
      habitabilidad_frio: "Distribución por región",
      habitabilidad_calor: "Distribución por región",
      habitabilidad_conservacion: "Distribución por región",
      default: "Distribución por categoría",
    },
  } as const;

  const pieTitle =
    TITULOS.pie[(indicator as keyof typeof TITULOS.pie) ?? "default"] ??
    TITULOS.pie.default;

  const barrasTitle =
    TITULOS.barras[(indicator as keyof typeof TITULOS.barras) ?? "default"] ??
    TITULOS.barras.default;

  // Estado sin tabs configuradas
  if (!tabs.length) {
    return (
      <div className="info-panel">
        <div className="info-box">
          <h5>{labels[selectedDivAdmi]}:</h5>
          <strong>{selectedDivAdmiName ?? "—"}</strong>
          <div className="info-box info-box--expand">
            No hay pestañas configuradas en <code>tab_meta.json</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="info-panel">
      <div className="info-box">
        {/* División administrativa seleccionada */}
        <h5>{labels[selectedDivAdmi]}:</h5>
        <strong>{selectedDivAdmiName ?? "—"}</strong>

        {/* Selector de pestañas */}
        <div className="info-box tabselector">
          <TabSelector
            tabs={tabs}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
          />
        </div>

        {/* Selector de indicador */}
        <div className="info-box info-box--expand">
          <strong>Indicador</strong>
          <label className="administrative-select">
            <select
              value={indicator ?? ""}
              onChange={(e) => setIndicator(e.target.value || null)}
              disabled={!indicatorOptions.length}
            >
              {indicatorOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {/* Loading / Error mínimos */}
          {loading && <div style={{ marginTop: 8 }}>Cargando indicador…</div>}
          {error && (
            <div style={{ marginTop: 8, color: "crimson" }}>
              Error: {String(error)}
            </div>
          )}

          {/* ======= FILA DE VISUALIZACIONES ======= */}
          <div className="viz-row">
            {/* Pie (solo si hay desglose válido) */}
            {desglose ? (
              <div className="viz-card">
                <div className="viz-title">{pieTitle}</div>
                <div className="pie-acceso">
                  <PieAcceso desglose={desglose as any} />
                </div>
              </div>
            ) : (
              <div className="viz-card" aria-live="polite">
                <div className="viz-title">{pieTitle}</div>
                <div style={{ color: "#666", paddingTop: 8 }}>
                  No hay datos para el gráfico de torta.
                </div>
              </div>
            )}

            {/* Barras (solo si hay tipo_energetico) */}
            {tipo_energetico ? (
              <div className="viz-card">
                <div className="viz-title">{barrasTitle}</div>
                <div className="bar-wrapper">
                  <CommonBarChart
                    dataTipo={tipo_energetico as any}
                    yDivisor={1000}
                    yLabel="Miles de viviendas"
                  />
                </div>
              </div>
            ) : (
              <div className="viz-card" aria-live="polite">
                <div className="viz-title">{barrasTitle}</div>
                <div style={{ color: "#666", paddingTop: 8 }}>
                  No hay datos para el gráfico de barras.
                </div>
              </div>
            )}
          </div>
          {/* ======= /FILA DE VISUALIZACIONES ======= */}
        </div>
      </div>
    </div>
  );
}

export default InfoPanel;
