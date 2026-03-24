# services/asequibilidad_med_nac_doble.py
from models import AsequibilidadData
from services.funciones_auxiliares import (
	formato_chileno,
	formato_chileno_prom,
	calcular_colores_mapa,
	construir_leyenda_mapa,
)

# Cambios registrados a la fecha: 04-02-2026

# ┌───────────────────────────────────────────────────┐
# │ 1) Configuración básica para despliegue de datos  │
# └───────────────────────────────────────────────────┘

# Datos modificables para la configuración base acorde a los despliegues de cada indicador.

# Título del indicador.
titulo = "División de regiones por macrozona ()"

# Datos de corte del mapa. A diferencia de otros indicadores, estos cortes identifican la macrozona
# cada valor, y no un  rango de valores.

# Así, solo existen 4 cortes, asociados a la macrozona norte, la macrozona metropolitana, la macrozona centro,
# y la macrozona sur.
CORTES = [
	(1, 2),  # Macrozona Norte
	(2, 3),  # Macrozona Metropolitana
	(3, 4),  # Macrozona Centro
	(4, 5),  # Macrozona Sur
]

# Paleta de colores para el mapa.
PALETA = [
	"#fee5d9",  # Macrozona Norte
	"#fcae91",  # Macrozona Metropolitana
	"#fb6a4a",  # Macrozona Centro
	"#cb181d",  # Macrozona Sur
]

# ┌─────────────────────────────────┐
# │ 2) Cálculo para base de datos   │
# └─────────────────────────────────┘

def calcular_indicador(filtro, session):
	resultado = session.query(
		AsequibilidadData.MED_NAC_DOBLE
	).filter(filtro).scalar()

	# Checkeo de None para evitar errores en cálculos
	med_nac_doble = resultado or 0

	return {
		"med_nac_doble": formato_chileno_prom(med_nac_doble)
	}


def obtener_valores_tabla(filtro, session):
	# Para esta tabla, se desplegará el valor de la media nacional doble
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
			AsequibilidadData.MED_NAC_DOBLE,
			AsequibilidadData.CUT_REG,
		).filter(macrozona_filtro).first()

		if resultado:
			med_nac_doble, _cut_reg = resultado
			resultados[str(macrozona)] = {
				"macrozona": macrozona,
				"med_nac_doble": formato_chileno_prom(med_nac_doble),
			}

	return resultados


def obtener_indicador_med_nac_doble(filtro, session):
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
		AsequibilidadData.MACROZONA,
	)
	if filtro is not True and filtro is not None:
		query = query.filter(filtro)
	for cut_reg, macrozona in query.distinct().all():
		cut_reg_str = str(cut_reg).zfill(2)  # Asegurar formato de 2 dígitos
		dict_cut_reg_colors[cut_reg_str] = macrozona

	# Calcular colores del mapa usando los valores de macrozona (1-4)
	colores_mapa = calcular_colores_mapa(dict_cut_reg_colors, CORTES, PALETA)

	resultados["leyenda_mapa"] = construir_leyenda_mapa(titulo, CORTES, PALETA)
	resultados["colores"] = colores_mapa
	resultados["desglose"] = tabla_valores

	return resultados
