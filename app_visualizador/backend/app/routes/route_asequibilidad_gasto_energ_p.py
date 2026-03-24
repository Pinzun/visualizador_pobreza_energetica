#backend/routes/asequibilidad_gasto_energ_p.py
from flask import Blueprint, jsonify, request
from models import db
from services.asequibilidad_gasto_energ_p import obtener_indicador_gasto_energ_p

asequibilidad_gasto_energ_p_bp = Blueprint('asequibilidad_gasto_energ_p', __name__)

@asequibilidad_gasto_energ_p_bp.route('/api/public/asequibilidad_gasto_energ_p', methods=['GET'])
def indicador_asequibilidad_gasto_energ_p():
    """
    Endpoint para obtener indicador de gasto promedio en energía.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None
    
    try:
        resultado = obtener_indicador_gasto_energ_p(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500