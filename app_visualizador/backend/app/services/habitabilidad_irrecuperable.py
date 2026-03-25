# services/habitabilidad_irrecuperable.py
from collections import defaultdict
from models import (HabitabilidadCenso, ConfigFuentes)
from services.funciones_auxiliares import (formato_chileno, formato_chileno_prom,
                                           calcular_colores_mapa, construir_leyenda_mapa)
from sqlalchemy import func, case, and_

# A la fecha: 05-01-2026
# Fórmula del indicador:

# ┌──────────────────────────────────────────────────────────────────────────────────────┐
# │                                         Viviendas irrecuperables por                 │
# │                                                   comuna                             │
# │    Viviendas en condicción    =      ───────────────────────────────                 │
# │      irrecuperable (PVI)                  N° de viviendas totales                    │           
# │                                                                                      │ 
# └──────────────────────────────────────────────────────────────────────────────────────┘

# ┌───────────────────────────────────────────────────┐
# │ 1) Configuración básica para despliegue de datos  │ 
# └───────────────────────────────────────────────────┘

# Datos modificables para la configuración base acorde a los despliegues de cada indicador.

# Cortes/Paleta para el mapa (en %).

titulo = "% de viviendas en calidad de irrecuperables"

CORTES = [
    (0.00, 0.25),
    (0.25, 0.50),
    (0.50, 0.75),
    (0.75, 1.00),
    (1.00, 100.00), 
]

# Paleta de colores para el mapa
PALETA = [
    "#f7fbff",  # 0.00 - 0.25
    "#c6dbef",  # 0.25 - 0.50
    "#6baed6",  # 0.50 - 0.75
    "#2171b5",  # 0.75 - 1.00
    "#08306b",  # 1.00 - 100.00
]

# ┌───────────────────────────────────────┐
# │  2) Cálculo para base de datos CENSO  │ 
# └───────────────────────────────────────┘

def calcular_indicadores_censo(filtro, session):
    total_irrecuperables = session.query(
        func.sum(HabitabilidadCenso.VIV_IRRECUPERABLE)
    ).filter(filtro).scalar() or 0

    total_viviendas = session.query(
        func.sum(HabitabilidadCenso.TOTAL)
    ).filter(filtro).scalar() or 0

    indicador = total_irrecuperables / total_viviendas * 100 if total_viviendas else None

    return {
        "indicador": formato_chileno_prom(indicador),
        "total_a": formato_chileno(total_irrecuperables),
        "total_b": formato_chileno(total_viviendas)
    }

def obtener_habitabilidad_irrecuperables(cut, session):
    resultados = {}

    if resultados.get("fuente") is None:
        try:
            resultados["fuente"] = ("CENSO" + " " + str(session.query(ConfigFuentes).first().anio_censo))
        except Exception:
            resultados["fuente"] = "CENSO"

    if cut is None:
    # Cálculo a nivel nacional.
        filtro_nacional = True

        regiones = session.query(HabitabilidadCenso.CUT_REG).distinct().all()
        porcentajes_por_region = {}

        for reg in regiones:
            cut_reg = reg[0]
            filtro_reg = HabitabilidadCenso.CUT_REG == cut_reg
            ind = calcular_indicadores_censo(filtro_reg, session)
            cod = str(cut_reg).zfill(2)
            porcentajes_por_region[cod] = formato_chileno_prom(ind.get("indicador", 0))

        resultados["desglose"] = calcular_indicadores_censo(filtro_nacional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_region, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)

    elif len(str(cut)) <= 2:
        filtro_regional = HabitabilidadCenso.CUT_REG == int(cut) 

        # Adicionalmente, a diferencia de los cut regionales y comunales, se obtiene
        # un desglose por regiones, que permite utilizar los datos para definirlo en
        # el frontend con el semaforo.
        comunas = session.query(HabitabilidadCenso.CUT_COM).filter(
            HabitabilidadCenso.CUT_REG == int(cut)).distinct().all()
        
        porcentajes_por_comuna = {}
        for com in comunas:
            cut_com = com[0]
            filtro_com = HabitabilidadCenso.CUT_COM == cut_com
            ind = calcular_indicadores_censo(filtro_com, session)
            porcentajes_por_comuna[str(cut_com)] = formato_chileno_prom(ind.get("porcentaje", 0))
        
        # Se agrega desgloses y resultados de mapa de calor al retorno final.
        resultados["desglose"] = calcular_indicadores_censo(filtro_regional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_comuna, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)

    else:
        # Filtro comunal.
        filtro = HabitabilidadCenso.CUT_COM == int(cut)
        resultados["desglose"] = calcular_indicadores_censo(filtro, session)

    return resultados