#backend/routes/acceso_electricidad.py
from flask import Blueprint, jsonify, request
from models import db, ConfigFuentes
from services.acceso_electricidad import (obtener_acceso_electricidad_censo, obtener_acceso_electricidad_casen)

acceso_electricidad_bp = Blueprint('acceso_electricidad', __name__)

@acceso_electricidad_bp.route('/api/public/acceso_electricidad', methods=['GET'])
def indicador_electricidad():
    """
    Endpoint para obtener indicador de acceso a electricidad.
    Consulta la configuración en cada solicitud para determinar la fuente de datos.
    """
    cut = request.args.get('cut')
    
    try:
        config = ConfigFuentes.query.first()
        fuente = "casen" if config and config.acc_electricidad == 1 else "censo"
    except Exception:
        fuente = "censo"
    
    cut = cut if cut else None
    
    try:
        if fuente == "casen":
            resultado = obtener_acceso_electricidad_casen(cut, db.session)
        else:
            resultado = obtener_acceso_electricidad_censo(cut, db.session)
        
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500