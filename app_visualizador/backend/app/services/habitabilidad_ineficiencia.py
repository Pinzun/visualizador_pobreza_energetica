# services/habtiabilidad_ineficiencia.py
from models import HabitabilidadIneficiencia
from services.funciones_auxiliares import (formato_chileno, formato_chileno_prom,
                                           calcular_colores_mapa, construir_leyenda_mapa)
from sqlalchemy import func, case, and_

# Cambios registrados a la fecha: 18-12-2025

# ┌───────────────────────────────────────────────────┐
# │ 1) Configuración básica para despliegue de datos  │ 
# └───────────────────────────────────────────────────┘

# Datos modificables para la configuración base acorde a los despliegues de cada indicador.

# Título del indicador.
titulo = "% de viviendas por normativa térmica vigente"

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
    total_censo2024 = session.query(func.sum(HabitabilidadIneficiencia.CENSO2024)).filter(filtro).scalar()
    total_2000_2006 = session.query(func.sum(HabitabilidadIneficiencia.TOTAL_2000_2006)).filter(filtro).scalar()
    total_2007_2024 = session.query(func.sum(HabitabilidadIneficiencia.TOTAL_2007_2024)).filter(filtro).scalar()

    # Checkeo de None para evitar errores en cálculos
    total_censo2024 = total_censo2024 or 0
    total_2000_2006 = total_2000_2006 or 0
    total_2007_2024 = total_2007_2024 or 0

    if total_censo2024 == 0:
        indicador = 0
    else:
        indicador = ((total_2000_2006 + total_2007_2024)/total_censo2024)

    return {
        "total_viviendas": formato_chileno(total_censo2024),
        "total_viviendas_reglamento": formato_chileno(total_2000_2006 + total_2007_2024),
        "porcentaje_eficiente": formato_chileno_prom(indicador)}

def obtener_valores_tabla(filtro, session):
    total_censo2024 = session.query(func.sum(HabitabilidadIneficiencia.CENSO2024)).filter(filtro).scalar()
    total_2000 = session.query(func.sum(HabitabilidadIneficiencia.TOTAL_2000)).filter(filtro).scalar()
    total_2000_2006 = session.query(func.sum(HabitabilidadIneficiencia.TOTAL_2000_2006)).filter(filtro).scalar()
    total_2007_2024 = session.query(func.sum(HabitabilidadIneficiencia.TOTAL_2007_2024)).filter(filtro).scalar()

    return {
        "total_censo2024": formato_chileno(total_censo2024),
        "total_2000": formato_chileno(total_2000),
        "total_2000_2006": formato_chileno(total_2000_2006),
        "total_2007_2024": formato_chileno(total_2007_2024),
    }

def obtener_indicador_ineficiencia(cut, session):
    resultados = {}
    filtro = None

    if cut is None:
        filtro = True  # Sin filtro, obtiene todos los datos
        regiones = session.query(HabitabilidadIneficiencia.CUT_REG).distinct().all()
        desglose_regional = {}
        porcentajes_por_region = {}

        for reg in regiones:
            cut_reg = reg[0]
            filtro_reg = HabitabilidadIneficiencia.CUT_REG == cut_reg
            ind = calcular_indicador(filtro_reg, session)
            cod = str(cut_reg).zfill(2)
            desglose_regional[cod] = ind
            # Toma el porcentaje (string) y lo parsea a float %
            porcentajes_por_region[cod] = formato_chileno_prom(ind.get("porcentaje_eficiente"))
        resultados["tipo_permiso"] = obtener_valores_tabla(filtro, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_region, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
        resultados["desglose"] = calcular_indicador(filtro, session)

    elif len(str(cut)) <= 2:
        filtro = HabitabilidadIneficiencia.CUT_REG == int(cut)
        comunas = session.query(HabitabilidadIneficiencia.CUT_COM).filter(HabitabilidadIneficiencia.CUT_REG == int(cut)).distinct().all()
        desglose_comunal = {}
        porcentajes_por_comuna = {}

        for com in comunas:
            cut_com = com[0]
            filtro_com = HabitabilidadIneficiencia.CUT_COM == cut_com
            ind = calcular_indicador(filtro_com, session)
            # Toma el porcentaje (string) y lo parsea a float %
            porcentajes_por_comuna[str(cut_com)] = formato_chileno_prom(ind.get("porcentaje_eficiente"))
        resultados["tipo"] = obtener_valores_tabla(filtro, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_comuna, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
        resultados["desglose"] = calcular_indicador(filtro, session)

    elif len(str(cut)) > 2:
        filtro = HabitabilidadIneficiencia.CUT_COM == int(cut)

        resultados["tipo"] = obtener_valores_tabla(filtro, session)
        resultados["desglose"] = calcular_indicador(filtro, session)

    return resultados


    
