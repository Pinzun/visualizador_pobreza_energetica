# services/habitabilidad_irrecuperable.py
from collections import defaultdict
from models import HabitabilidadCenso
from services.dar_formato import (formato_chileno, formato_chileno_prom)

# A la fecha: 22-08-2025
# Información de contexto (modificar tras cambios, mantener indicadores actualizados):

# ┌────────────────────────────────────────────────────────────────────────────────────────────┐
# │   Agregué este cuadro de texto para seguimiento de cambios e información relevante sobre   │
# │   el indicador, para facilitar su mantención y trazabilidad.                               │
# │                                                                                            │                                    
# │   Acorde a la ficha de indicadores del Visualizador de PE, el indicador es:                │
# │                                                                                            │
# │                                         Viviendas irrecuperables por                       │
# │                                                   comuna                                   │
# │    Viviendas en condicción    =      ───────────────────────────────                       │
# │      irrecuperable (PVI)                  N° de viviendas totales                          │           
# │                                                                                            │ 
# │   Por ahora, el indicador solo considera los valores del Censo, dado que la lógica de la   │
# │   Casen se encuentra sin formular con lo que solicita el indicador, como también no está   │
# │   considerada en la ficha la ser un indicador propio del Censo, así que es poco probable   │
# │   que se elabore una función complementaria.                                               │
# └────────────────────────────────────────────────────────────────────────────────────────────┘

# ┌───────────────────────────────────────┐
# │  1) Cálculo para base de datos CENSO  │ 
# └───────────────────────────────────────┘

def obtener_habitabilidad_irrecuperables(cut: int | str) -> dict:
    # Agrupamos las variables en una sola función que permita
    # llamar los indicadores en el caso de ser utilizados.
    campos_habitabilidad = [
            HabitabilidadCenso.CUT_REG, HabitabilidadCenso.CUT_PROV,
            HabitabilidadCenso.CUT_COM, HabitabilidadCenso.TOTAL,
            HabitabilidadCenso.VIV_IRRECUPERABLE
    ]

    # Filtro para CUT_REG y CUT_COM
    filtro = HabitabilidadCenso.CUT_REG if len(str(cut)) <= 2 else HabitabilidadCenso.CUT_COM

    # Utiliza filtro para segregar registros en base a CUT
    registros = (
        HabitabilidadCenso.query
        .with_entities(*campos_habitabilidad)
        .filter(filtro == int(cut))
        .all()
    )

    if not registros:
        return {}

    # Sumatoria de registros en base a filtro original
    conteo_viviendas = defaultdict(float)
    for registro in registros:
        for campo, valor in zip(campos_habitabilidad, registro):
            conteo_viviendas[campo.key] += float(valor or 0)

    return dict(conteo_viviendas)

# ┌──────────────────────────────────────────────────────────────────────────────┐
# │  2) Cálculo porcentaje de viviendas irrecuperables para base de datos CENSO  │ 
# └──────────────────────────────────────────────────────────────────────────────┘

# La fórmula es simple, dado que depende de la sumatoria total de viviendas definidas como
# irrecuperables acorde al CENSO, en base al filtro CUT aplicado anteriormente, dividido en
# la sumatoria total de viviendas dependiendo del filtro CUT utilizado.
def calcular_porcentaje_irrecuperables(conteo_viviendas: dict) -> dict:
    total_viviendas = conteo_viviendas.get("TOTAL", 0)
    total_irrecuperables = conteo_viviendas.get("VIV_IRRECUPERABLE", 0)

    # Se debería multiplicar por 100 el total de viviendas, en el caso que se quiera el dato
    # a nivel decimal o entero.
    porcentaje = (total_irrecuperables / total_viviendas*100) if total_viviendas > 0 else 0

    return {
        "porcentaje_irrecuperables": (porcentaje),
        "total_viviendas": formato_chileno((total_viviendas)),
        "total_irrecuperables": formato_chileno((total_irrecuperables))
    }
