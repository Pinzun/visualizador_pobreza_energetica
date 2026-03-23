# backend/app/routes/route_asequibilidad_vuln_energetica.py
from flask import Blueprint, jsonify, request
from models import db
from services.asequibilidad_vuln_energetica import (obtener_indicador_vulnerable)

asequibilidad_vuln_bp = Blueprint('asequibilidad_vuln', __name__)

@asequibilidad_vuln_bp.route('/api/public/asequibilidad_vuln', methods=['GET'])
def indicador_asequibilidad_vuln():
    """
    Endpoint para obtener indicador de asequibilidad vulnerable.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None
    
    try:
        resultado = obtener_indicador_vulnerable(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500