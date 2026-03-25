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
| `NotasTecnicas` | Documentación metodológica interna |

## Estilos CSS

Cada componente importa su propio archivo CSS desde `src/styles/`. El archivo global (`styles.css`) contiene únicamente el reset base y las variables CSS globales (`--topbar-h`, `--home-gap`, etc.). Ver `CAMBIOS_CSS.md` para el detalle de la refactorización.

## Utilidades

Fichas descriptivas para el cálculo de indicadores:
https://minenergia-my.sharepoint.com/:w:/g/personal/ncavallo_minenergia_cl/EagSpJ0EcRpGv3LZCk81NesB45eBTiz4wmZIaHxhR9vNTA?CID=3b3e0d33-f509-b2d1-d630-e1a888f3ffcc&e=Tru4yy
