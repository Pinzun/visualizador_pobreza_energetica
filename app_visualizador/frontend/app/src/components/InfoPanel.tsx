// src/components/InfoPanel.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/InfoPanel.css";
import TabSelector from "./TabSelector";
import PieAcceso from "./PieAcceso";
import CommonBarChart from "./BarChart";
import SaidiChart from "./SaidiChart";
import AsequibilidadChart from "./AsequibilidadChart";
import { getTextoIndicador } from "./TextoDescriptivo";

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
  mapSlot?: React.ReactNode;
};

function InfoPanel({
  selectedDivAdmi,
  selectedDivAdmiName,
  currentCut,
  onIndicatorChange,
  onMapDataChange,
  mapSlot,
}: InfoPanelProps) {
  const labels: Record<DivNivel, string> = {
    nacional: "País",
    region: "Región",
    comuna: "Comuna",
  };

  const tabs = useMemo(
    () =>
      Object.values(TAB_META).map(({ key, label }: TabMetaEntry) => ({
        key,
        label,
      })),
    [],
  );

  const [currentTab, setCurrentTab] = useState<string>(tabs[0]?.key ?? "");

  const indicatorOptions: Indicator[] = useMemo(() => {
    return currentTab ? (TAB_META[currentTab]?.indicators ?? []) : [];
  }, [currentTab]);

  const [indicator, setIndicator] = useState<string | null>(
    indicatorOptions[0]?.value ?? null,
  );

  useEffect(() => {
    const next = indicatorOptions[0]?.value ?? null;
    setIndicator(next);
  }, [indicatorOptions]);

  const lastSent = useRef<string | null>(null);
  useEffect(() => {
    if (!onIndicatorChange) return;
    if (indicator !== lastSent.current) {
      lastSent.current = indicator;
      onIndicatorChange(indicator);
    }
  }, [indicator, onIndicatorChange]);

  const {
    data: payload,
    loading,
    error,
  } = useIndicador(indicator || undefined, currentCut);

  const desglose = payload?.desglose ?? (payload as any)?.desglose ?? undefined;
  const tipo_energetico = payload?.tipo ?? undefined;

  useEffect(() => {
    if (!onMapDataChange) return;
    onMapDataChange({
      colores_mapa: payload?.colores_mapa || undefined,
      leyenda_mapa: payload?.leyenda_mapa || undefined,
    });
  }, [payload?.colores_mapa, payload?.leyenda_mapa, onMapDataChange]);

  const TITULOS = {
    pie: {
      acceso_electricidad: "Viviendas con/sin acceso a electricidad",
      acceso_coccion: "Hogares con/sin sistema de cocción",
      acceso_agua_caliente: "Hogares con/sin sistema de agua caliente",
      acceso_zonas_t: "Hogares sin acceso por zona térmica",
      calidad_coccion: "Hogares con cocción deficiente",
      calidad_calefaccion: "Hogares con calefacción deficiente",
      calidad_saidi: "Hogares afectados por interrupciones eléctricas",
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
      habitabilidad_irrecuperable: "Viviendas en condición irrecuperable",
      habitabilidad_frio: "Viviendas con déficit térmico en frío",
      habitabilidad_calor: "Viviendas con déficit térmico en calor",
      habitabilidad_conservacion: "Viviendas con problemas de conservación",
      default: "Desglose principal",
    },
    barras: {
      acceso_electricidad: "Tecnología de abastecimiento de energía eléctrica",
      acceso_coccion: "Tipo de combustible/tecnología de cocción",
      acceso_agua_caliente: "Tecnología de agua caliente sanitaria",
      acceso_zonas_t: "Distribución por zona térmica",
      calidad_coccion: "Combustible usado para cocción",
      calidad_calefaccion: "Combustible usado para calefacción",
      calidad_saidi: "Duración promedio de interrupciones por región",
      asequibilidad_med_nac_proporcion: "Distribución del gasto por región",
      asequibilidad_med_nac_menor: "Distribución por región",
      asequibilidad_med_nac_doble: "Distribución por región",
      asequibilidad_gasto_10p: "Distribución por región",
      asequibilidad_g_insuficiente: "Distribución por región",
      asequibilidad_vuln: "Distribución por región",
      asequibilidad_g_excesivo: "Distribución por región",
      asequibilidad_gasto_energ_p: "Gasto energético per cápita por región",
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

  const INDICADORES_ASEQUIBILIDAD = [
    "asequibilidad_med_nac_proporcion",
    "asequibilidad_med_nac_menor",
    "asequibilidad_med_nac_doble",
    "asequibilidad_gasto_10p",
    "asequibilidad_g_insuficiente",
    "asequibilidad_g_excesivo",
    "asequibilidad_gasto_energ_p",
  ];

  const esAsequibilidad =
    indicator !== null && INDICADORES_ASEQUIBILIDAD.includes(indicator);

  // ── Caso sin tabs ──
  if (!tabs.length) {
    return (
      <div className="info-panel">
        <div className="info-box">
          No hay pestañas configuradas en <code>tab_meta.json</code>
        </div>
      </div>
    );
  }

  // ── Caso normal ──
  return (
    <div className="info-panel">
      <div className="info-box info-panel__layout">
        {/* Columna izquierda: mapa */}
        {mapSlot && <div className="info-panel__map-col">{mapSlot}</div>}

        {/* Columna derecha: controles + gráficos */}
        <div className="info-panel__content-col">
          <div className="info-box tabselector">
            <TabSelector
              tabs={tabs}
              currentTab={currentTab}
              onTabChange={setCurrentTab}
            />
          </div>

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

            {loading && <div style={{ marginTop: 8 }}>Cargando indicador…</div>}
            {error && (
              <div style={{ marginTop: 8, color: "crimson" }}>
                Error: {String(error)}
              </div>
            )}

            {/* ======= FILA DE VISUALIZACIONES ======= */}
            <div className="viz-row">
              <div className="viz-card viz-card--texto">
                <div className="viz-title">Descripción del indicador</div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#444",
                    whiteSpace: "pre-line",
                  }}
                >
                  {getTextoIndicador(indicator)?.descripcion ??
                    "Sin descripción disponible para este indicador."}
                </div>
              </div>
              {esAsequibilidad ? (
                <div className="viz-card" style={{ width: "100%" }}>
                  <div className="viz-title">{pieTitle}</div>
                  {loading ? (
                    <div style={{ color: "#666", padding: 16 }}>Cargando…</div>
                  ) : (
                    <AsequibilidadChart payload={payload as any} />
                  )}
                </div>
              ) : indicator === "calidad_saidi" && payload ? (
                <div className="viz-card" style={{ width: "100%" }}>
                  <div className="viz-title">
                    Interrupción del servicio eléctrico (SAIDI)
                  </div>
                  {loading ? (
                    <div style={{ color: "#666", padding: 16 }}>
                      Cargando datos SAIDI…
                    </div>
                  ) : (
                    <SaidiChart
                      payload={payload as any}
                      selectedRegion={
                        currentCut && currentCut.length <= 2
                          ? currentCut
                          : undefined
                      }
                      selectedComuna={
                        currentCut && currentCut.length > 2
                          ? currentCut
                          : undefined
                      }
                    />
                  )}
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
            {/* ======= /FILA DE VISUALIZACIONES ======= */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoPanel;
