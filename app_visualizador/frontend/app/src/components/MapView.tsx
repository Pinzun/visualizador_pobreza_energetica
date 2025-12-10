// src/components/MapView.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L, { LatLngBoundsExpression, Path } from "leaflet";
import "leaflet/dist/leaflet.css";
import JSZip from "jszip";
import type { LeyendaMapa } from "./Legend"; // 👈 reutilizamos el tipo que ya tienes

export type BBoxLL = [[number, number], [number, number]];

type Props = {
  regionesNacionales?: any;
  selectedRegion?: string;
  selectedComuna?: string;
  indicator?: string | null;
  regionBounds?: Record<string, BBoxLL>;
  comunaBounds?: Record<string, BBoxLL>;
  chileBounds?: BBoxLL;
  onComunaClick?: (cutCom: string) => void;
  coloresMapa?: Record<string, string>;
  leyendaMapa?: LeyendaMapa | null; // 👈 añadimos la leyenda
};

const ZIP_BASE = import.meta.env.VITE_GEO_ZIP_BASE || "/geo/zips";
const MANIFEST_PATH = import.meta.env.VITE_GEO_ZIP_MANIFEST || "manifest.json";

const regionCache = new Map<string, any>();

// ---------- helpers ----------
const looksLikeRegionZip = (u: string, cut: string) => {
  const s = u.split("?")[0].toLowerCase();
  return (
    s.endsWith(".zip") &&
    (s.includes(`/reg_${cut}`) ||
      s.includes(`_${cut}.zip`) ||
      s.includes(`/comunas_${cut}`))
  );
};

function ensureLatLngOrder(b: BBoxLL | undefined): BBoxLL | undefined {
  if (!b) return b;
  const [[a, b1], [c, d]] = b;
  const looksLikeLngLat = Math.abs(a) > 60 || Math.abs(c) > 60;
  if (looksLikeLngLat) {
    return [
      [b1, a],
      [d, c],
    ];
  }
  return b;
}

function FitToBounds({
  bounds,
  leftInset = 24,
  topInset = 24,
  rightInset = 24,
  bottomInset = 24,
}: {
  bounds?: BBoxLL;
  leftInset?: number;
  topInset?: number;
  rightInset?: number;
  bottomInset?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    const b = ensureLatLngOrder(bounds) as LatLngBoundsExpression;
    map.flyToBounds(b, {
      paddingTopLeft: L.point(leftInset, topInset),
      paddingBottomRight: L.point(rightInset, bottomInset),
      duration: 0.6,
      maxZoom: 12,
    });
  }, [bounds, map, leftInset, topInset, rightInset, bottomInset]);
  return null;
}

async function resolveRegionUrl(cutReg: string): Promise<string | null> {
  try {
    const res = await fetch(joinUrl(ZIP_BASE, MANIFEST_PATH), {
      cache: "no-store",
    });
    if (res.ok) {
      const man = await res.json();
      const urls: string[] = (
        Array.isArray(man?.urls)
          ? man.urls.map((x: any) => (typeof x === "string" ? x : x?.url))
          : []
      ).filter(Boolean);

      const z = urls.find((u) => looksLikeRegionZip(u, cutReg));
      if (z) return isAbsoluteUrl(z) ? z : joinUrl(ZIP_BASE, z);

      const g = urls.find((u) => {
        const s = u.split("?")[0].toLowerCase();
        return (
          s.endsWith(".geojson") &&
          (s.includes(`/reg_${cutReg}`) ||
            s.includes(`_${cutReg}.geojson`) ||
            s.includes(`/comunas_${cutReg}`))
        );
      });
      if (g) return isAbsoluteUrl(g) ? g : joinUrl(ZIP_BASE, g);
    }
  } catch {
    /* noop */
  }
  return `/geo/regions/reg_${cutReg}.geojson`;
}

async function fetchRegionFC(url: string): Promise<any> {
  if (url.toLowerCase().endsWith(".zip")) {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) throw new Error(`ZIP ${resp.status}`);
    const zip = await JSZip.loadAsync(await resp.blob());
    const name = Object.keys(zip.files).find((n) =>
      n.toLowerCase().endsWith(".geojson")
    );
    if (!name) throw new Error("ZIP sin .geojson");
    const blob = await zip.files[name].async("blob");
    return await (await new Response(blob)).json();
  }
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GeoJSON ${res.status}`);
  return res.json();
}

// ---------- MapView ----------
export default function MapView({
  regionesNacionales,
  selectedRegion,
  selectedComuna,
  regionBounds,
  comunaBounds,
  chileBounds,
  onComunaClick,
  coloresMapa = {},
  leyendaMapa,
}: Props) {
  const viewBounds = useMemo<BBoxLL | undefined>(() => {
    if (selectedComuna && comunaBounds?.[selectedComuna])
      return comunaBounds[selectedComuna];
    if (selectedRegion && regionBounds?.[selectedRegion])
      return regionBounds[selectedRegion];
    return chileBounds;
  }, [selectedComuna, comunaBounds, selectedRegion, regionBounds, chileBounds]);

  const keyReg = (cutReg: any) => String(cutReg).padStart(2, "0");
  const keyCom = (cutCom: any) => String(cutCom);

  const fallbackByIndicator = "#7dbcf0";

  const [regionFC, setRegionFC] = useState<any | null>(null);
  const [loadingRegion, setLoadingRegion] = useState(false);
  const [regionErr, setRegionErr] = useState<string | null>(null);
  const lastRegRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadRegion(cut: string) {
      try {
        setLoadingRegion(true);
        setRegionErr(null);

        if (regionCache.has(cut)) {
          if (!cancelled) setRegionFC(regionCache.get(cut));
          return;
        }
        const url = await resolveRegionUrl(cut);
        if (!url) throw new Error("No se pudo resolver URL de región");

        const fc = await fetchRegionFC(url);
        if (cancelled) return;
        if (!fc || fc.type !== "FeatureCollection")
          throw new Error("Formato inválido en capa de región");

        regionCache.set(cut, fc);
        setRegionFC(fc);
      } catch (e: any) {
        if (!cancelled) setRegionErr(e?.message || "Error cargando región");
      } finally {
        if (!cancelled) setLoadingRegion(false);
      }
    }
    if (selectedRegion) {
      if (lastRegRef.current !== selectedRegion) {
        lastRegRef.current = selectedRegion;
        setRegionFC(null);
        loadRegion(selectedRegion);
      }
    } else {
      lastRegRef.current = null;
      setRegionFC(null);
      setRegionErr(null);
      setLoadingRegion(false);
    }
    return () => {
      cancelled = true;
    };
  }, [selectedRegion]);

  const showRegionesNacionales = Boolean(regionesNacionales && !selectedRegion);

  // 🔹 Busca label de leyenda para un color dado
  const findLabelForColor = (color: string) => {
    if (!leyendaMapa) return "";
    const bin = leyendaMapa.bins.find(
      (b) => b.color.toLowerCase() === color.toLowerCase()
    );
    return bin?.label ?? "";
  };

  return (
    <MapContainer
      center={[-33.45, -70.66]}
      zoom={4}
      minZoom={4}
      preferCanvas
      style={{ height: "100%", width: "100%" }}
      maxBounds={ensureLatLngOrder(chileBounds)}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />

      <FitToBounds
        bounds={viewBounds}
        leftInset={24}
        topInset={24}
        rightInset={230}
        bottomInset={24}
      />

      {/* Vista NACIONAL */}
      {showRegionesNacionales && (
        <GeoJSON
          key="regiones-nacionales"
          data={regionesNacionales}
          style={(feature: any) => {
            const props = feature?.properties || {};
            const regKey = keyReg(
              props.CUT_REG ?? props.cod_reg ?? props.COD_REG
            );
            const fillColor = coloresMapa[regKey] ?? fallbackByIndicator;
            return { color: "#666", weight: 0.8, fillColor, fillOpacity: 0.6 };
          }}
          onEachFeature={(feature, layer) => {
            const props = feature?.properties || {};
            const regKey = keyReg(
              props.CUT_REG ?? props.cod_reg ?? props.COD_REG
            );
            const fillColor = coloresMapa[regKey] ?? fallbackByIndicator;
            const label = findLabelForColor(fillColor);
            layer.bindTooltip(`${props.NOMBRE ?? "Región"}<br/>${label}`, {
              sticky: true,
            });
          }}
        />
      )}

      {/* Vista REGIONAL */}
      {selectedRegion && regionFC && (
        <GeoJSON
          key={`comunas-${selectedRegion}`}
          data={regionFC}
          style={(feature: any) => {
            const p = feature?.properties || {};
            const cutCom = p.CUT_COM ?? p.COD_COM ?? p.cod_com ?? p.cut_com;
            const isSelected =
              selectedComuna && String(cutCom) === String(selectedComuna);
            if (isSelected)
              return {
                color: "#000",
                weight: 2,
                fillColor: "#7dbcf0",
                fillOpacity: 0.6,
              };
            const fillColor = coloresMapa[keyCom(cutCom)] ?? "#c8e6c9";
            return {
              color: "#7dbcf0",
              weight: 0.7,
              fillColor,
              fillOpacity: 0.45,
            };
          }}
          onEachFeature={(feature, layer) => {
            const p = feature?.properties || {};
            const cutCom = p.CUT_COM ?? p.COD_COM ?? p.cod_com ?? p.cut_com;
            if (cutCom && onComunaClick) {
              layer.on("click", () => onComunaClick(String(cutCom)));
            }
            if (layer instanceof L.Path) {
              layer.on("mouseover", () =>
                (layer as Path).setStyle({ weight: 1.2 })
              );
              layer.on("mouseout", () =>
                (layer as Path).setStyle({ weight: 0.7 })
              );
            }
            const fillColor = coloresMapa[keyCom(cutCom)] ?? "#c8e6c9";
            const label = findLabelForColor(fillColor);
            layer.bindTooltip(`${p.NOMBRE ?? "Comuna"}<br/>${label}`, {
              sticky: true,
            });
          }}
        />
      )}
    </MapContainer>
  );
}

// -------- helpers menores --------
function isAbsoluteUrl(u: string) {
  return /^https?:\/\//i.test(u);
}
function joinUrl(base: string, path: string) {
  if (!base.endsWith("/")) base += "/";
  return base + (path.startsWith("/") ? path.slice(1) : path);
}
