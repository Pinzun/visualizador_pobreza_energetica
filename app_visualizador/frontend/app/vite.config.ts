// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/** Utilidad simple para booleans (1/true) */
const bool = (v?: string, def = false) =>
  v === "1" || v?.toLowerCase?.() === "true" || (!!v && v === "on") || def;

/** Plugin de headers + cache, parametrizable por env */
const createStaticHeadersPlugin = (opts: {
  cacheMaxAge: number; // segundos
  tilesPrefixes: string[]; // ej: ['/geo/zips/', '/geo/tiles/']
}) => {
  const { cacheMaxAge, tilesPrefixes } = opts;
  return {
    name: "static-headers",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url || "";

        // Content-Type por extensión
        if (url.endsWith(".pbf"))
          res.setHeader("Content-Type", "application/x-protobuf");
        else if (url.endsWith(".geojson"))
          res.setHeader("Content-Type", "application/geo+json");
        else if (url.endsWith(".zip"))
          res.setHeader("Content-Type", "application/zip");

        // Cache agresivo para tiles/archivos pesados
        const matchesPrefix = tilesPrefixes.some((p) => url.startsWith(p));
        if (
          matchesPrefix ||
          url.endsWith(".pbf") ||
          url.endsWith(".zip") ||
          url.endsWith(".geojson")
        ) {
          res.setHeader(
            "Cache-Control",
            `public, max-age=${cacheMaxAge}, immutable`
          );
        }
        next();
      });
    },
  };
};

/** Plugin para “simular” /api apagado en dev */
const devApiBypassPlugin = (disableBackend: boolean) => ({
  name: "dev-api-bypass",
  configureServer(server: any) {
    if (!disableBackend) return;
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url?.startsWith("/api/")) {
        res.statusCode = 204; // No Content
        return res.end();
      }
      next();
    });
  },
});

export default defineConfig(({ mode }) => {
  // Carga TODAS las variables (con y sin prefijo VITE_)
  const env = loadEnv(mode, process.cwd(), "");

  // ---------- Flags / valores desde .env ----------
  const DEBUG = bool(env.VITE_DEBUG, mode !== "production");
  const PORT = Number(env.VITE_PORT || 5173);
  const HOST = env.VITE_HOST || true; // true = 0.0.0.0
  const HMR_HOST = env.VITE_HMR_HOST || "127.0.0.1";

  const BACKEND_ORIGIN = env.VITE_BACKEND_ORIGIN || "http://backend:4322";
  const DISABLE_BACKEND = bool(env.VITE_DISABLE_BACKEND);
  const DOCKER_POLL = bool(env.VITE_DOCKER_POLL);

  const STATIC_CACHE_MAX_AGE = Number(
    envV(env, "VITE_STATIC_CACHE_MAX_AGE", "31536000")
  ); // 1 año
  const TILES_PREFIXES = (env.VITE_TILES_PREFIXES || "/geo/zips/,/geo/tiles/")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // ---------- Plugins ----------
  const staticHeadersPlugin = createStaticHeadersPlugin({
    cacheMaxAge: STATIC_CACHE_MAX_AGE,
    tilesPrefixes: TILES_PREFIXES,
  });

  return {
    plugins: [
      react(),
      staticHeadersPlugin,
      devApiBypassPlugin(DISABLE_BACKEND),
    ],

    server: {
      host: HOST,
      port: PORT,
      strictPort: true,
      hmr: { host: HMR_HOST },
      proxy: DISABLE_BACKEND
        ? {}
        : {
            "/api": {
              target: BACKEND_ORIGIN, // ← del .env
              changeOrigin: true,
              secure: false,
            },
          },
      watch: DOCKER_POLL
        ? {
            usePolling: true,
            interval: 1000,
            ignored: [
              "**/node_modules/**",
              "**/.git/**",
              "**/public/geo/zips/**",
              "**/public/geo/tiles/**",
            ],
          }
        : { usePolling: false },
      fs: { strict: true },
      allowedHosts: [
                      "pobrezaenergetica.minenergia.cl",
                      "pobrezaenergetica_backend.minenergia.cl"
                    ],
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "leaflet",
        "react-leaflet",
        "jszip",
        "idb",
        "leaflet.vectorgrid",
      ],
    },

    build: {
      sourcemap: DEBUG, // activa mapas si estás en debug
    },

    // Opcional: define una constante global para tree-shaking de logs
    define: {
      __APP_DEBUG__: JSON.stringify(DEBUG),
    },
  };
});

/** helper: toma env[k] o default */
function envV(env: Record<string, string>, k: string, def: string) {
  return (env[k] ?? def).toString();
}
