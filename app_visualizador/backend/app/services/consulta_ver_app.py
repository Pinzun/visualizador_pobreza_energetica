#services/consulta_ver_app.py
from models import ConfigFuentes

# Ruta básica para identificar la versión de la aplicación.

def obtener_ver_app(session):
	
	resultados = {}

	query_result = session.query(
		ConfigFuentes.app_version,
    ).all()

	# Transformamos los resultados a JSON. Este debe ser de un solo componente,
	# ya que se espera una sola fila

	resultados = query_result[0]._asdict() if query_result else {}

	return resultados