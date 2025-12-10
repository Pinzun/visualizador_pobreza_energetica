// src/hooks/useRegionGeo.ts
import { useEffect, useState } from "react";
import JSZip from "jszip";

// Config: base de zips y/o base de geojson directo.
// - Si usas ZIPs: deja ZIP_BASE y usa fetchZip=true
// - Si usas .geojson directo: setea DIRECT_BASE y fetchZip=false
const ZIP_BASE = import.meta.env.VITE_GEO_ZIP_BASE || "/geo/zips";
const DIRECT_BASE =
  import.meta.env.VITE_COMUNAS_BYREG_BASE || "/geo/comunas_by_region";
// Elegir origen principal
const FETCH_FROM_ZIP =
  String(import.meta.env.VITE_REGION_FROM_ZIP ?? "true") === "true";

// Caché en memoria por CUT_REG
const memCache = new Map<string, any>();

type UseRegionGeoResult = {
  data: any | null;
  loading: boolean;
  error: string | null;
};

export default function useRegionGeo(cutReg?: string): UseRegionGeoResult {
  const [data, setData] = useState<any | null>(
    cutReg ? memCache.get(cutReg) ?? null : null
  );
  const [loading, setLoading] = useState<boolean>(
    !!cutReg && !memCache.has(cutReg)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!cutReg) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // ya en memoria
    const cached = memCache.get(cutReg);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let geojson: any;

        if (FETCH_FROM_ZIP) {
          // Desde ZIP: /geo/zips/comunas_XX.zip (con un único geojson adentro)
          const zipUrl = `${ZIP_BASE}/comunas_${cutReg}.zip`;
          const resp = await fetch(zipUrl, { cache: "no-store" });
          if (!resp.ok) throw new Error(`ZIP ${zipUrl} -> ${resp.status}`);

          const zipBlob = await resp.blob();
          const zip = await JSZip.loadAsync(zipBlob);

          // busca el primer .geojson dentro
          const entryName = Object.keys(zip.files).find((n) =>
            n.toLowerCase().endsWith(".geojson")
          );
          if (!entryName) throw new Error("ZIP sin .geojson");

          const file = zip.files[entryName];
          const blob = await file.async("blob");
          geojson = await (await new Response(blob)).json();
        } else {
          // Directo: /geo/comunas_by_region/comunas_XX.geojson
          const jsonUrl = `${DIRECT_BASE}/comunas_${cutReg}.geojson`;
          const resp = await fetch(jsonUrl, { cache: "no-store" });
          if (!resp.ok) throw new Error(`JSON ${jsonUrl} -> ${resp.status}`);
          geojson = await resp.json();
        }

        if (!cancelled) {
          memCache.set(cutReg, geojson);
          setData(geojson);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Error cargando comunas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [cutReg]);

  return { data, loading, error };
}
