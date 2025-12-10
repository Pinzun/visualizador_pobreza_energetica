import { useEffect, useState } from "react";
import JSZip from "jszip";
import axios from "../api/axiosInstance";
import { getGeoCache, setGeoCache } from "../utils/geoCache";
import { useGlobalLoading } from "../context/LoadingContext";

// === Config ===
const ZIP_BASE = import.meta.env.VITE_GEO_ZIP_BASE || "/geo/zips";
const MANIFEST_PATH = import.meta.env.VITE_GEO_ZIP_MANIFEST || "manifest.json";
const BATCH_SIZE = Number(import.meta.env.VITE_GEO_BATCH_SIZE ?? 8);
const PRELOAD_ALL =
  String(import.meta.env.VITE_PRELOAD_ALL ?? "false") === "true";

const isRegiones = (u: string) =>
  u.split("?")[0].split("#")[0].toLowerCase().includes("regiones");

type ManifestShape = { urls: (string | { url: string })[] };

export default function useGeoData() {
  const [geoData, setGeoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadedFromCache, setLoadedFromCache] = useState(false);

  // overlay global
  const {
    setLoading: setGlobalLoading,
    setProgress: setGlobalProgress,
    setMessage,
  } = useGlobalLoading();

  useEffect(() => {
    let cancelled = false;

    const fetchGeoData = async () => {
      setLoading(true);
      setError(null);
      setLoadedFromCache(false);
      setGeoData([]);
      setProgress(0);

      // overlay ON
      setGlobalLoading(true);
      setGlobalProgress(0);
      setMessage("Cargando capas…");

      try {
        // 1) Cache global primero
        const cached = await getGeoCache();
        if (cached && cached.length > 0) {
          if (!cancelled) {
            setGeoData(cached);
            setLoadedFromCache(true);
            setLoading(false);

            // overlay: cache hit
            setMessage("Desde caché");
            setGlobalProgress(1);
            setGlobalLoading(false);
          }
          return;
        }

        // 2) Resolver origen de URLs (backend primero, luego manifest)
        let urls: string[] = [];
        let fingerprint: string | undefined;

        // a) Backend
        try {
          const res = await axios.post("/api/carga_mapas");
          const data = res.data || {};
          if (Array.isArray(data.urls) && data.urls.length > 0) {
            urls = normalizeUrls(data.urls);
            fingerprint = data.fingerprint;
          }
        } catch {
          // ignoramos; probamos manifest
        }

        // b) Manifest estático
        if (urls.length === 0) {
          const mres = await safeFetch(joinUrl(ZIP_BASE, MANIFEST_PATH), {
            cache: "no-store",
          });
          if (!mres.ok) {
            throw new Error(
              `No hay datos: backend sin URLs y manifest no encontrado (${mres.status})`
            );
          }
          const man: ManifestShape = await mres.json();
          const fromManifest = normalizeUrls(man.urls || []);
          if (fromManifest.length === 0) {
            throw new Error("Manifest inválido: no hay 'urls'.");
          }
          urls = fromManifest.map((u) =>
            isAbsoluteUrl(u) ? u : joinUrl(ZIP_BASE, u)
          );
        }

        // === Prioriza REGIONES ===
        urls = [...urls].sort(
          (a, b) => Number(isRegiones(b)) - Number(isRegiones(a))
        );

        // 3) Descarga/parseo con publicación temprana de REGIONES
        const errores: string[] = [];
        let totalFiles = 0;
        let done = 0;

        const collected: any[] = [];
        let batchCount = 0;
        let earlyExit = false; // <- para cortar tras regiones si PRELOAD_ALL=false

        for (const url of urls) {
          if (cancelled || earlyExit) break;

          try {
            // Mensaje contextual por ZIP
            setMessage(
              isRegiones(url) ? "Cargando capas nacionales…" : "Cargando capas…"
            );

            const zipResponse = await safeFetch(url, { cache: "no-store" });
            if (!zipResponse.ok) {
              throw new Error(`Descarga fallida: ${zipResponse.status}`);
            }

            const zip = await JSZip.loadAsync(await zipResponse.blob());
            const fileNames = Object.keys(zip.files).filter((name) =>
              name.toLowerCase().endsWith(".geojson")
            );

            totalFiles += fileNames.length;

            const thisZipIsRegiones = isRegiones(url);
            const localBucket: any[] = [];

            // ——— iterar archivos dentro del ZIP ———
            for (const name of fileNames) {
              try {
                const file = zip.files[name];
                const blob = await file.async("blob");
                const parsed = await (await new Response(blob)).json();

                collected.push(parsed);
                localBucket.push(parsed);
                batchCount++;

                if (!cancelled) {
                  done++;
                  const p = totalFiles ? done / totalFiles : 1;
                  setProgress(p);
                  setGlobalProgress(p);

                  // Publicación inmediata si es REGIONES
                  if (thisZipIsRegiones && localBucket.length > 0) {
                    setGeoData(collected.slice());
                    setMessage("Capas nacionales listas");
                    await nap();
                  }

                  // Publicación por lotes para el resto
                  if (!thisZipIsRegiones && batchCount >= BATCH_SIZE) {
                    setGeoData(collected.slice());
                    batchCount = 0;
                    await nap();
                  }
                }
              } catch (e: any) {
                console.error(`❌ Error leyendo ${name}:`, e?.message || e);
                errores.push(name);
                if (!cancelled) {
                  done++;
                  const p = totalFiles ? done / totalFiles : 1;
                  setProgress(p);
                  setGlobalProgress(p);
                }
              }
            } // fin loop archivos del ZIP

            // descanso entre ZIPs grandes
            await nap();

            // ——— cortar tras REGIONES si no queremos precargar todo ———
            if (thisZipIsRegiones && !PRELOAD_ALL) {
              earlyExit = true;
              break; // break del loop de URLs
            }
          } catch (e: any) {
            console.error(`❌ Error con ZIP desde ${url}:`, e?.message || e);
            errores.push(url);
          }
        } // fin loop URLs

        // 4) Commit final y cache
        if (!cancelled) {
          setGeoData(collected);
          await setGeoCache(collected, { fingerprint });

          // overlay: fin OK
          setGlobalProgress(1);
          setMessage(undefined);
          setGlobalLoading(false);
        }

        // si salimos “temprano” tras regiones, la UI ya tiene la capa nacional
        // y el overlay se apaga arriba (no hace falta más trabajo)

        if (!cancelled && errores.length > 0) {
          setError(`Errores al cargar: ${errores.join(", ")}`);
        }
      } catch (err: any) {
        console.error("Error en carga de mapas:", err);
        if (!cancelled)
          setError(err?.message || "Error desconocido al cargar mapas.");

        // overlay: fin con error
        setMessage("No se pudieron cargar todas las capas");
        setGlobalLoading(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGeoData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { geoData, loading, error, progress, loadedFromCache };
}

// ---------- helpers ----------
function isAbsoluteUrl(u: string) {
  return /^https?:\/\//i.test(u);
}
function joinUrl(base: string, path: string) {
  if (!base.endsWith("/")) base += "/";
  return base + (path.startsWith("/") ? path.slice(1) : path);
}
async function safeFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, init);
}
async function nap() {
  return new Promise((r) => setTimeout(r, 0));
}
function normalizeUrls(arr: (string | { url: string })[]) {
  return arr
    .map((x) => (typeof x === "string" ? x : x?.url))
    .filter(Boolean) as string[];
}
