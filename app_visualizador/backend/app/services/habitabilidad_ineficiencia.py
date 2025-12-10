# services/habtiabilidad_ineficiencia.py
from models import HabitabilidadCenso, HabitabilidadIneficiencia
from services.dar_formato import (formato_chileno, formato_chileno_prom)
from sqlalchemy import func

# EN STAND BY - VERSIÓN SIN REVISAR DEL SERVICIO

# Dado que la base de datos de permisos es GIGANTE tanto en datos como en peso, se utilizó SQLAlchemy
# para poder hacer los cálculos. El servicio se encarga de procesar el dato en su totalidad, sin dar
# responsabilidades adicionales a la ruta (como aplicar formato o calcular cualquier dato) que no sea
# desplegar la información que se genere acá.

# Considerando que esto establece mayor modularidad, es decir, define de forma concreta todas las fun-
# ciones en un solo script, y deja el rol de desplegar información en la API a la ruta, podría ser una
# buena idea migrar otros indicadores a SQLAlchemy; o, al menos, adoptar la lógica previamente comentada.

#       ┌─────────────────────────────────────────────────────────────────┐
#       │  1) Caso sin CUT - CENSO = Indica desglose nacional y regional  │ 
#       └─────────────────────────────────────────────────────────────────┘

def obtener_indicador_ineficiencia(cut, session):
    # Definimos los rangos de años
    rangos = {
        "rt1_rt2": list(range(2000, 2008)),   # 2000 a 2007
        "rt2_pda": list(range(2007, 2016)),   # 2007 a 2015
        "pda_rt3": list(range(2015, 2026))    # 2015 a 2025
    }

    # Filtros según si es regional o comunal
    if cut:
        if len(cut) <= 2:
            # Hace filtro en base a cut_reg
            filtro_viv = HabitabilidadCenso.CUT_REG == int(cut)
            filtro_perm = HabitabilidadIneficiencia.CUT_REG == int(cut)
        else:
            # Hace filtro en base a cut_com
            filtro_viv = HabitabilidadCenso.CUT_COM == int(cut)
            filtro_perm = HabitabilidadIneficiencia.CUT_COM == int(cut)

        # Consulta todas las viviendas y permisos disponibles
        viviendas = session.query(
        # Hace query por año y viviendas
            HabitabilidadCenso.ANIO,
            func.sum(HabitabilidadCenso.TOTAL).label('total_viviendas')
            ).filter(filtro_viv).group_by(HabitabilidadCenso.ANIO).all()

        permisos = session.query(
        # Hace query por año y permisos
        HabitabilidadIneficiencia.ANIO,
        func.count(HabitabilidadIneficiencia.id).label('total_permisos')
        ).filter(filtro_perm).group_by(HabitabilidadIneficiencia.ANIO).all()

        # Convertimos a diccionarios para facilitar el acceso
        viviendas_dict = {r[0]: r[1] for r in viviendas}
        permisos_dict = {r[0]: r[1] for r in permisos}

        resultado_por_rango = {}

        for nombre_rango, años in rangos.items():
            # Hace la sumatoria de cada variable en base a los rangos de años previamente definidos.
            total_permisos = sum(permisos_dict.get(a, 0) for a in años)
            viviendas_en_rango = [viviendas_dict.get(a, 0) for a in años if viviendas_dict.get(a, 0) > 0]
            # Calcula el promedio de viviendas en base a las sumatorias previas.
            promedio_viviendas = sum(viviendas_en_rango) / len(viviendas_en_rango) if viviendas_en_rango else 0

            indicador = total_permisos / promedio_viviendas if promedio_viviendas else None

            resultado_por_rango[nombre_rango] = {
                # Devuelve la información en formato json, considerando el rango de años definido, el total
                # de permisos en el rango, el promedio calculado para viviendas, y el promedio de viviendas
                # ineficientes térmicamente, acorde al indicador desplegado.
                "total_permisos": formato_chileno(total_permisos),
                "promedio_viviendas": formato_chileno(promedio_viviendas),
                "promedio_ineficientes": formato_chileno_prom(indicador)
            }
        
        return resultado_por_rango
    
    else:
        
# Lógica nacional + desglose regional
        resultado_por_rango = {}

        for nombre_rango, años in rangos.items():
            # Viviendas por región
            viviendas_por_region = session.query(
                HabitabilidadCenso.CUT_REG,
                HabitabilidadCenso.ANIO,
                func.sum(HabitabilidadCenso.TOTAL).label('total_viviendas')
            ).filter(HabitabilidadCenso.ANIO.in_(años)).group_by(HabitabilidadCenso.CUT_REG, HabitabilidadCenso.ANIO).all()

            # Permisos por región
            permisos_por_region = session.query(
                HabitabilidadIneficiencia.CUT_REG,
                HabitabilidadIneficiencia.ANIO,
                func.count(HabitabilidadIneficiencia.id).label('total_permisos')
            ).filter(HabitabilidadIneficiencia.ANIO.in_(años)).group_by(HabitabilidadIneficiencia.CUT_REG, HabitabilidadIneficiencia.ANIO).all()

            # Agrupamos por región
            viviendas_regionales = {}
            for reg, anio, total in viviendas_por_region:
                reg = str(reg).zfill(2)
                viviendas_regionales.setdefault(reg, []).append(total)

            permisos_regionales = {}
            for reg, anio, total in permisos_por_region:
                reg = str(reg).zfill(2)
                permisos_regionales.setdefault(reg, 0)
                permisos_regionales[reg] += total

            desglose_regional = {}
            total_viv_nacional = 0
            total_perm_nacional = 0

            for region in viviendas_regionales:
                vivs = viviendas_regionales[region]
                prom_vivs = sum(vivs) / len(vivs) if vivs else 0
                perms = permisos_regionales.get(region, 0)
                indicador = perms / prom_vivs if prom_vivs else None

                desglose_regional[region] = {
                    "promedio_ineficientes": formato_chileno_prom(indicador) if indicador is not None else "N/A",
                    "total_permisos": formato_chileno(perms),
                    "promedio_viviendas": formato_chileno(prom_vivs)
                }

                total_viv_nacional += prom_vivs
                total_perm_nacional += perms

            indicador_nacional = total_perm_nacional / total_viv_nacional if total_viv_nacional else None

            resultado_por_rango[nombre_rango] = {
                "rango_años": f"{años[0]}–{años[-1]}",
                "desglose_nacional_habitabilidad_ineficiencia": {
                    "promedio_ineficientes": formato_chileno_prom(indicador_nacional) if indicador_nacional is not None else "N/A",
                    "total_permisos": formato_chileno(total_perm_nacional),
                    "promedio_viviendas": formato_chileno(total_viv_nacional)
                },
                "desglose_regional_habitabilidad_ineficiencia": desglose_regional
            }

        return resultado_por_rango
