# services/funciones_auxiliares.py

# A la fecha: 30-09-2025
# Información de contexto (modificar tras cambios, mantener indicadores actualizados):

# ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
# │   Agregué este cuadro de texto para seguimiento de cambios e información relevante sobre        │
# │   el script, para facilitar su mantención y trazabilidad.                                       │
# │                                                                                                 │                                    
# │   Acá se incluyen todas las funciones que dan formato a cada tipo de dato, como para promedios  │
# │   y sumatorias; como también de forma auxiliar para el formato del mapa de calor.               │                                                                                    │
# └─────────────────────────────────────────────────────────────────────────────────────────────────┘

# ┌─────────────────────────────────────┐
# │ 1) Funciones para formato de datos  │
# └─────────────────────────────────────┘

# Da formato a datos numéricos enteros.
def formato_chileno(valor):
    return f"{round(int(valor)):,}".replace(",", ".")

# Da formato a datos numéricos con decimales.
def formato_chileno_prom(valor):
    if valor is None:
        return 0.0
    try:
        if isinstance(valor, (int, float)):
            return float(valor)
        s = str(valor).strip().replace(",", ".")
        return float(s)
    except Exception:
        return 0.0
    
# ┌───────────────────────────────────┐
# │2) Funciones para formato de mapa  │
# └───────────────────────────────────┘

# Función que asigna el color por bins en base a datos de cortes y paleta.
def _asigna_color_por_bins(valor_pct, CORTES, PALETA):
    for i, (mn, mx) in enumerate(CORTES):
        if (valor_pct >= mn) and (valor_pct < mx or mx == CORTES[-1][1]):
            return PALETA[i]
    return PALETA[-1]  # Retorna el último color si no se encuentra un bin.

# Entrega los colores del mapa utilizados en el frontend.
def calcular_colores_mapa(dict_porcentajes, CORTES, PALETA):
    """
    dict_porcentajes: {"01": 0.73, ...}  (porcentajes en %)
    Devuelve {"01": "#xxxxxx", ...}
    """
    return {
        k: _asigna_color_por_bins(formato_chileno_prom(v), CORTES, PALETA)
        for k, v in dict_porcentajes.items()
    }

# Formatea el rango para la leyenda del mapa.
def _fmt_rango(mn, mx, ultimo):
    return f"≥ {mn:.2f}%" if ultimo else f"{mn:.2f}% – {mx:.2f}%"

# Construye la leyenda del mapa combinando los elementos
# definidos en funciones previas.
def construir_leyenda_mapa(titulo, CORTES, PALETA):
    bins = []
    for i, (mn, mx) in enumerate(CORTES):
        bins.append({
            "min": mn,
            "max": mx,
            "label": _fmt_rango(mn, mx, i == len(CORTES) - 1),
            "color": PALETA[i],
        })
    return {
        # Modificar el título en base a indicador acá.
        "titulo": titulo,
        "nota": "Valores en porcentaje.",
        "unidad": "%",
        "tipo": "discreto",
        "formato_tooltip": "{valor:.2f}%",
        "bins": bins,
    }