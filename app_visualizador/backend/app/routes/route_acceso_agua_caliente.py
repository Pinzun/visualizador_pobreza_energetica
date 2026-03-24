#backend/routes/acceso_coccion.py
from flask import Blueprint, jsonify, request
from models import db, ConfigFuentes
from services.acceso_agua_caliente import (obtener_acceso_agua_caliente_casen)

acceso_agua_caliente_bp = Blueprint('acceso_agua_caliente', __name__)

@acceso_agua_caliente_bp.route('/api/public/acceso_agua_caliente', methods=['GET'])
def indicador_agua_caliente():
    """
    Endpoint para obtener indicador de acceso a agua caliente.
    Consulta la configuración en cada solicitud para determinar la fuente de datos.
    """
    cut = request.args.get('cut')
    
    # Determinar la fuente de datos en cada solicitud (sin necesidad de reiniciar)
    try:
        config = ConfigFuentes.query.first()
        fuente = "casen" if config and config.acc_agua_caliente == 1 else "censo"
    except Exception:
        fuente = "censo"
    
    cut = cut if cut else None
    
    try:
        # Por ahora solo CASEN está implementado
        resultado = obtener_acceso_agua_caliente_casen(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
