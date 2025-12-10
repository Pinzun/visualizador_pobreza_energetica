# services/calidad_saidi.py
from collections import defaultdict
from models import CalidadSaidi
from services.dar_formato import (formato_chileno, formato_chileno_prom)

# A la fecha: 22-08-2025
# Información de contexto (modificar tras cambios, mantener indicadores actualizados):

# ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
# │   Agregué este cuadro de texto para seguimiento de cambios e información relevante sobre                         │
# │   el indicador, para facilitar su mantención y trazabilidad.                                                     │
# │                                                                                                                  │                                    
# │   Acorde a la ficha de indicadores del Visualizador de PE, el indicador es:                                      │
# │                                                                                                                  │
# │                                                               Sumatoria de horas de interrupción del             │
# │    Duración de interrupciones del servicio eléctrico        servicio eléctrico por mes sin Fuerza Mayor          │
# │                        por comuna                       =     ─────────────────────────────────────              │
# │                                                                                  12                              │           
# │                                                                                                                  │ 
# │   Para los desgloses regionales y anuales, se hace la sumatoria del indicador anterior, y se divide por la       │
# │   cantidad de comunas respectivas de la muestra (todas, en el caso de que sea nacional). También está la opción  │
# │   de hacer, para el nivel regional, una sumatoria de los valores de las regiones y dividirlo por la cantidad de  │
# │   la muestra (16).                                                                                               │
# └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

# Se define la función para obtener los datos de Sadi sin fuerza mayor.
def obtener_saidi_sin_fm(cut: int | str | None) -> list[dict]:
    campos_saidi = (
        CalidadSaidi.query
        .with_entities(
            CalidadSaidi.ANIO,
            CalidadSaidi.CUT_COM,
            CalidadSaidi.CUT_REG,
            CalidadSaidi.FUERZA_MAYOR,
            CalidadSaidi.SAIDI
        )
        # Este filtro aplica los años relevantes de cálculo acorde a lo conversado,
        # si se requiere otro rango, modificar aquí.
        .filter(CalidadSaidi.ANIO.between(2020, 2024))
        .all()
    )

    # Formateo del parámetro cut.
    cut = int(cut) if cut is not None else None

    # Cálculo de desglose nacional.
    if cut is None:
        agrupacion_nacional = defaultdict(lambda: defaultdict(list))
        for r in campos_saidi:
            agrupacion_nacional[r.ANIO][r.CUT_COM].append(r)

        # Cálculo de promedios nacionales.
        resultados_nacionales = []
        for anio, comunas in agrupacion_nacional.items():
            # Define variables para cálculo nacional.
            promedios_comunales = []
            total_saidi_sin_fm = 0
            total_fuerza_mayor = 0

            # Acá se hace el cálculo comunal y nacional, considerando que los
            # promedios comunales se usan para el cálculo nacional, y el formato
            # de la base concentra datos comunales.
            for registros_comuna in comunas.values():
                total_saidi = sum(r.SAIDI for r in registros_comuna)
                total_fm = sum(r.FUERZA_MAYOR for r in registros_comuna)
                saidi_sin_fm = total_saidi - total_fm
                promedio_comunal = saidi_sin_fm / len(registros_comuna) if registros_comuna else 0
                promedios_comunales.append(promedio_comunal)
                total_saidi_sin_fm += saidi_sin_fm
                total_fuerza_mayor += total_fm

            # Este promedio es solo referencial para tener un valor desglosado a nivel nacional. Si no es
            # relevante, se puede eliminar.
            promedio_nacional = sum(promedios_comunales) / len(promedios_comunales) if promedios_comunales else 0

            resultados_nacionales.append({
                "ANIO": anio,
                "PROMEDIO_NACIONAL": formato_chileno_prom(promedio_nacional),
                # Los datos de totales del Saidi y Fuerza Mayor pueden ser eliminados,
                # a menos que se requieran para otros análisis, o se incorporen en
                # alguna tabla del visualizador, dado que el foco es el indicador del
                # promedio.
                "SAIDI_SIN_FM_TOTAL": formato_chileno(total_saidi_sin_fm),
                "FUERZA_MAYOR_TOTAL_NACIONAL": formato_chileno(total_fuerza_mayor)
            })

        return resultados_nacionales

    # Cálculo de desglose regional o comunal.

    # Se aglutinan ambos cálculos dado que se manejan de forma similar, solo
    # diferenciando el filtro inicial que es el cut (región o comuna).
    registros_saidi = []
    if len(str(cut)) <= 2:
        # Cálculo regional.
        registros_saidi = [r for r in campos_saidi if r.CUT_REG == cut]
    else:
        # Cálculo comunal.
        registros_saidi = [r for r in campos_saidi if r.CUT_COM == cut]

    # Si no hay registros, retornar lista vacía, evitando errores al no haber
    # datos en las bases cargadas.
    if not registros_saidi:
        return []

    agrupacion_anio_comuna = defaultdict(lambda: defaultdict(list))
    for r in registros_saidi:
        agrupacion_anio_comuna[r.ANIO][r.CUT_COM].append(r)

    resultados = []
    for anio, comunas in agrupacion_anio_comuna.items():
        promedios_comunales = []
        total_saidi_sin_fm = 0
        total_fuerza_mayor = 0
        # Acá se hace el cálculo de las variables, dependiendo del
        # valor del cut, sea comunal o regional.
        for registros in comunas.values():
            total_saidi = sum(r.SAIDI for r in registros)
            total_fm = sum(r.FUERZA_MAYOR for r in registros)
            saidi_sin_fm = total_saidi - total_fm
            promedio_comunal = saidi_sin_fm / len(registros) if registros else 0
            promedios_comunales.append(promedio_comunal)
            total_saidi_sin_fm += saidi_sin_fm
            total_fuerza_mayor += total_fm

        # Fórmula corregida para el promedio regional/comunal.
        promedio_reg_com = sum(promedios_comunales) / len(promedios_comunales) if promedios_comunales else 0

        resultados.append({
            "ANIO": anio,
            "PROMEDIO_REG_COM": formato_chileno_prom(promedio_reg_com),
            # Al igual que en el cálculo nacional, estos totales pueden ser eliminados
            # si no son utilizados para el visualizador.
            "SAIDI_SIN_FM_TOTAL": formato_chileno(total_saidi_sin_fm),
            "FUERZA_MAYOR_TOTAL": formato_chileno(total_fuerza_mayor)
        })

    return resultados


