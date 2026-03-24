# backend/app/routes/route_calidad_calefaccion.py
from flask import Blueprint, jsonify, request
from models import db, ConfigFuentes
from services.calidad_calefaccion import (obtener_calidad_calefaccion_censo, obtener_calidad_calefaccion_casen)

calidad_calefaccion_bp = Blueprint('combustible_calefaccion', __name__)

@calidad_calefaccion_bp.route('/api/public/calidad_calefaccion', methods=['GET'])
def indicador_calidad_calefaccion():
    """
    Endpoint para obtener indicador de calidad de calefacción.
    Consulta la configuración en cada solicitud para determinar la fuente de datos.
    """
    cut = request.args.get('cut')
    
    try:
        config = ConfigFuentes.query.first()
        fuente = "casen" if config and config.calidad_calefaccion == 1 else "censo"
    except Exception:
        fuente = "censo"
    
    cut = cut if cut else None
    
    try:
        if fuente == "casen":
            resultado = obtener_calidad_calefaccion_casen(cut, db.session)
        else:
            resultado = obtener_calidad_calefaccion_censo(cut, db.session)
        
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        