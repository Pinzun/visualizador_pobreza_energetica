# services/asequibilidad_gasto_energ_p.py
from models import AsequibilidadData
from services.funciones_auxiliares import (formato_chileno, formato_chileno_prom,
                                             calcular_colores_mapa, construir_leyenda_macrozona)

# Cambios registrados a la fecha: 04-02-2026

# ┌───────────────────────────────────────────────────┐
# │ 1) Configuración básica para despliegue de datos  │ 
# └───────────────────────────────────────────────────┘

# Datos modificables para la configuración base acorde a los despliegues de cada indicador.

# Título del indicador.
titulo = "Division de regiones por macrozona"

# Datos de corte del mapa. A diferencia de otros indicadores, estos cortes identifican la macrozona
# cada valor, y no un  rango de valores.

# Así, solo existen 4 cortes, asociados a la macrozona norte, la macrozona metropolitana, la macrozona centro,
# y la macrozona sur.
CORTES = [
    (1,2),  # Macrozona Norte
    (2,3),  # Macrozona Metropolitana
    (3,4),  # Macrozona Centro
    (4,5),  # Macrozona Sur
]

# Paleta de colores para el mapa.
PALETA = [
    "#e41a1c",  # Macrozona Norte
    "#ffd92f",  # Macrozona Metropolitana
    "#8ecae6",  # Macrozona Centro
    "#b8e186",  # Macrozona Sur
]

# ┌─────────────────────────────────┐
# │ 2) Cálculo para base de datos   │
# └─────────────────────────────────┘

def calcular_indicador(filtro, session):
    # Columna usada: AsequibilidadData.GASTO_ENERG_P
    resultado = session.query(
        AsequibilidadData.GASTO_ENERG_P
    ).filter(filtro).scalar()

    # Checkeo de None para evitar errores en cálculos
    gasto_promedio = resultado or 0

    return {
        "indicador": formato_chileno_prom(gasto_promedio)
    }

def obtener_valores_tabla(filtro, session):
    # Para esta tabla, se desplegará el gasto promedio
    # por macrozona para ser desplegado en el frontend.

    # De igual forma, se extrae el primer valor de 
    # cada macrozona en ".json".
    
    # Obtener el primer valor para cada macrozona
    resultados = {}
    
    for macrozona in range(1, 5):  # Macrozonas 1-4
        macrozona_filtro = AsequibilidadData.MACROZONA == macrozona
        
        # Combinar con filtro recibido si no es None o True
        if filtro is not True and filtro is not None:
            macrozona_filtro = filtro & macrozona_filtro
        
        resultado = session.query(
            AsequibilidadData.GASTO_ENERG_P,
            AsequibilidadData.CUT_REG
        ).filter(macrozona_filtro).first()
        
        if resultado:
            gasto_prom, cut_reg = resultado
            resultados[str(macrozona)] = {
                "indicador": formato_chileno(gasto_prom)
            }
    
    return resultados

def obtener_indicador_gasto_energ_p(filtro, session):
    # A diferencia de los otros indicadores, la función para obtener los valores
    # del indicador por región es esencial, dado que permite pintar adecudadamente
    # el mapa con los colores de las macrozonas. Para esto, se utiliza la función de
    # calculo de colores del mapa.
    resultados = {}

    # Obtener la tabla de valores por macrozona
    tabla_valores = obtener_valores_tabla(filtro, session)
    
    # Construir diccionario de CUT_REG -> macrozona para colorear
    dict_cut_reg_colors = {}
    query = session.query(
        AsequibilidadData.CUT_REG,
        AsequibilidadData.MACROZONA
    )
    if filtro is not True and filtro is not None:
        query = query.filter(filtro)
    for cut_reg, macrozona in query.distinct().all():
        cut_reg_str = str(cut_reg).zfill(2)  # Asegurar formato de 2 dígitos
        dict_cut_reg_colors[cut_reg_str] = macrozona
    
    # Calcular colores del mapa usando los valores de macrozona (1-4)
    colores_mapa = calcular_colores_mapa(dict_cut_reg_colors, CORTES, PALETA)

    resultados["leyenda_mapa"] = construir_leyenda_macrozona(titulo, PALETA)
    resultados["colores_mapa"] = colores_mapa
    resultados["colores"] = colores_mapa
    resultados["desglose"] = tabla_valores

    return resultados


