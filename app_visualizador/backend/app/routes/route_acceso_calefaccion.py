#backend/routes/acceso_calefaccion.py
from flask import Blueprint, jsonify, request
from models import db, ConfigFuentes
from services.acceso_calefaccion import (obtener_acceso_calefaccion_casen, obtener_acceso_calefaccion_censo)

acceso_calefaccion_bp = Blueprint('acceso_calefaccion', __name__)

@acceso_calefaccion_bp.route('/api/public/acceso_calefaccion', methods=['GET'])
def indicador_calefaccion():
    """
    Endpoint para obtener indicador de acceso a calefacción.
    Consulta la configuración en cada solicitud para determinar la fuente de datos.
    """
    cut = request.args.get('cut')
    
    try:
        config = ConfigFuentes.query.first()
        fuente = "casen" if config and config.acc_calefaccion == 1 else "censo"
    except Exception:
        fuente = "censo"
    
    cut = cut if cut else None
    
    try:
        if fuente == "casen":
            resultado = obtener_acceso_calefaccion_casen(cut, db.session)
        else:
            resultado = obtener_acceso_calefaccion_censo(cut, db.session)
        
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500