# services/calidad_coccion.py
from models import (CalidadCenso, Casen, CasenComunaProvincia, ConfigFuentes)
from services.funciones_auxiliares import (formato_chileno, formato_chileno_prom,
                                           calcular_colores_mapa, construir_leyenda_mapa)
from sqlalchemy import func, case, and_

# A la fecha: 06-01-2026
# Formula del indicador:

# ┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
# │                                                                                                   │
# │                                                     N° de viviendas que utiliza comb.             │
# │                                                        contaminantes para cocinar                 │
# │    Combustibles contaminantes para cocción    =     ───────────────────────────────   x 100       │
# │                   residencial                            N° de viviendas totales                  │           
# │                                                                                                   │ 
# └───────────────────────────────────────────────────────────────────────────────────────────────────┘

# ┌───────────────────────────────────────────────────┐
# │ 1) Configuración básica para despliegue de datos  │ 
# └───────────────────────────────────────────────────┘

# Datos modificables para la configuración base acorde a los despliegues de cada indicador.

# Título del indicador.
titulo = "% de combustibles contaminantes utilizados por vivienda"

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

# ┌─────────────────────────────────────────┐
# │ 2) Cálculo para base de datos - CASEN   │ 
# └─────────────────────────────────────────┘

# Se define una función única (es decir, independiente del tipo de cut) que aglutina
# el filtrado y cálculo del indicador, siendo más fácil de mantener y modularizar.
def calcular_indicadores_casen(filtro, session):
    #Filtro completo, que incluye el factor del cut (nacional, regional, comunal) e
    # incluye solamente respuestas de los jefes de hogar.
    filtro_completo = and_(filtro, Casen.PCO1_A == 1)
    total_sinacceso = session.query(
        # Acá se define la sumatoria de los datos respectivos que indica la ficha,
        # que serían todos los valores 3 y 4 en la columna V34B.
        func.sum(
            case(
                (Casen.V34A.in_([3, 4]), Casen.EXPR),
                else_=0
            )    
        )
    #El filtro que se aplica acá es el que se recibe como parámetro para definir si
    # es un cálculo nacional, regional o comunal.
    ).filter(filtro_completo).scalar() or 0

    # Se calcula el total de viviendas ponderadas por el factor de expansión.
    total_viviendas = session.query(
        func.sum(Casen.EXPR)
    ).filter(filtro_completo).scalar() or 0

    # Se calcula el indicador, que es el porcentaje de viviendas sin acceso a electricidad
    # respecto al total de viviendas.
    indicador = total_sinacceso / total_viviendas * 100 if total_viviendas else None

    # Se retorna un diccionario con el indicador y los totales formateados.
    return {
        "indicador": formato_chileno_prom(indicador),
        "total_a": formato_chileno(total_sinacceso),
        "total_b": formato_chileno(total_viviendas)
    }

def calidad_tipo_combustible_casen(filtro, session):
     def _sum(col, valor):
        q = session.query(func.sum(case((col == valor, Casen.EXPR), else_=0)))
        if filtro is not True and filtro is not None:
               q = q.filter(filtro)
        return q.scalar() or 0
     
     gas_licuado = _sum(Casen.V34A, 1)
     gas_red = _sum(Casen.V34A, 2)
     paraf_petr = _sum(Casen.V34A, 3)
     deriv_lenia = _sum(Casen.V34A, 4)
     electricidad = _sum(Casen.V34A, 5)
     solar = _sum(Casen.V34A, 6)
     no_usa = _sum(Casen.V34A, 7)
     no_tiene = _sum(Casen.V34A, 8)

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

# Esta función retorna los datos en base al cut recibido, que puede ser un código
# regional o comunal; y, en el caso que sea None, retorna los datos a nivel nacional.
def obtener_calidad_coccion_casen(cut, session):
    resultados = {}

    if resultados.get("fuente") is None:
        try:
            resultados["fuente"] = ("CASEN" + " " + str(session.query(ConfigFuentes).first().anio_casen))
        except Exception:
            resultados["fuente"] = "CASEN"

    if cut is None:
        # En el caso del CUT nacional (None) se despliegan los datos del indicador
        # en base a las regiones. 
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
        resultados["tipo"] = calidad_tipo_combustible_casen(filtro_nacional, session)
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
            filtro_com = Casen.FOLIO.in_(folios_comuna)
            indicadores = calcular_indicadores_casen(filtro_com, session)
            porcentajes_por_comuna[str(cut_com)] = formato_chileno_prom(indicadores.get("indicador", 0))

        resultados["tipo"] = calidad_tipo_combustible_casen(filtro_regional, session)
        resultados["desglose"] = calcular_indicadores_casen(filtro_regional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_comuna, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)

    else:
        # Filtro comunal.
        folios = session.query(CasenComunaProvincia.FOLIO).filter(
            CasenComunaProvincia.CUT_COM == int(cut)
        ).all()
        folios_lista = [f[0] for f in folios]
        filtro = Casen.FOLIO.in_(folios_lista)
        resultados["tipo"] = calidad_tipo_combustible_casen(filtro, session)
        resultados["desglose"] = calcular_indicadores_casen(filtro, session)
    
    return resultados

# ┌─────────────────────────────────────────┐
# │ 4) Cálculo para base de datos - CENSO   │ 
# └─────────────────────────────────────────┘

# Se define una función única (es decir, independiente del tipo de cut) que aglutina
# el filtrado y cálculo del indicador, siendo más fácil de mantener y modularizar.
def calcular_indicadores_censo(filtro, session):
    total_sinacceso = session.query(
        # Acá se define la sumatoria de las columnas respectivas que indica la ficha,
        # que serían los combustibles de gas, parafina, leña, carbón y quienes no
        # declaren el tipo de combustible.
        func.sum(CalidadCenso.CO_GAS + CalidadCenso.CO_PARAFINA +
                 CalidadCenso.CO_LENIA + CalidadCenso.CO_CARBON +
                 CalidadCenso.CO_NO_DECLARA)
    #El filtro que se aplica acá es el que se recibe como parámetro para definir si
    # es un cálculo nacional, regional o comunal.
    ).filter(filtro).scalar() or 0

    # Se calcula el total de viviendas, que es la suma de la columna "TOTAL".
    total_viviendas = session.query(
        func.sum(CalidadCenso.TOTAL)
    ).filter(filtro).scalar() or 0

    # Se calcula el indicador, que es el porcentaje de viviendas sin acceso a electricidad
    # respecto al total de viviendas.
    indicador = total_sinacceso / total_viviendas * 100 if total_viviendas else None

    # Se retorna un diccionario con el indicador y los totales formateados.
    return {
        "indicador": formato_chileno_prom(indicador),
        "total_a": formato_chileno(total_sinacceso),
        "total_b": formato_chileno(total_viviendas)
    }

def calidad_tipo_combustible_censo(filtro, session):
    def _sum(col):
        q = session.query(func.sum(col))
        if filtro is not True and filtro is not None:
            q = q.filter(filtro)
        return q.scalar() or 0
    
    electricidad = _sum(CalidadCenso.CO_ELECTR)
    solar = _sum(CalidadCenso.CO_SOLAR)
    gas = _sum(CalidadCenso.CO_GAS)
    parafina = _sum(CalidadCenso.CO_PARAFINA)
    lenia = _sum(CalidadCenso.CO_LENIA)
    pellet = _sum(CalidadCenso.CO_PELLET)
    carbon = _sum(CalidadCenso.CO_CARBON)
    no_tiene = _sum(CalidadCenso.CO_NO_TIENE)
    no_declara = _sum(CalidadCenso.CO_NO_DECLARA)

    return {
        "electricidad": formato_chileno(electricidad),
        "solar": formato_chileno(solar),
        "gas": formato_chileno(gas),
        "parafina": formato_chileno(parafina),
        "lenia": formato_chileno(lenia),
        "pellet": formato_chileno(pellet),
        "carbon": formato_chileno(carbon),
        "no_tiene": formato_chileno(no_tiene),
        "no_declara": formato_chileno(no_declara),
    }

# ┌────────────────────────────────┐
# │  5) Retorno por CUT - CENSO    │ 
# └────────────────────────────────┘

# Esta función retorna los datos en base al CUT recibido, que puede ser un código
# regional o comunal; y, en el caso que sea None, retorna los datos a nivel nacional.
def obtener_calidad_coccion_censo(cut, session):
    resultados = {}

    if resultados.get("fuente") is None:
        try:
            resultados["fuente"] = ("CENSO" + " " + str(session.query(ConfigFuentes).first().anio_censo))
        except Exception:
            resultados["fuente"] = "CENSO"

    if cut is None:
        # En el caso del "filtro_nacional", retorna todos los datos.
        filtro_nacional = True  
        
        # Adicionalmente, a diferencia de los cut regionales y comunales, se obtiene
        # un desglose por regiones, que permite utilizar los datos para definirlo en
        # el frontend con el semaforo.
        regiones = session.query(CalidadCenso.CUT_REG).distinct().all()
        porcentajes_por_region = {}

        for reg in regiones:
            cut_reg = reg[0]
            filtro_reg = CalidadCenso.CUT_REG == cut_reg
            ind = calcular_indicadores_censo(filtro_reg, session)
            cod = str(cut_reg).zfill(2)
            porcentajes_por_region[cod] = formato_chileno_prom(ind.get("indicador", 0))

        resultados["tipo"] = calidad_tipo_combustible_censo(filtro_nacional, session)
        resultados["desglose"] = calcular_indicadores_censo(filtro_nacional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_region, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)

    elif len(str(cut)) <= 2:
        # En el caso del "filtro_nacional", retorna todos los datos.
        filtro_regional = CalidadCenso.CUT_REG == int(cut) 

        # Adicionalmente, a diferencia de los cut regionales y comunales, se obtiene
        # un desglose por regiones, que permite utilizar los datos para definirlo en
        # el frontend con el semaforo.
        comunas = session.query(CalidadCenso.CUT_COM).filter(
            CalidadCenso.CUT_REG == int(cut)).distinct().all()
        
        porcentajes_por_comuna = {}
        for com in comunas:
            cut_com = com[0]
            filtro_com = CalidadCenso.CUT_COM == cut_com
            ind = calcular_indicadores_censo(filtro_com, session)
            porcentajes_por_comuna[str(cut_com)] = formato_chileno_prom(ind.get("indicador", 0))
        
        # Se agrega desgloses y resultados de mapa de calor al retorno final.
        resultados["tipo"] = calidad_tipo_combustible_censo(filtro_regional, session)
        resultados["desglose"] = calcular_indicadores_censo(filtro_regional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_comuna, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)

    else:
        # Filtro comunal.
        filtro = CalidadCenso.CUT_COM == int(cut)
        resultados["tipo"] = calidad_tipo_combustible_censo(filtro, session)
        resultados["desglose"] = calcular_indicadores_censo(filtro, session)
    
    return resultados
