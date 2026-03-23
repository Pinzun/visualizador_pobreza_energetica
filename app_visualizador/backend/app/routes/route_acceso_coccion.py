#backend/routes/acceso_coccion.py
from flask import Blueprint, jsonify, request
from models import db, ConfigFuentes
from services.acceso_coccion import (obtener_acceso_coccion_casen, obtener_acceso_coccion_censo)

acceso_coccion_bp = Blueprint('acceso_coccion', __name__)

@acceso_coccion_bp.route('/api/public/acceso_coccion', methods=['GET'])
def indicador_coccion():
    """
    Endpoint para obtener indicador de acceso a cocción.
    Consulta la configuración en cada solicitud para determinar la fuente de datos.
    """
    cut = request.args.get('cut')
    
    try:
        config = ConfigFuentes.query.first()
        fuente = "casen" if config and config.acc_coccion == 1 else "censo"
    except Exception:
        fuente = "censo"
    
    cut = cut if cut else None
    
    try:
        if fuente == "casen":
            resultado = obtener_acceso_coccion_casen(cut, db.session)
        else:
            resultado = obtener_acceso_coccion_censo(cut, db.session)
        
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500