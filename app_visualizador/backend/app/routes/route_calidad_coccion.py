# backend/app/routes/route_calidad_coccion.py
from flask import Blueprint, jsonify, request
from models import db, ConfigFuentes
from services.calidad_coccion import (obtener_calidad_coccion_casen, obtener_calidad_coccion_censo)

calidad_coccion_bp = Blueprint('combustible_cocina', __name__)

@calidad_coccion_bp.route('/api/public/calidad_coccion', methods=['GET'])
def indicador_calidad_coccion():
    """
    Endpoint para obtener indicador de calidad de cocción.
    Consulta la configuración en cada solicitud para determinar la fuente de datos.
    """
    cut = request.args.get('cut')
    
    # Determinar la fuente de datos en cada solicitud (sin necesidad de reiniciar,
    # usando los datos de la tabla ConfigFuentes).
    try:
        config = ConfigFuentes.query.first()
        fuente = "casen" if config and config.calidad_coccion == 1 else "censo"
    except Exception:
        fuente = "censo"
    
    # Normalizar el parámetro CUT.
    cut = cut if cut else None
    
    try:
        if fuente == "casen":
            resultado = obtener_calidad_coccion_casen(cut, db.session)
        else:
            resultado = obtener_calidad_coccion_censo(cut, db.session)
        
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500