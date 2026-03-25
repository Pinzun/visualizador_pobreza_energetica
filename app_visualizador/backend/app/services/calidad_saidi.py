# services/calidad_saidi.py
from collections import defaultdict
from models import CalidadSaidi
from services.funciones_auxiliares import (formato_chileno, formato_chileno_prom,
                                           calcular_colores_mapa, construir_leyenda_mapa)

# A la fecha: 07-01-2026
# Formula del indicador:

# ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
# │                                                                                                                  │
# │                                                               Sumatoria de horas de interrupción del             │
# │    Duración de interrupciones del servicio eléctrico        servicio eléctrico por mes sin Fuerza Mayor          │
# │                        por comuna                       =     ─────────────────────────────────────              │
# │                                                                                  12                              │                                                                                                                         │ 
# └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

# ┌─────────────────────────────────────────────────────────────────────┐
# │ 1) Configuración básica para despliegue de datos                    │ 
# └─────────────────────────────────────────────────────────────────────┘

# Título del indicador.
titulo = "Duración de interrupciones del servicio eléctrico (horas/año)"

# Datos de corte del mapa (en horas).
CORTES = [
    (0.00, 0.50),
    (0.50, 0.75),
    (0.75, 1.00),
    (1.00, 1.25),
    (1.25, 500.00),  # abierto
]

# Paleta de colores para el mapa.
PALETA = [
    "#deebf7",  # valores bajos
    "#9ecae1",
    "#fcbba1",
    "#fb6a4a",
    "#cb181d",  # valores altos
]

def _calcular_saidi_datos_anuales(agrupacion_anio_comuna: dict) -> list[dict]:
    """Calcula los datos anuales de SAIDI a partir de una agrupación por año y comuna."""
    resultados = []
    for anio, comunas in agrupacion_anio_comuna.items():
        promedios_comunales = []
        total_saidi_sin_fm = 0
        total_fuerza_mayor = 0
        
        for registros in comunas.values():
            total_saidi = sum(r.SAIDI for r in registros)
            total_fm = sum(r.FUERZA_MAYOR for r in registros)
            saidi_sin_fm = total_saidi - total_fm
            promedio_comunal = saidi_sin_fm / len(registros) if registros else 0
            promedios_comunales.append(promedio_comunal)
            total_saidi_sin_fm += saidi_sin_fm
            total_fuerza_mayor += total_fm

        promedio = sum(promedios_comunales) / len(promedios_comunales) if promedios_comunales else 0

        resultados.append({
            "anio": anio,
            "promedio": promedio,
            "saidi_sin_fm_total": total_saidi_sin_fm,
            "fuerza_mayor_total": total_fuerza_mayor
        })
    
    return resultados

# ┌─────────────────────────────────────────────────────────────────────┐
# │ 2) Funciones auxiliares para retorno de datos                       │ 
# └─────────────────────────────────────────────────────────────────────┘

def _extraer_anos_disponibles(datos_calculados: list[dict]) -> list[int]:
    """Extrae los años disponibles del cálculo y los retorna ordenados."""
    return sorted([int(d["anio"]) for d in datos_calculados])

# Se define la función para obtener los datos de Saidi sin fuerza mayor.
def obtener_saidi_sin_fm(cut: int | str | None) -> dict:
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
        datos_nacionales = _calcular_saidi_datos_anuales(agrupacion_nacional)
        
        # Desglose regional para cada año.
        desglose_regional = {}
        for i in range(1, 17):
            cut_reg = i
            registros_region = [r for r in campos_saidi if r.CUT_REG == cut_reg]
            
            if registros_region:
                agrupacion_region = defaultdict(lambda: defaultdict(list))
                for r in registros_region:
                    agrupacion_region[r.ANIO][r.CUT_COM].append(r)
                
                datos_region = _calcular_saidi_datos_anuales(agrupacion_region)
                
                desglose_regional[str(cut_reg).zfill(2)] = {
                    str(d["anio"]): {
                        "saidi_sin_fm_total": formato_chileno(d["saidi_sin_fm_total"]),
                        "fm_total": formato_chileno(d["fuerza_mayor_total"]),
                        "promedio_regional_anual": formato_chileno_prom(d["promedio"])
                    }
                    for d in datos_region
                }
        
        # Formato para retorno nacional.
        resumen_nacional = {
            str(d["anio"]): {
                "saidi_sin_fm_total": formato_chileno(d["saidi_sin_fm_total"]),
                "fm_total": formato_chileno(d["fuerza_mayor_total"]),
                "promedio_nacional_anual": formato_chileno_prom(d["promedio"])
            }
            for d in datos_nacionales
        }
        
        # Extraer años disponibles.
        anos_disponibles = _extraer_anos_disponibles(datos_nacionales)
        
        # Calcular colores_mapa por año (basado en los promedios regionales para cada año).
        colores_mapa_por_ano = {}
        for anio in anos_disponibles:
            promedios_por_region = {}
            for cut_reg in range(1, 17):
                registros_region = [r for r in campos_saidi if r.CUT_REG == cut_reg and r.ANIO == anio]
                if registros_region:
                    agrupacion_region = defaultdict(lambda: defaultdict(list))
                    for r in registros_region:
                        agrupacion_region[r.ANIO][r.CUT_COM].append(r)
                    datos_region = _calcular_saidi_datos_anuales(agrupacion_region)
                    if datos_region:
                        promedio = datos_region[0]["promedio"]
                        promedios_por_region[str(cut_reg).zfill(2)] = promedio
            
            colores_mapa_por_ano[str(anio)] = calcular_colores_mapa(promedios_por_region, CORTES, PALETA)
        
        return {
            "anos_disponibles": anos_disponibles,
            "colores_mapa": colores_mapa_por_ano,
            "leyenda_mapa": construir_leyenda_mapa(titulo, CORTES, PALETA),
            "desglose_nacional_calidad_saidi": resumen_nacional,
            "desglose_regional_calidad_saidi": desglose_regional
        }

    # Cálculo de desglose regional o comunal.
    registros_saidi = []
    if len(str(cut)) <= 2:
        # Cálculo regional.
        registros_saidi = [r for r in campos_saidi if r.CUT_REG == cut]
    else:
        # Cálculo comunal.
        registros_saidi = [r for r in campos_saidi if r.CUT_COM == cut]

# Si no hay registros, retornar estructura vacía.
    if not registros_saidi:
        return {"desglose_calidad_saidi": {}}

    agrupacion_anio_comuna = defaultdict(lambda: defaultdict(list))
    for r in registros_saidi:
        agrupacion_anio_comuna[r.ANIO][r.CUT_COM].append(r)

    datos_calculados = _calcular_saidi_datos_anuales(agrupacion_anio_comuna)
    
    datos_fmt = {
        str(d["anio"]): {
            "saidi_sin_fm_total": formato_chileno(d["saidi_sin_fm_total"]),
            "fm_total": formato_chileno(d["fuerza_mayor_total"]),
            "promedio_anual": formato_chileno_prom(d["promedio"])
        }
        for d in datos_calculados
    }

    # Extraer años disponibles.
    anos_disponibles = _extraer_anos_disponibles(datos_calculados)
    
    # Calcular colores_mapa por año para el nivel regional/comunal.
    colores_mapa_por_ano = {}
    resultado_key = ""
    for anio in anos_disponibles:
        promedios_por_entidad = {}
        if len(str(cut)) <= 2:
            # Nivel regional: agrupar por comunas para este año
            registros_anio = [r for r in registros_saidi if r.ANIO == anio]
            comunas_unicas = set(r.CUT_COM for r in registros_anio)
            for cut_com in comunas_unicas:
                registros_com = [r for r in registros_anio if r.CUT_COM == cut_com]
                if registros_com:
                    agrupacion_com = defaultdict(lambda: defaultdict(list))
                    for r in registros_com:
                        agrupacion_com[r.ANIO][r.CUT_COM].append(r)
                    datos_com = _calcular_saidi_datos_anuales(agrupacion_com)
                    if datos_com:
                        promedio = datos_com[0]["promedio"]
                        promedios_por_entidad[str(cut_com)] = promedio
            resultado_key = "desglose_calidad_saidi_regional"
        else:
            # Nivel comunal: usar el promedio de la comuna para este año
            if datos_calculados:
                promedio_anio = next((d["promedio"] for d in datos_calculados if d["anio"] == anio), None)
                if promedio_anio is not None:
                    promedios_por_entidad[str(cut)] = promedio_anio
            resultado_key = "desglose_calidad_saidi_comunal"
        
        colores_mapa_por_ano[str(anio)] = calcular_colores_mapa(promedios_por_entidad, CORTES, PALETA)

    return {
        "anos_disponibles": anos_disponibles,
        "colores_mapa": colores_mapa_por_ano,
        "leyenda_mapa": construir_leyenda_mapa(titulo, CORTES, PALETA),
        resultado_key : datos_fmt,
    }




