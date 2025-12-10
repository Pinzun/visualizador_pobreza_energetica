from typing import Dict, Optional, List, Any, Iterable
import numpy as np
from matplotlib import cm, colors as mcolors


def a_dict_proporciones(resultado: Any) -> Dict[str, float]:
    """
    Acepta varias formas y devuelve {codigo: float(valor)}.
    Soporta:
      - {"14101": 0.12, "14102": 0.33}
      - {"14101": {"valor": 0.12}, ...}
      - [{"cut": "14101", "valor": 0.12}, ...]
      - [{"codigo": "14101", "value": "0.12"}, ...]
    Ignora entradas sin valor numérico convertible a float.
    """
    out: Dict[str, float] = {}

    # Caso 1: ya es un dict simple {cut: num}
    if isinstance(resultado, dict):
        # Puede ser dict simple o dict de dicts
        for k, v in resultado.items():
            if isinstance(v, (int, float, str)):
                try:
                    out[str(k)] = float(v)
                except (TypeError, ValueError):
                    pass
            elif isinstance(v, dict):
                # intenta llaves comunes
                for key_val in ("valor", "value", "proporcion", "prop", "p"):
                    if key_val in v:
                        try:
                            out[str(k)] = float(v[key_val])
                        except (TypeError, ValueError):
                            pass
                        break
        return out

    # Caso 2: lista de filas/objetos
    if isinstance(resultado, Iterable):
        for row in resultado:
            if not isinstance(row, dict):
                continue
            # busca código
            code = None
            for key_code in ("cut", "codigo", "code", "id", "clave"):
                if key_code in row:
                    code = str(row[key_code])
                    break
            if code is None:
                continue
            # busca valor
            val = None
            for key_val in ("valor", "value", "proporcion", "prop", "p"):
                if key_val in row:
                    val = row[key_val]
                    break
            if val is None:
                # tal vez venía como {"code": "...", "data": {"valor": ...}}
                if "data" in row and isinstance(row["data"], dict):
                    for key_val in ("valor", "value", "proporcion", "prop", "p"):
                        if key_val in row["data"]:
                            val = row["data"][key_val]
                            break
            if val is None:
                continue
            try:
                out[code] = float(val)
            except (TypeError, ValueError):
                pass
        return out

    return out


def construir_colores(
    proporciones: Dict[str, float],
    modo: str = "cuantiles",               # "lineal" | "cuantiles"
    cmap: str = "viridis",
    k: int = 5,                         # clases si cuantiles
    vmin: Optional[float] = None,       # para lineal
    vmax: Optional[float] = None,
    centro: Optional[float] = None,     # centro para paletas divergentes (TwoSlope), ej. 0
    color_na: str = "#CCCCCC"
) -> Dict[Dict[str, str], Dict[str, object]]:
    """
    proporciones: dict {codigo: valor}
    Retorna: (dict_codigo_a_color_hex, leyenda_dict)
    """
    codigos = list(proporciones.keys())
    vals = np.array([proporciones[c] for c in codigos], dtype=float)
    valid = np.isfinite(vals)

    # Inicializa salida con NA
    colores = {c: color_na for c in codigos}

    if not valid.any():
        return colores, {"modo": modo, "cmap": cmap, "cortes": [], "etiquetas": []}

    v_valid = vals[valid]

    if modo =="cuantiles":
        k = max(1, int(k))
        # cortes por cuantiles (manejo de repetidos)
        q = np.linspace(0, 1, k + 1)
        cortes = np.unique(np.quantile(v_valid, q))
        clases = max(1, len(cortes) - 1)

        cmap_obj = cm.get_cmap(cmap, clases)  # paleta discretizada
        # Asignar clase por búsqueda binaria
        for i, c in enumerate(codigos):
            v = vals[i]
            if not np.isfinite(v):
                continue
            idx = int(np.searchsorted(cortes, v, side="right") - 1)
            idx = max(0, min(clases - 1, idx))
            colores[c] = mcolors.to_hex(cmap_obj(idx), keep_alpha=False)

        etiquetas = [f"{cortes[i]:.3g} – {cortes[i+1]:.3g}" for i in range(clases)]
        leyenda = {"modo": "cuantiles", "cmap": cmap, "clases": clases,
                   "cortes": cortes.tolist(), "etiquetas": etiquetas}
        return colores, leyenda
    else:
        # ---- modo lineal (continuo)
        vmin = float(np.nanmin(v_valid)) if vmin is None else float(vmin)
        vmax = float(np.nanmax(v_valid)) if vmax is None else float(vmax)
        if vmax <= vmin:
            vmax = vmin + 1e-12

        if centro is None:
            norm = mcolors.Normalize(vmin=vmin, vmax=vmax)
        else:
            norm = mcolors.TwoSlopeNorm(vmin=vmin, vcenter=float(centro), vmax=vmax)

        cmap_obj = cm.get_cmap(cmap)

        for i, c in enumerate(codigos):
            v = vals[i]
            if np.isfinite(v):
                colores[c] = mcolors.to_hex(cmap_obj(norm(v)), keep_alpha=False)

        ticks = np.linspace(vmin, vmax, 5)
        etiquetas = [f"{t:.3g}" for t in ticks]
        leyenda = {"modo": "lineal", "cmap": cmap, "vmin": vmin, "vmax": vmax,
                "ticks": ticks.tolist(), "etiquetas": etiquetas, "centro": centro}
        return colores, leyenda    


def leyenda_para_front(leyenda: Dict[str, Any], n_stops: int = 5) -> Dict[str, Any]:
    """
    Convierte la leyenda devuelta por construir_colores() a un payload
    simple para el frontend. No usa pandas.
    """
    modo = str(leyenda.get("modo", "lineal")).lower()
    cmap_name = str(leyenda.get("cmap", "viridis"))

    if modo == "cuantiles":
        cortes: List[float] = leyenda.get("cortes", [])
        etiquetas: List[str] = leyenda.get("etiquetas", [])
        clases = max(0, len(etiquetas))
        cmap_obj = cm.get_cmap(cmap_name, max(1, clases))
        bins = []
        for i in range(clases):
            c = mcolors.to_hex(cmap_obj(i), keep_alpha=False)
            bins.append({
                "min": float(cortes[i]),
                "max": float(cortes[i+1]),
                "color": c,
                "label": etiquetas[i]
            })
        return {"type": "discrete", "bins": bins}

    # continua
    vmin = float(leyenda.get("vmin", 0.0))
    vmax = float(leyenda.get("vmax", 1.0))
    centro = leyenda.get("centro", None)
    ticks = leyenda.get("ticks", np.linspace(vmin, vmax, 5).tolist())
    tick_labels = leyenda.get("etiquetas", [f"{t:.3g}" for t in ticks])

    cmap_obj = cm.get_cmap(cmap_name)
    stops = []
    for t in np.linspace(0, 1, max(2, int(n_stops))):
        color = mcolors.to_hex(cmap_obj(t), keep_alpha=False)
        stops.append({"t": float(t), "color": color})

    return {
        "type": "continuous",
        "vmin": vmin,
        "vmax": vmax,
        "center": None if centro is None else float(centro),
        "stops": stops,
        "ticks": [float(x) for x in ticks],
        "tickLabels": [str(x) for x in tick_labels],
    }