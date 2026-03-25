# services/habtiabilidad_frio.py
from models import HabitabilidadFrio
from services.funciones_auxiliares import (formato_chileno, formato_chileno_prom,
                                           calcular_colores_mapa, construir_leyenda_mapa)
from sqlalchemy import func

# Cambios registrados a la fecha: 22-12-2025

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
    "#deebf7",  # valores bajos
    "#9ecae1",
    "#fcbba1",
    "#fb6a4a",
    "#cb181d",  # valores altos
]

# ┌─────────────────────────────────┐
# │ 2) Cálculo para base de datos   │ 
# └─────────────────────────────────┘

def calcular_indicador(filtro, session):
    total_frio = session.query(func.sum(HabitabilidadFrio.H_TOTAL_CON_FRIO)).filter(filtro).scalar()
    total_sinfrio = session.query(func.sum(HabitabilidadFrio.H_TOTAL_SIN_FRIO)).filter(filtro).scalar()

    indicador = total_frio/total_sinfrio*100

    return {
        "indicador": formato_chileno_prom(indicador),
        "total_a": formato_chileno(total_sinfrio),
        "total_b": formato_chileno(total_frio)}

def obtener_valores_tabla(filtro, session):
    total_frio = session.query(func.sum(HabitabilidadFrio.H_TOTAL_CON_FRIO)).filter(filtro).scalar()
    total_sinfrio = session.query(func.sum(HabitabilidadFrio.H_TOTAL_SIN_FRIO)).filter(filtro).scalar()

    return {
        "total_a": formato_chileno(total_sinfrio),
        "total_b": formato_chileno(total_frio)}

def obtener_indicador_frio(cut, session):
    resultados = {}
    filtro = None

    if cut is None:
        filtro = True  # Sin filtro, obtiene todos los datos
        regiones = session.query(HabitabilidadFrio.CUT_REG).distinct().all()
        desglose_regional = {}
        porcentajes_por_region = {}

        for reg in regiones:
            cut_reg = reg[0]
            filtro_reg = HabitabilidadFrio.CUT_REG == cut_reg
            ind = calcular_indicador(filtro_reg, session)
            cod = str(cut_reg).zfill(2)
            desglose_regional[cod] = ind
            # Toma el porcentaje (string) y lo parsea a float %
            porcentajes_por_region[cod] = formato_chileno_prom(ind.get("porcentaje_eficiente"))
        resultados["tipo"] = obtener_valores_tabla(filtro, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_region, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
        resultados["desglose"] = calcular_indicador(filtro, session)

    elif len(str(cut)) <= 2:
        filtro = HabitabilidadFrio.CUT_REG == int(cut)
        porcentaje_indicador = calcular_indicador(filtro, session)
        resultados["indicador"] = porcentaje_indicador
        resultados["tipo"] = obtener_valores_tabla(filtro, session)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
        resultados["desglose"] = calcular_indicador(filtro, session)

    # No habría desglose comunal, dado que los datos solo llegan al nivel de desagregación comunal

    return resultados


