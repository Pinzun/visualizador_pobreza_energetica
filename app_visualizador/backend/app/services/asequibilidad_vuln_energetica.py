# services/asequibilidad_vuln_energetica.py
from models import AsequibilidadVulnerable
from services.funciones_auxiliares import (formato_chileno, formato_chileno_prom,
                                           calcular_colores_mapa, construir_leyenda_mapa)
from sqlalchemy import func

# Cambios registrados a la fecha: 27-02-2026

# ┌───────────────────────────────────────────────────┐
# │ 1) Configuración básica para despliegue de datos  │ 
# └───────────────────────────────────────────────────┘

# Datos modificables para la configuración base acorde a los despliegues de cada indicador.

# Título del indicador.
titulo = "comunas vulnerables por criterio eléctrico y social"

# Datos de corte del mapa.
CORTES = [
    (0.00, 0.25),
    (0.25, 0.50),
    (0.50, 0.75),
    (0.75, 1.00),
    (1.00, 100.00),  # abierto
]

# Paleta de colores para el mapa.
PALETA = [
    "#f7fbff",  # 0–0,25%
    "#c6dbef",  # 0,25–0,5%
    "#6baed6",  # 0,5–0,75%
    "#2171b5",  # 0,75–1%
    "#08306b",  # ≥1%
]

# ┌─────────────────────────────────┐
# │ 2) Cálculo para base de datos   │ 
# └─────────────────────────────────┘

def calcular_indicador(filtro, session):
    total_vulnerable = session.query(func.count()).select_from(AsequibilidadVulnerable).filter(
        filtro, AsequibilidadVulnerable.VULN_ENERGETICA == 1
    ).scalar() or 0
    total = session.query(func.count()).select_from(AsequibilidadVulnerable).filter(filtro).scalar() or 0

    indicador = (total_vulnerable / total * 100) if total else 0.0

    return {
        "total_comunas_vulnerables": formato_chileno(total_vulnerable),
        "total_comunas": formato_chileno(total),
        "porcentaje_vulnerables": formato_chileno_prom(indicador)}

def obtener_valores_tabla(filtro, session):
    total_vulnerable = session.query(func.count()).select_from(AsequibilidadVulnerable).filter(
        filtro, AsequibilidadVulnerable.VULN_ENERGETICA == 1
    ).scalar() or 0
    total_no_vulnerable = session.query(func.count()).select_from(AsequibilidadVulnerable).filter(
        filtro, AsequibilidadVulnerable.VULN_ENERGETICA == 0
    ).scalar() or 0

    return {
        "total_comunas_vulnerables": formato_chileno(total_vulnerable),
        "total_comunas_no_vulnerables": formato_chileno(total_no_vulnerable)}

def obtener_indicador_vulnerable(cut, session):
    resultados = {}
    filtro = None

    if cut is None:
        filtro = True  # Sin filtro, obtiene todos los datos
        regiones = session.query(AsequibilidadVulnerable.CUT_REG).distinct().all()
        desglose_regional = {}
        porcentajes_por_region = {}

        for reg in regiones:
            cut_reg = reg[0]
            filtro_reg = AsequibilidadVulnerable.CUT_REG == cut_reg
            ind = calcular_indicador(filtro_reg, session)
            cod = str(cut_reg)
            desglose_regional[cod] = ind
            # Toma el porcentaje (string) y lo parsea a float %
            porcentajes_por_region[cod] = formato_chileno_prom(ind.get("porcentaje_vulnerables"))
        resultados["tipo_permiso"] = obtener_valores_tabla(filtro, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_region, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
        resultados["desglose"] = calcular_indicador(filtro, session)

    elif len(str(cut)) <= 2:
        filtro = AsequibilidadVulnerable.CUT_REG == int(cut)
        comunas = session.query(AsequibilidadVulnerable.CUT_COM).filter(filtro).distinct().all()
        desglose_comunal = {}
        porcentajes_por_comuna = {}

        for com in comunas:
            cut_com = com[0]
            filtro_com = AsequibilidadVulnerable.CUT_COM == cut_com
            ind = calcular_indicador(filtro_com, session)
            cod = str(cut_com)
            desglose_comunal[cod] = ind
            # Toma el porcentaje (string) y lo parsea a float %
            porcentajes_por_comuna[cod] = formato_chileno_prom(ind.get("porcentaje_vulnerables"))

        resultados["tipo_permiso"] = obtener_valores_tabla(filtro, session)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
        resultados["desglose"] = calcular_indicador(filtro, session)

    elif len(str(cut)) > 2:
        filtro = AsequibilidadVulnerable.CUT_COM == int(cut)
        resultados["tipo_permiso"] = obtener_valores_tabla(filtro, session)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
        resultados["desglose"] = calcular_indicador(filtro, session)

    return resultados