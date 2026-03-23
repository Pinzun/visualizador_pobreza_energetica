#backend/routes/asequibilidad_gasto_10p.py
from flask import Blueprint, jsonify, request
from models import db
from services.asequibilidad_gasto_10p import obtener_indicador_gasto_10p

asequibilidad_gasto_10p_bp = Blueprint('asequibilidad_gasto_10p', __name__)

@asequibilidad_gasto_10p_bp.route('/api/public/asequibilidad_gasto_10p', methods=['GET'])
def indicador_asequibilidad_gasto_10p():
    """
    Endpoint para obtener indicador de gasto 10%.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None

    try:
        resultado = obtener_indicador_gasto_10p(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
