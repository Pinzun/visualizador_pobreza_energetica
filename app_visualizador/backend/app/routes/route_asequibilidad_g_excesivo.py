#backend/routes/asequibilidad_g_excesivo.py
from flask import Blueprint, jsonify, request
from models import db
from services.asequibilidad_g_excesivo import obtener_indicador_g_excesivo

asequibilidad_g_excesivo_bp = Blueprint('asequibilidad_g_excesivo', __name__)

@asequibilidad_g_excesivo_bp.route('/api/public/asequibilidad_g_excesivo', methods=['GET'])
def indicador_asequibilidad_g_excesivo():
    """
    Endpoint para obtener indicador de gasto excesivo.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None

    try:
        resultado = obtener_indicador_g_excesivo(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
