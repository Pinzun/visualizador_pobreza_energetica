# Visualizador de Pobreza Energética

Plataforma web que permite **visualizar indicadores de pobreza energética en Chile** a nivel nacional, regional y comunal. Los datos provienen de fuentes públicas (CASEN, Censo, SAIDI) y de análisis del Ministerio de Energía.

## Arquitectura

La plataforma está basada en contenedores Docker:

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Flask + SQLAlchemy |
| Base de datos | MySQL |
| Orquestación local | Docker Compose |

## Prerequisitos

- Docker & Docker Compose
- Git
- Terminal Bash

## Desarrollo local

El proyecto incluye el script `start.sh` que orquesta el despliegue según el entorno:

```bash
./start.sh dev
```

Esto levanta los tres servicios (frontend, backend, base de datos) configurados para desarrollo.

## Estructura del proyecto

```
app_visualizador/
├── backend/
│   └── app/
│       ├── app.py              # Entry point Flask
│       ├── models/             # Modelos SQLAlchemy (CASEN, Censo, SAIDI, geodatos...)
│       ├── routes/             # Endpoints REST por indicador
│       └── services/           # Lógica auxiliar y cálculo de escalas de color
├── frontend/
│   └── app/
│       └── src/
│           ├── components/     # Componentes React (mapa, gráficos, panel, tabs...)
│           ├── pages/          # Páginas (Home)
│           ├── layouts/        # Shells de layout (PublicShell)
│           ├── hooks/          # Custom hooks (datos geo, indicadores, loading)
│           ├── context/        # Contextos React (LoadingContext)
│           ├── api/            # Capa de acceso al backend
│           ├── utils/          # Caché de geodatos e indicadores (IndexedDB)
│           ├── styles/         # Archivos CSS por componente + global
│           └── data/           # Datos estáticos (bounds, CUT comunas/regiones)
└── entornos/
    └── .env.dev                # Variables de entorno para desarrollo
```

## Indicadores disponibles

El visualizador cubre cuatro dimensiones de pobreza energética:

- **Acceso** — electricidad, cocción, agua caliente sanitaria, zonas térmicas
- **Calidad** — calidad de cocción, calefacción, interrupciones eléctricas (SAIDI)
- **Asequibilidad** — gasto energético respecto a ingreso, mediana nacional, umbrales de vulnerabilidad
- **Habitabilidad** — eficiencia térmica, déficit de frío/calor, conservación de viviendas

Cada indicador se puede consultar a nivel nacional, regional o comunal. El mapa se colorea automáticamente según la distribución del indicador seleccionado.

## Componentes principales del frontend

| Componente | Función |
|---|---|
| `MapView` | Mapa interactivo Leaflet con GeoJSON por región/comuna |
| `InfoPanel` | Panel derecho con selector de indicador y visualizaciones |
| `BarChart` / `PieAcceso` | Gráficos de distribución por tipo energético |
| `AsequibilidadChart` / `SaidiChart` | Gráficos especializados por dimensión |
| `Legend` | Leyenda dinámica del mapa |
| `TabSelector` | Selector de pestañas reutilizable |
| `TopBar` | Barra superior con logo y menú |
| `LoadingOverlay` | Overlay de carga con barra de progreso |
| `ProgramasVPE` | Panel informativo de programas de vulnerabilidad energética |
| `VideoPlayer` | Reproductor de video embebido |
| `NotasTecnicas` | Documentación metodológica interna |

## Hooks y utilidades del frontend

| Archivo | Función |
|---|---|
| `hooks/useGeoData.ts` | Descarga y publica polígonos GeoJSON (regiones y comunas) |
| `hooks/useRegionGeo.ts` | Carga bajo demanda los polígonos de comunas por región |
| `hooks/useIndicador.ts` | Solicita y cachea datos de indicadores al backend |
| `utils/geoCache.ts` | Caché IndexedDB para polígonos GeoJSON |
| `utils/indicadorCache.ts` | Caché IndexedDB + memoria para respuestas de indicadores |

## Estrategias de caché

El visualizador maneja dos tipos de datos costosos de cargar: **geodatos** (archivos GeoJSON con los polígonos del mapa) e **indicadores** (respuestas de la API del backend). Cada uno tiene su propia estrategia de caché.

### 1. GeoJSON — Polígonos del mapa

**Archivo:** `src/utils/geoCache.ts`
**Mecanismo:** IndexedDB (via librería `idb`)
**Clave de caché:** `geojson_cache:<APP_VERSION>:GLOBAL`

Los archivos GeoJSON se descargan como ZIPs desde el servidor al primer acceso, se descomprimen en el browser y se persisten en IndexedDB. En visitas posteriores se leen desde la base de datos local sin ningún request de red.

**Invalidación:** actualizar `APP_VERSION` en `geoCache.ts`:

```ts
// src/utils/geoCache.ts
const APP_VERSION = "v2025.08.16"; // ← cambiar cuando se actualicen los geodatos
```

**Flujo de carga (`useGeoData`):**
```
Inicio de la app
  └─ ¿Existe GLOBAL en IndexedDB?
       ├─ Sí → usar datos cacheados (carga instantánea)
       └─ No → descargar ZIPs desde /geo/zips/
               descomprimir GeoJSON
               publicar regiones de inmediato (renderiza el mapa)
               publicar comunas en batches
               guardar en IndexedDB
```

### 2. Datos de indicadores — API del backend

**Archivos:** `src/utils/indicadorCache.ts`, `src/api/indicadores.ts`
**Mecanismo:** dos capas — Map en memoria + IndexedDB
**Clave de caché:** `<DATA_VERSION>:<indicador>:<cut>`

Las respuestas de la API se almacenan en dos capas que se consultan en cascada:

```
fetchIndicador(indicador, cut)
  │
  ├─ 1. sessionCache (Map en memoria)
  │      ↳ ~0 ms. Cubre la navegación dentro de la misma sesión.
  │
  ├─ 2. IndexedDB (indicadorCache.ts)
  │      ↳ ~1–5 ms. Persiste entre recargas. TTL: 7 días.
  │
  └─ 3. Red (fetch al backend)
         ↳ Solo cuando no hay caché en ninguna capa.
           Guarda el resultado en ambas capas.
```

**Invalidación:** actualizar `DATA_VERSION` en `indicadorCache.ts`:

```ts
// src/utils/indicadorCache.ts
const DATA_VERSION = "v2025.08.16"; // ← cambiar cuando el backend reciba datos nuevos
```

El TTL de 7 días actúa como protección adicional aunque `DATA_VERSION` no se actualice. Si IndexedDB no está disponible (modo incógnito, cuota llena), el caché falla silenciosamente y la app hace el fetch de red normalmente.

### 3. ZIPs de comunas por región — HTTP cache del browser

**Archivo:** `src/hooks/useRegionGeo.ts`
**Mecanismo:** caché HTTP nativo del browser

Al hacer clic en una región, se descarga el ZIP con sus polígonos comunales. Vite sirve estos archivos con:

```
Cache-Control: public, max-age=31536000, immutable
```

Dentro de la misma sesión los datos también se guardan en un `Map` en memoria para acceso instantáneo.

### Resumen de capas de caché

| Dato | Capa 1 | Capa 2 | Capa 3 | Invalidación |
|------|--------|--------|--------|-------------|
| GeoJSON (polígonos mapa) | — | IndexedDB | Red | `APP_VERSION` en `geoCache.ts` |
| Respuestas de indicadores | Memoria (sesión) | IndexedDB | Red | `DATA_VERSION` en `indicadorCache.ts` |
| ZIPs de comunas por región | Memoria (sesión) | HTTP cache browser | Red | Cambio de URL del archivo |

### Limpiar el caché manualmente (desarrollo)

Desde las DevTools del browser:

- **IndexedDB completo:** Application → IndexedDB → `GeoDataCache` o `IndicadorCache` → Delete database
- **HTTP cache:** Application → Cache Storage → Clear, o Network → Disable cache
- **Mediante código:**
  ```ts
  import { clearGeoCache } from "./utils/geoCache";
  import { clearIndicadorCache } from "./utils/indicadorCache";

  await clearGeoCache();        // borra IndexedDB de geodatos
  await clearIndicadorCache();  // borra IndexedDB de indicadores
  // sessionCache se reinicia al recargar la página
  ```

## Variables de entorno del frontend

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_GEO_ZIP_BASE` | `/geo/zips` | Ruta base de los ZIPs de geodatos |
| `VITE_GEO_ZIP_MANIFEST` | `manifest.json` | Nombre del archivo de manifiesto |
| `VITE_PRELOAD_ALL` | `false` | Si `true`, descarga todas las capas al inicio; si `false`, carga comunas bajo demanda |
| `VITE_GEO_BATCH_SIZE` | `8` | Archivos GeoJSON que se publican por batch durante la carga |
| `VITE_STATIC_CACHE_MAX_AGE` | `31536000` | `max-age` en segundos para archivos estáticos geoespaciales |

## Estilos CSS

Cada componente importa su propio archivo CSS desde `src/styles/`. El archivo global (`styles.css`) contiene únicamente el reset base y las variables CSS globales (`--topbar-h`, `--home-gap`, etc.). Ver `CAMBIOS_CSS.md` para el detalle de la refactorización.

## Utilidades

Fichas descriptivas para el cálculo de indicadores:
https://minenergia-my.sharepoint.com/:w:/g/personal/ncavallo_minenergia_cl/EagSpJ0EcRpGv3LZCk81NesB45eBTiz4wmZIaHxhR9vNTA?CID=3b3e0d33-f509-b2d1-d630-e1a888f3ffcc&e=Tru4yy
