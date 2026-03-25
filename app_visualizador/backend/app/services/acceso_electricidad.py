# services/acceso_electricidad.py
from models import (AccesoCenso, Casen, CasenComunaProvincia, ConfigFuentes)
from services.funciones_auxiliares import (formato_chileno, formato_chileno_prom,
                                           construir_leyenda_mapa, calcular_colores_mapa)
from sqlalchemy import func, case, and_

# A la fecha: 07-01-2026
# Formula del indicador:

# ┌────────────────────────────────────────────────────────────────────────────────────────────┐
# │                                                                                            │
# │                                             N° de viviendas sin Electricidad               │       
# │    Hogares sin acceso a electricidad =      ───────────────────────────────   x 100        │
# │                                                 N° de viviendas totales                    │           
# │                                                                                            │ 
# └────────────────────────────────────────────────────────────────────────────────────────────┘

# ┌───────────────────────────────────────────────────┐
# │ 1) Configuración básica para despliegue de datos  │ 
# └───────────────────────────────────────────────────┘

# Datos modificables para la configuración base acorde a los despliegues de cada indicador.

# Título del indicador.
titulo = "% de hogares sin acceso a electricidad"

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

def calcular_indicadores_casen(filtro, session):
    filtro_completo = and_(filtro, Casen.PCO1_A == 1)
    total_sinacceso = session.query(
        func.sum(
            case(
                (Casen.V24 == 8 , Casen.EXPR), 
                else_=0)
        )
    ).filter(filtro_completo).scalar() or 0

    total_viviendas = session.query(
        func.sum(Casen.EXPR)
    ).filter(filtro_completo).scalar() or 0

    indicador = total_sinacceso / total_viviendas * 100 if total_viviendas else None

    return {
        "porcentaje": formato_chileno_prom(indicador),
        "total_a": formato_chileno(total_sinacceso),
        "total_b": formato_chileno(total_viviendas)
    }

def acceso_tipo_electricidad_casen(filtro, session):
    def _sum(col, valor):
        q = session.query(func.sum(case((col == valor, Casen.EXPR), else_=0)))
        if filtro is not True and filtro is not None:
            q = q.filter(filtro)
        return q.scalar() or 0

    red_med_propio = _sum(Casen.V24, 1)
    red_med_compartido = _sum(Casen.V24, 2)
    red_sin_med = _sum(Casen.V24, 3)
    red_y_gen_propio = _sum(Casen.V24, 4)
    red_y_gen_compartido = _sum(Casen.V24, 5)
    gen_propio = _sum(Casen.V24, 6)
    gen_comunitario = _sum(Casen.V24, 7)
    no_tiene = _sum(Casen.V24, 8)

    return {
        "red_med_propio": formato_chileno(red_med_propio),
        "red_med_compartido": formato_chileno(red_med_compartido),
        "red_publica_sin_medidor": formato_chileno(red_sin_med),
        "red_publica_y_generador_propio": formato_chileno(red_y_gen_propio),
        "red_publica_y_generador_compartido": formato_chileno(red_y_gen_compartido),
        "generador_propio": formato_chileno(gen_propio),
        "generador_comunitario": formato_chileno(gen_comunitario),
        "no_tiene": formato_chileno(no_tiene)
    }

# ┌────────────────────────────────┐
# │  2) Retorno por CUT - CASEN    │ 
# └────────────────────────────────┘

def obtener_acceso_electricidad_casen(cut, session):
    resultados = {}

    if resultados.get("fuente") is None:
        try:
            resultados["fuente"] = ("CASEN" + " " +str(session.query(ConfigFuentes).first().anio_casen))
        except Exception:
            resultados["fuente"] = "CASEN"

    if cut is None:
        filtro_nacional = True  
        
        regiones = session.query(Casen.CUT_REG).distinct().all()
        desglose_regional = {}
        # Construiremos un dict. con % para colorear el mapa.
        porcentajes_por_region = {}

        for reg in regiones:
            cut_reg = reg[0]
            filtro_reg = Casen.CUT_REG == cut_reg
            ind = calcular_indicadores_casen(filtro_reg, session)
            cod = str(cut_reg).zfill(2)
            desglose_regional[cod] = ind
            # Toma el porcentaje (string) y lo parsea a float %
            porcentajes_por_region[cod] = formato_chileno_prom(ind.get("porcentaje"))

        resultados["tipo_energetico"] = acceso_tipo_electricidad_casen(filtro_nacional, session)
        resultados["desglose"] = calcular_indicadores_casen(filtro_nacional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_region, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)

    elif len(str(cut)) <= 2:
        filtro_regional = Casen.CUT_REG == int(cut)
        # Folios para desagregar a comuna
        folios_region = session.query(Casen.FOLIO).filter(Casen.CUT_REG == int(cut)).all()
        folios_lista = [f[0] for f in folios_region]
        
        folios_comunas = session.query(
            CasenComunaProvincia.FOLIO,
            CasenComunaProvincia.CUT_COM
        ).filter(
            CasenComunaProvincia.FOLIO.in_(folios_lista)
        ).all()

        folios_por_comuna = {}
        for folio, cut_com in folios_comunas:
            folios_por_comuna.setdefault(cut_com, []).append(folio)

        porcentajes_por_comuna = {}
        for cut_com, folios_comuna in folios_por_comuna.items():
            filtro_com = Casen.FOLIO.in_(folios_comuna)
            indicadores = calcular_indicadores_casen(filtro_com, session)
            porcentajes_por_comuna[str(cut_com)] = formato_chileno_prom(indicadores.get("porcentaje"))

        resultados["tipo_energetico"] = acceso_tipo_electricidad_casen(filtro_regional, session)
        resultados["desglose"] = calcular_indicadores_casen(filtro_regional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_comuna, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)


    else:
        folios = session.query(CasenComunaProvincia.FOLIO).filter(
            CasenComunaProvincia.CUT_COM == int(cut)
        ).all()
        folios_lista = [f[0] for f in folios]
        filtro_com = Casen.FOLIO.in_(folios_lista)
        resultados["tipo"] = acceso_tipo_electricidad_casen(filtro_com, session)
        resultados["desglose"] = calcular_indicadores_casen(filtro_com, session)

    return resultados

# ┌─────────────────────────────────────────┐
# │ 3) Cálculo para base de datos - CENSO   │ 
# └─────────────────────────────────────────┘

def calcular_indicadores_censo(filtro, session):
    total_sinacceso = session.query(
        func.sum(AccesoCenso.ELEC_NO_TIENE + AccesoCenso.ELEC_NO_DECLARA)
    ).filter(filtro).scalar() or 0

    total_viviendas = session.query(
        func.sum(AccesoCenso.TOTAL)
    ).filter(filtro).scalar() or 0

    indicador = total_sinacceso / total_viviendas * 100 if total_viviendas else None

    return {
        "indicador": formato_chileno_prom(indicador),
        "total_a": formato_chileno(total_sinacceso),
        "total_b": formato_chileno(total_viviendas)
    }

def acceso_tipo_energetico_censo(filtro, session):
    # para evitar .filter(True), opcionalmente puedes chequear:
    def _sum(col):
        q = session.query(func.sum(col))
        if filtro is not True and filtro is not None:
            q = q.filter(filtro)
        return q.scalar() or 0

    red_electrica = _sum(AccesoCenso.ELEC_RED)
    generador     = _sum(AccesoCenso.ELEC_GENERADOR)
    solar         = _sum(AccesoCenso.ELEC_SOLAR)
    eolica        = _sum(AccesoCenso.ELEC_EOLICA)
    otro          = _sum(AccesoCenso.ELEC_OTRO)
    no_tiene      = _sum(AccesoCenso.ELEC_NO_TIENE)
    no_declara    = _sum(AccesoCenso.ELEC_NO_DECLARA)

    return {
        "red_electrica": formato_chileno(red_electrica),
        "generador":     formato_chileno(generador),
        "solar":         formato_chileno(solar),
        "eolica":        formato_chileno(eolica),
        "otro":          formato_chileno(otro),
        "no_tiene":      formato_chileno(no_tiene),
        "no_declara":    formato_chileno(no_declara),
    }

# ┌───────────────────────────────┐
# │  4) Filtro por CUT - CENSO    │ 
# └───────────────────────────────┘

def obtener_acceso_electricidad_censo(cut, session):
    resultados = {}

    if resultados.get("fuente") is None:
        try:
            resultados["fuente"] = ("CENSO" + " " + str(session.query(ConfigFuentes).first().anio_censo))
        except Exception:
            resultados["fuente"] = "CENSO"

    if cut is None:
        filtro_nacional = True

        regiones = session.query(AccesoCenso.CUT_REG).distinct().all()
        porcentajes_por_region = {}

        for reg in regiones:
            cut_reg = reg[0]
            filtro_reg = AccesoCenso.CUT_REG == cut_reg
            ind = calcular_indicadores_censo(filtro_reg, session)
            cod = str(cut_reg).zfill(2)  # nacional sí usa "01".."16"
            porcentajes_por_region[cod] = formato_chileno_prom(ind.get("indicador"))

        resultados["desglose"] = calcular_indicadores_censo(filtro_nacional, session)
        resultados["tipo"] = acceso_tipo_energetico_censo(filtro_nacional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_region, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)

    elif len(str(cut)) <= 2:
        filtro_regional = AccesoCenso.CUT_REG == int(cut)

        comunas = session.query(AccesoCenso.CUT_COM).filter(
            AccesoCenso.CUT_REG == int(cut)
        ).distinct().all()

        porcentajes_por_comuna = {}
        for com in comunas:
            cut_com = com[0]
            filtro_com = AccesoCenso.CUT_COM == cut_com
            ind = calcular_indicadores_censo(filtro_com, session)
            porcentajes_por_comuna[str(cut_com)] = formato_chileno_prom(ind.get("indicador"))

        resultados["tipo"] = acceso_tipo_energetico_censo(filtro_regional, session)
        resultados["desglose"] = calcular_indicadores_censo(filtro_regional, session)
        resultados["colores_mapa"] = calcular_colores_mapa(porcentajes_por_comuna, CORTES, PALETA)
        resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
        
    else:
        filtro_comunal = AccesoCenso.CUT_COM == int(cut)
        resultados["tipo"] = acceso_tipo_energetico_censo(filtro_comunal, session)
        resultados["desglose"] = calcular_indicadores_censo(filtro_comunal, session)

    return resultados