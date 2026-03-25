# services/acceso_agua_caliente.py
from models import (Casen,CasenComunaProvincia, ConfigFuentes)
from services.funciones_auxiliares import (formato_chileno, formato_chileno_prom,
                                           calcular_colores_mapa, construir_leyenda_mapa)
from sqlalchemy import func, case, and_

# A la fecha: 06-01-2026
# Fórmula del indicador:

# ┌────────────────────────────────────────────────────────────────────────────────────────────┐
# │                                                                                            │
# │                                             N° de viviendas sin Acceso a                   │
# │                                                    agua caliente                           │       
# │    Hogares sin acceso a sistemas de =      ───────────────────────────────   x 100         │
# │             agua caliente                      N° de viviendas totales                     │           
# │                                                                                            │ 
# └────────────────────────────────────────────────────────────────────────────────────────────┘

# ┌───────────────────────────────────────────────────┐
# │ 1) Configuración básica para despliegue de datos  │ 
# └───────────────────────────────────────────────────┘

# Datos modificables para la configuración base acorde a los despliegues de cada indicador.

# Título del indicador.
titulo = "% de hogares sin acceso a sistemas de agua caliente sanitaria"

# Datos de corte del mapa.
CORTES = [
    (0.00, 25.00),
    (25.00, 50.00),
    (50.00, 75.00),
    (75.00, 100.00),
    (100.00, 100.00), 
]

# Paleta de colores para el mapa
PALETA = [
    "#deebf7",  # valores bajos
    "#9ecae1",
    "#fcbba1",
    "#fb6a4a",
    "#cb181d",  # valores altos
]

# ┌───────────────────────────────────────┐
# │ 2) Cálculo para base de datos CASEN   │ 
# └───────────────────────────────────────┘

# Se define una función única (es decir, independiente del tipo de cut) que aglutina
# el filtrado y cálculo del indicador, siendo más fácil de mantener y modularizar.
def calcular_indicadores_casen(filtro, session):
    #Filtro completo, que incluye el factor del cut (nacional, regional, comunal) e
    # incluye solamente respuestas de los jefes de hogar.
    filtro_completo = and_(filtro, Casen.PCO1_A == 1)
    total_sinacceso = session.query(
        # Pondera por el factor de expansión (Casen.EXPR) para ir de muestra a población.
        func.sum(
            case(
                (Casen.V34C == 8, Casen.EXPR),
                else_=0
            )
        )
    ).filter(filtro_completo).scalar() or 0

    # Suma ponderada de viviendas por el mismo factor de expansión.
    total_viviendas = session.query(
        func.sum(Casen.EXPR)
    ).filter(filtro_completo).scalar() or 0

    # Porcentaje ponderado de viviendas sin acceso.
    indicador = total_sinacceso / total_viviendas * 100 if total_viviendas else None

    # Se retorna un diccionario con el indicador y los totales formateados.
    return {
        "indicador": formato_chileno_prom(indicador),
        "total_a": formato_chileno(total_sinacceso),
        "total_b": formato_chileno(total_viviendas)
    }

# Se define una función que obtiene los tipos de acceso a agua caliente, acorde a los
# datos establecidos en la encuesta Casen, realizando el filtro previo por el CUT y 
# por el valor asociado a cada respuesta.
def acceso_tipo_agua_casen(filtro, session):
    def _sum(col, valor):
        q = session.query(func.sum(case((col == valor, Casen.EXPR), else_=0)))
        if filtro is not True and filtro is not None:
            q = q.filter(filtro)
        return q.scalar() or 0
     
    gas_licuado = _sum(Casen.V34C, 1)
    gas_red = _sum(Casen.V34C, 2)
    paraf_petr = _sum(Casen.V34C, 3)
    deriv_lenia = _sum(Casen.V34C, 4)
    electricidad = _sum(Casen.V34C, 5)
    solar = _sum(Casen.V34C, 6)
    no_usa = _sum(Casen.V34C, 7)
    no_tiene = _sum(Casen.V34C, 8)

    return {
        "gas_licuado": formato_chileno(gas_licuado),
        "gas_red": formato_chileno(gas_red),
        "parafina_petr": formato_chileno(paraf_petr),
        "derivados_madera": formato_chileno(deriv_lenia),
        "electricidad": formato_chileno(electricidad),
        "solar": formato_chileno(solar),
        "no_usa": formato_chileno(no_usa),
        "no_tiene": formato_chileno(no_tiene)
    }

# ┌────────────────────────────────┐
# │  3) Retorno por CUT - CASEN    │ 
# └────────────────────────────────┘

# Esta función retorna los datos en base al CUT recibido, que puede ser un código
# regional o comunal; y, en el caso que sea None, retorna los datos a nivel nacional.
def obtener_acceso_agua_caliente_casen(cut, session):
    resultados = {}
    # Incorpora fuente de datos configurada
    if resultados.get("fuente") is None:
        try:
            resultados["fuente"] = ("CASEN" + " " + str(session.query(ConfigFuentes).first().anio_casen))
        except Exception:
            resultados["fuente"] = "CASEN"

    if cut is None:
        # En el caso del "filtro_nacional", retorna todos los datos.
        filtro_nacional = True  

        # Se realiza un filtro con las regiones para hacer el cálculo del mapa a nivel
        # regional.
        regiones = session.query(Casen.CUT_REG).distinct().all()
        desglose_regional = {}
        porcentajes_por_region = {}

        for reg in regiones:
            # Se obtiene el código de la región.
            cut_reg = reg[0]

# Se aplica el filtro por CUT.
            filtro = Casen.CUT_REG == cut_reg
            # Se aglutinan los datos para el mapa de calor a nivel nacional.
            ind = calcular_indicadores_casen(filtro, session)
            cod = str(cut_reg).zfill(2)
            desglose_regional[cod] = ind
            porcentajes_por_region[cod] = formato_chileno_prom(ind.get("indicador", 0))

        # Se calcula el mapa de calor a nivel nacional.
        resultados["tipo"] = acceso_tipo_agua_casen(filtro_nacional, session)
        resultados["desglose"] = calcular_indicadores_casen(filtro_nacional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_region, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)

    elif len(str(cut)) <= 2:
        # En el caso del CUT regional se despliegan los datos de la región,
        # junto al despliegue de porcentajes de la comuna.
        filtro_regional = Casen.CUT_REG == int(cut)
    
        # Para poder calcular los datos comunales, en el caso de la Casen, hay un
        # pequeño problema o "maña" que presenta actualmente, dado que se debe hacer
        # un query en ambas bases, y cruzar la información en base a los folios, que
        # son el único valor en comun que comparten amba data de la Casen.

        # Query de primera base (Casen):
        folios_region = session.query(Casen.FOLIO).filter(
             # Query en base a "cut" regional.
             Casen.CUT_REG == int(cut)
        ).all()
        folios_lista = [f[0] for f in folios_region]

# Query de segunda base (CasenComunaProvincia):
        folios_comunas = session.query(
            # Query en base a "cut" comunal y folio.
             CasenComunaProvincia.FOLIO,
             CasenComunaProvincia.CUT_COM
        ).filter(
            # Hace filtro por folios obtenidos en query de
            # base Casen.
             CasenComunaProvincia.FOLIO.in_(folios_lista)
        ).all()

        # Tras ambos query, hace un dict. con los folios,
        # a razón de utilizarlos para el cálculo de la
        # proporción.
        folios_por_comuna = {}
        for folio, cut_com in folios_comunas:
             folios_por_comuna.setdefault(cut_com, []).append(folio)

        # Cálculo de mapa de calor regional:
        porcentajes_por_comuna = {}
        for cut_com, folios_comuna in folios_por_comuna.items():
            filtro = Casen.FOLIO.in_(folios_comuna)
            indicadores = calcular_indicadores_casen(filtro, session)
            porcentajes_por_comuna[str(cut_com)] = formato_chileno_prom(indicadores.get("indicador", 0))

        # Se agrega desgloses y resultados de mapa de calor al retorno final.
        resultados["tipo"] = acceso_tipo_agua_casen(filtro_regional, session)
        resultados["desglose"] = calcular_indicadores_casen(filtro_regional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_comuna, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)

    else:
        # Filtro comunal.
        folios = session.query(CasenComunaProvincia.FOLIO).filter(
            CasenComunaProvincia.CUT_COM == int(cut)
        ).all()
        folios_lista = [f[0] for f in folios]
        filtro_comunal = Casen.FOLIO.in_(folios_lista)
        resultados["tipo"] = acceso_tipo_agua_casen(filtro_comunal, session)
        resultados["desglose"] = calcular_indicadores_casen(filtro_comunal, session)

    return resultados


