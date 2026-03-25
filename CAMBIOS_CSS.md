# Refactorización de estilos CSS — Frontend

**Fecha:** Marzo 2026
**Rama:** `indicadores_front`

## Contexto

El frontend acumulaba todos sus estilos en un único archivo global (`styles.css`) de ~460 líneas que contenía estilos de cada componente mezclados entre sí. Además existían archivos CSS independientes (`public-shell.css`, `loading.css`, `Home.css`, `NotasTecnicas.css`) que nadie importaba o que duplicaban y contradecían definiciones del global, generando conflictos de cascada.

## Problemas corregidos

### 1. Conflicto de altura en el shell principal

`public-shell.css` definía `.public-shell { grid-template-rows: 56px 1fr }` (valor hardcoded), mientras `styles.css` usaba `var(--topbar-h)` (15vh). Dependiendo del orden de carga, el layout se rompía silenciosamente. Se unificó en `public-shell.css` usando siempre la variable CSS.

### 2. Bloque `:root` duplicado en `Home.css`

`Home.css` redeclaraba las mismas variables CSS que ya existían en `styles.css` con valores distintos (`--home-gap: 20px` vs `10px`, etc.). Como el archivo no era importado por ningún componente, el conflicto era latente pero podía activarse al conectar el import. Se eliminó el bloque `:root` duplicado.

### 3. Archivos CSS huérfanos

`Home.css` y `NotasTecnicas.css` existían pero ningún componente los importaba. Los estilos llegaban a la aplicación únicamente por el archivo global, haciendo invisible la dependencia.

### 4. Monolito global

`styles.css` mezclaba reset, variables, TopBar, shell, Home, InfoPanel, tabs, gráficos, loading overlay y video player. Cualquier cambio en estilos de un componente requería buscar en el archivo global.

## Solución aplicada

Se adoptó el patrón **"un componente, un archivo CSS"**: cada componente importa explícitamente su propio archivo de estilos. El archivo global queda reducido al mínimo indispensable.

### Archivos CSS resultantes

| Archivo | Contenido | Importado por |
|---|---|---|
| `styles/styles.css` | Reset `html/body/#root`, `background` del body, variables `:root` | `main.tsx` → `index.css` |
| `styles/TopBar.css` | `.top-bar*`, `.page-title`, `.logo`, `.dropdown-*` | `TopBar.tsx` |
| `styles/public-shell.css` | `.public-shell`, `.app-shell`, `.public-content` | `PublicShell.tsx` |
| `styles/loading.css` | `.fullscreen-loading-overlay`, barra de progreso | `LoadingOverlay.tsx` |
| `styles/TabSelector.css` | `.tabs`, `.tab-btn`, variantes activo/inactivo | `TabSelector.tsx` |
| `styles/InfoPanel.css` | `.info-panel`, `.info-box`, `.viz-row/card`, `.administrative-select` | `InfoPanel.tsx` |
| `styles/Home.css` | `.home-wrapper`, `.home-layout`, columnas, variante notas, video | `Home.tsx` |
| `styles/NotasTecnicas.css` | `.notas-tecnicas`, `.nt-*` | `NotasTecnicas.tsx` |

### Regla de propiedad de clases

Cada clase CSS pertenece a exactamente un archivo. No hay clase definida en más de un lugar. Los estilos que se usan en múltiples componentes (ej. `.administrative-select`) se ubican en el archivo del componente más cercano conceptualmente y son accesibles vía el grafo de imports de React.

## Archivos modificados

- `styles/styles.css` — reescrito (solo global)
- `styles/public-shell.css` — reescrito (corrige conflicto de 56px)
- `styles/Home.css` — reescrito (elimina `:root` duplicado, estilos limpios)
- `styles/TopBar.css` — creado
- `styles/TabSelector.css` — creado
- `styles/InfoPanel.css` — creado
- `components/TopBar.tsx` — agrega import CSS
- `components/LoadingOverlay.tsx` — agrega import CSS
- `components/TabSelector.tsx` — agrega import CSS
- `components/InfoPanel.tsx` — agrega import CSS
- `components/NotasTecnicas.tsx` — agrega import CSS
- `layouts/PublicShell.tsx` — agrega import CSS
- `pages/Home.tsx` — agrega import CSS
