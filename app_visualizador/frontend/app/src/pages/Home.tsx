// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import TabSelector from "../components/TabSelector";
import MapView from "../components/MapView";
import InfoPanel from "../components/InfoPanel";
import useGeoStatic from "../hooks/useGeoStatic";
import useGeoData from "../hooks/useGeoData";
import NotasTecnicas from "../components/NotasTecnicas";
import Legend from "../components/Legend";
import VideoPlayer from "../components/VideoPlayer";

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

type TabKey = "video" | "mapa" | "notas_tecnicas" | "programas_disponibles";

function Home() {
  const [tab, setTab] = useState<TabKey>("mapa");

  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedComuna, setSelectedComuna] = useState<string>("");
  const [indicator, setIndicator] = useState<string | null>(null);

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
    [regionesObj]
  );
  const comunas = useMemo<any[]>(
    () => (comunasObj ? Object.values(comunasObj) : []),
    [comunasObj]
  );

  const CHILE_BOUNDS = boundsData?.CHILE_BOUNDS;
  const REGION_BOUNDS = boundsData?.REGION_BOUNDS || {};
  const COMUNA_BOUNDS = boundsData?.COMUNAS_BOUNDS || {};

  // 🔹 Estado que “alimenta” InfoPanel -> Home (colores + leyenda)
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
    { key: "video", label: "¿Qué es la pobreza energética?" },
    { key: "notas_tecnicas", label: "Notas técnicas" },
    { key: "programas_disponibles", label: "Programas disponibles" },
  ] as const;

  const handleTabChange = (key: string) => setTab(key as TabKey);

  // CUT actual que deben consultar los indicadores
  const currentCut = selectedComuna || selectedRegion || undefined;

  return (
    <div className="home-wrapper">
      <div className="info-box tabselector2">
        <TabSelector
          tabs={tabs as any}
          currentTab={tab}
          onTabChange={handleTabChange}
        />
      </div>

      {tab === "video" && (
        <div className="video-16x9">
          <VideoPlayer
            src="/video/video_pe.mp4"
            poster="/image/poster_pe.png"
            autoPlay
            muted
            controls
          />
        </div>
      )}

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
                // 🔹 Usamos lo que vino desde InfoPanel
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
              // 🔹 Recibimos colores/leyenda aquí
              onMapDataChange={setMapData}
            />
          </div>
        </div>
      )}

      {tab === "notas_tecnicas" && (
        <div className="home-layout home-layout--notas">
          <div className="nt-pane">
            <NotasTecnicas />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
