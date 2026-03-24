#services/consulta_bases.py
from models import ConfigFuentes

# Ruta básica para identificar las fuentes de datos para los indicadores que estén activos.

def obtener_valores_tabla(session):
	
	resultados = {}

	query_result = session.query(
		ConfigFuentes.acc_agua_caliente,
		ConfigFuentes.acc_calefaccion,
		ConfigFuentes.acc_electricidad,
		ConfigFuentes.acc_coccion,
		ConfigFuentes.calidad_calefaccion,
		ConfigFuentes.calidad_coccion,
		ConfigFuentes.anio_casen,
		ConfigFuentes.anio_censo
    ).all()

	# Transformamos los resultados a JSON.

	resultados["resultados"] = [row._asdict() for row in query_result]

	return resultados