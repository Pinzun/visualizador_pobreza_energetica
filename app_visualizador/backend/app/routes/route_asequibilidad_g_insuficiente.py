#backend/routes/asequibilidad_g_insuficiente.py
from flask import Blueprint, jsonify, request
from models import db
from services.asequibilidad_g_insuficiente import obtener_indicador_g_insuficiente

asequibilidad_g_insuficiente_bp = Blueprint('asequibilidad_g_insuficiente', __name__)

@asequibilidad_g_insuficiente_bp.route('/api/public/asequibilidad_g_insuficiente', methods=['GET'])
def indicador_asequibilidad_g_insuficiente():
    """
    Endpoint para obtener indicador de gasto insuficiente.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None

    try:
        resultado = obtener_indicador_g_insuficiente(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
