# services/acceso_zonas_t.py
from models import AccesoZonasT, CalidadCenso
from services.funciones_auxiliares import (formato_chileno, formato_chileno_prom,
                                           calcular_colores_mapa, construir_leyenda_mapa)
from sqlalchemy import func, and_

# Cambios registrados a la fecha: 20-01-2026

# ┌───────────────────────────────────────────────────┐
# │ 1) Configuración básica para despliegue de datos  │ 
# └───────────────────────────────────────────────────┘

# Datos modificables para la configuración base acorde a los despliegues de cada indicador.

# Título del indicador.
titulo = "% hogares sin acceso a sist. de calefación en zonas térmicas frías"

# Datos de corte del mapa.
CORTES = [
    (0.00, 25.00),  # 0% a 25%
    (25.00, 50.00),
    (50.00, 75.00),
    (75.00, 100.00),
    (100.00, 100.00),  # abierto
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
    # Para poder calcular el indicador, primero debemos filtrar en base a las comunas que
    # pertenecen a zonas térmicas frías, que corresponden a cuando la columna ZONA_TERMICA_P es igual a:
    # D, E, F, G, H e I.

    # En estricto rigor, todas las regiones cuentan con una zona térmica fría, siendo relevante el valor
    # comunal más que el regional; pero, para razones de desplegar el dato en el mapa, se aplica el filtro
    # para calcular el indicador.

    # Para esto, se deben extraer los datos de zonas térmicas de la base "acceso_zonas_t", y luego cruzar
    # con los datos de habitabilidad del CENSO.
    # Normalize ZONA_TERMICA_P to uppercase to handle any case variations
    # Apply the filtro to the AccesoZonasT table to get the correct communes
    comunas_zonas_frias_query = session.query(AccesoZonasT.CUT_COM).filter(
        func.upper(AccesoZonasT.ZONA_TERMICA_P).in_(["D", "E", "F", "G", "H", "I"])
    )
    
    # Aplica el filtro externo a la misma tabla (AccesoZonasT).
    if filtro is not True and filtro is not None:
        comunas_zonas_frias_query = comunas_zonas_frias_query.filter(filtro)
    
    comunas_zonas_frias = comunas_zonas_frias_query.distinct().subquery()

    # Extraemos los datos de habitabilidad del CENSO para las comunas en zonas térmicas frías.
    total_sin_calefaccion = session.query(func.sum(CalidadCenso.CAL_NO_TIENE)).filter(
        CalidadCenso.CUT_COM.in_(comunas_zonas_frias)
    ).scalar()

    # Extraemos el total de personas de cada comuna.
    total_personas_zona_frias = session.query(func.sum(CalidadCenso.TOTAL)).filter(
        CalidadCenso.CUT_COM.in_(comunas_zonas_frias)
    ).scalar()

    # Calculamos el indicador dividiendo el total de personas sin calefacción por el total de personas.
    total_sin_calefaccion = total_sin_calefaccion or 0
    total_personas_zona_frias = total_personas_zona_frias or 0
    indicador = (total_sin_calefaccion / total_personas_zona_frias) * 100 if total_personas_zona_frias else 0

    return {
        "indicador": formato_chileno_prom(indicador),
        "total_a": formato_chileno(total_sin_calefaccion),
        "total_b": formato_chileno(total_personas_zona_frias)
    }


def obtener_valores_tabla(filtro, session):
    # Similar a la función anterior, pero solo para obtener los totales.
    # Normalize ZONA_TERMICA_P to uppercase to handle any case variations
    comunas_zonas_frias_query = session.query(AccesoZonasT.CUT_COM).filter(
        func.upper(AccesoZonasT.ZONA_TERMICA_P).in_(["D", "E", "F", "G", "H", "I"])
    )
    
    # Aplicar el filtro externo a la misma tabla (AccesoZonasT).
    if filtro is not True and filtro is not None:
        comunas_zonas_frias_query = comunas_zonas_frias_query.filter(filtro)
    
    comunas_zonas_frias = comunas_zonas_frias_query.distinct().subquery()

    total_sin_calefaccion = session.query(func.sum(CalidadCenso.CAL_NO_TIENE)).filter(
        CalidadCenso.CUT_COM.in_(comunas_zonas_frias)
    ).scalar()

    total_personas_zona_frias = session.query(func.sum(CalidadCenso.TOTAL)).filter(
        CalidadCenso.CUT_COM.in_(comunas_zonas_frias)
    ).scalar()
    
    total_sin_calefaccion = total_sin_calefaccion or 0
    total_personas_zona_frias = total_personas_zona_frias or 0

    return {
        "total_a": formato_chileno(total_sin_calefaccion),
        "total_b": formato_chileno(total_personas_zona_frias)}

def obtener_indicador_zonas_frias(cut, session):
    resultados = {}
    filtro = None

    if cut is None:
        filtro = True  # Sin filtro, obtiene todos los datos
        regiones = session.query(AccesoZonasT.CUT_REG).distinct().all()
        desglose_regional = {}
        porcentajes_por_region = {}

        for reg in regiones:
            cut_reg = reg[0] 
            filtro_reg = AccesoZonasT.CUT_REG == cut_reg
            ind = calcular_indicador(filtro_reg, session)
            cod = str(cut_reg).zfill(2)
            desglose_regional[cod] = ind
            # Toma el porcentaje (string) y lo parsea a float %
            porcentajes_por_region[cod] = ind.get("porcentaje_sin_calefaccion")
        resultados["tipo"] = obtener_valores_tabla(filtro, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_region, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
        resultados["desglose"] = calcular_indicador(filtro, session)

    elif len(str(cut)) <= 2:
        filtro = AccesoZonasT.CUT_REG == int(cut)
        
        # Obtener comunas de la región que están en zonas térmicas frías
        comunas = session.query(AccesoZonasT.CUT_COM).filter(
            AccesoZonasT.CUT_REG == int(cut),
            func.upper(AccesoZonasT.ZONA_TERMICA_P).in_(["D", "E", "F", "G", "H", "I"])
        ).distinct().all()
        
        desglose_comunal = {}
        porcentajes_por_comuna = {}

        for com in comunas:
            cut_com = com[0]

# Filtro para una comuna específica en AccesoZonasT
            filtro_com = AccesoZonasT.CUT_COM == cut_com
            ind = calcular_indicador(filtro_com, session)
            # Toma el porcentaje (string) y lo parsea a float %
            porcentajes_por_comuna[str(cut_com)] = ind.get("porcentaje_sin_calefaccion")
        
        resultados["tipo"] = obtener_valores_tabla(filtro, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_comuna, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
        resultados["desglose"] = calcular_indicador(filtro, session)

    elif len(str(cut)) > 2:
        # Filtro para una comuna específica
        filtro = AccesoZonasT.CUT_COM == int(cut)
        
        resultados["tipo"] = obtener_valores_tabla(filtro, session)
        resultados["desglose"] = calcular_indicador(filtro, session)

    return resultados

