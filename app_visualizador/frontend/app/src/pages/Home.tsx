// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import "../styles/Home.css";
import TabSelector from "../components/TabSelector";
import MapView from "../components/MapView";
import InfoPanel from "../components/InfoPanel";
import useGeoStatic from "../hooks/useGeoStatic";
import useGeoData from "../hooks/useGeoData";
import NotasTecnicas from "../components/NotasTecnicas";
import Legend from "../components/Legend";
import VideoPlayer from "../components/VideoPlayer";
import ProgramasVPE from "../components/ProgramasVPE";

const getRegionCode = (x: any): string =>
  x?.code ??
  x?.codigo ??
  x?.CODIGO ??
  x?.CUT_REG ??
  x?.COD_REG ??
  x?.CODIGO_REGION ??
  "";
const getCommuneCode = (x: any): string =>
  x?.code ?? x?.codigo ?? x?.CUT_COM ?? x?.COD_COM ?? x?.CODIGO_COMUNA ?? "";
const getName = (x: any): string =>
  x?.name ?? x?.nombre ?? x?.NOMBRE ?? x?.REGION ?? x?.COMUNA ?? "";

type TabKey = "mapa" | "notas_tecnicas" | "programas_disponibles";

const INDICADORES_ASEQUIBILIDAD = [
  "asequibilidad_med_nac_proporcion",
  "asequibilidad_med_nac_menor",
  "asequibilidad_med_nac_doble",
  "asequibilidad_gasto_10p",
  "asequibilidad_g_insuficiente",
  "asequibilidad_g_excesivo",
  "asequibilidad_gasto_energ_p",
];

function Home() {
  const [tab, setTab] = useState<TabKey>("mapa");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedComuna, setSelectedComuna] = useState<string>("");
  const [indicator, setIndicator] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(true);

  useEffect(() => setSelectedComuna(""), [selectedRegion]);

  const {
    status: geoStatus,
    error: geoError,
    regiones: regionesObj,
    comunas: comunasObj,
    bounds: boundsData,
  } = useGeoStatic({ region: selectedRegion });

  const { geoData } = useGeoData();

  const regionesFromHook = useMemo(() => {
    const isFC = (g: any) =>
      g && g.type === "FeatureCollection" && Array.isArray(g.features);
    for (const g of geoData ?? []) {
      if (!isFC(g)) continue;
      const p = g.features[0]?.properties ?? {};
      const hasReg = p.CUT_REG ?? p.COD_REG ?? p.REGION;
      const hasCom = p.CUT_COM ?? p.COD_COM ?? p.COMUNA;
      if (hasReg && !hasCom) return g;
      if (!hasCom && g.features.length > 10 && g.features.length < 40) return g;
    }
    return null;
  }, [geoData]);

  const [regionesFetched, setRegionesFetched] = useState<any | null>(null);
  const [triedFetch, setTriedFetch] = useState(false);

  useEffect(() => {
    if (regionesFromHook || triedFetch) return;
    (async () => {
      try {
        const resp = await fetch("/geo/regiones.geojson", {
          cache: "no-store",
        });
        if (resp.ok) setRegionesFetched(await resp.json());
      } finally {
        setTriedFetch(true);
      }
    })();
  }, [regionesFromHook, triedFetch]);

  const regionesGeoJson = regionesFromHook || regionesFetched || null;

  const regiones = useMemo<any[]>(
    () => (regionesObj ? Object.values(regionesObj) : []),
    [regionesObj],
  );
  const comunas = useMemo<any[]>(
    () => (comunasObj ? Object.values(comunasObj) : []),
    [comunasObj],
  );

  const CHILE_BOUNDS = boundsData?.CHILE_BOUNDS;
  const REGION_BOUNDS = boundsData?.REGION_BOUNDS || {};
  const COMUNA_BOUNDS = boundsData?.COMUNAS_BOUNDS || {};

  const [mapData, setMapData] = useState<{
    colores_mapa?: Record<string, string>;
    leyenda_mapa?: {
      titulo: string;
      nota?: string;
      unidad?: string;
      tipo: "discreto" | "secuencial";
      formato_tooltip?: string;
      bins: { min: number; max: number; label: string; color: string }[];
    } | null;
  }>({});

  const selectedName = selectedComuna
    ? getName(comunas.find((c) => getCommuneCode(c) === selectedComuna))
    : selectedRegion
      ? getName(regiones.find((r) => getRegionCode(r) === selectedRegion))
      : "Chile";

  const selectedLevel = selectedComuna
    ? "comuna"
    : selectedRegion
      ? "region"
      : "nacional";

  const tabs = [
    { key: "mapa", label: "Visualizador" },
    { key: "notas_tecnicas", label: "Indicadores y programas" },
    { key: "programas_disponibles", label: "Como usar el visualizador" },
  ] as const;

  const handleTabChange = (key: string) => {
    if (key === "programas_disponibles") {
      setShowVideoModal(true);
    } else {
      setTab(key as TabKey);
    }
  };
  const currentCut = selectedComuna || selectedRegion || undefined;
  const bloquearSelectores =
    indicator !== null && INDICADORES_ASEQUIBILIDAD.includes(indicator);

  return (
    <div className="home-wrapper">
      {/* ── Modal de video ── */}
      {showVideoModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: "min(720px, 92vw)",
              position: "relative",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 14,
                background: "none",
                border: "none",
                fontSize: 22,
                cursor: "pointer",
                color: "#555",
                lineHeight: 1,
              }}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>
              ¿Qué es la pobreza energética?
            </h3>
            <VideoPlayer
              src="/video/video_pe.mp4"
              poster="/image/poster_pe.png"
              autoPlay
              muted
              controls
            />
          </div>
        </div>
      )}

      {/* ── Tabs principales ── */}
      <div className="info-box tabselector2">
        <TabSelector
          tabs={tabs as any}
          currentTab={tab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* ── Tab: Visualizador ── */}
      {tab === "mapa" && (
        <div className="home-layout">
          {/* Columna izquierda */}
          <div className="left-col">
            <div className="select-box">
              <label className="administrative-select">
                <span style={{ fontWeight: "bold" }}>Región: </span>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  disabled={bloquearSelectores}
                >
                  <option value="">Seleccione una región</option>
                  {regiones.map((region) => {
                    const code = region?.CUT_REG ?? getRegionCode(region);
                    const name = region?.NOMBRE ?? getName(region);
                    if (!code || !name) return null;
                    return (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="administrative-select">
                <span style={{ fontWeight: "bold" }}>Comuna:</span>
                <select
                  value={selectedComuna}
                  onChange={(e) => setSelectedComuna(e.target.value)}
                  disabled={
                    bloquearSelectores ||
                    !selectedRegion ||
                    geoStatus === "loading" ||
                    geoStatus === "partial"
                  }
                >
                  <option value="">
                    {selectedRegion
                      ? "Seleccione una comuna"
                      : "Seleccione una región primero"}
                  </option>
                  {comunas.map((comuna) => {
                    const code = getCommuneCode(comuna);
                    const name = getName(comuna);
                    return (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </label>

              {bloquearSelectores && (
                <span
                  style={{
                    fontSize: 12,
                    color: "#888",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  Este indicador solo está disponible a nivel nacional.
                </span>
              )}

              {geoError && (
                <span style={{ color: "red" }}>
                  Error geo: {String(geoError)}
                </span>
              )}
            </div>

            <div className="map-slot" style={{ position: "relative" }}>
              <MapView
                regionesNacionales={regionesGeoJson}
                selectedRegion={selectedRegion}
                selectedComuna={selectedComuna}
                indicator={indicator}
                regionBounds={REGION_BOUNDS}
                comunaBounds={COMUNA_BOUNDS}
                chileBounds={CHILE_BOUNDS}
                onComunaClick={(cutCom) => setSelectedComuna(cutCom)}
                coloresMapa={mapData.colores_mapa ?? {}}
              />
              {mapData.leyenda_mapa && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 1000,
                    maxWidth: 220,
                  }}
                >
                  <Legend leyenda={mapData.leyenda_mapa} />
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha */}
          <div className="info-slot">
            <InfoPanel
              selectedDivAdmi={selectedLevel as any}
              selectedDivAdmiName={selectedName}
              currentCut={currentCut}
              onIndicatorChange={setIndicator}
              onMapDataChange={setMapData}
            />
          </div>
        </div>
      )}

      {/* ── Tab: Notas técnicas ── */}
      {tab === "notas_tecnicas" && (
        <div className="home-layout home-layout--notas">
          <div className="nt-pane">
            <NotasTecnicas />
          </div>
          <div className="nt-pane">
            <ProgramasVPE />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
