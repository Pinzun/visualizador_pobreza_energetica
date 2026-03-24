#backend/routes/asequibilidad_med_nac_menor.py
from flask import Blueprint, jsonify, request
from models import db
from services.asequibilidad_med_nac_menor import obtener_indicador_med_nac_menor

asequibilidad_med_nac_menor_bp = Blueprint('asequibilidad_med_nac_menor', __name__)

@asequibilidad_med_nac_menor_bp.route('/api/public/asequibilidad_med_nac_menor', methods=['GET'])
def indicador_asequibilidad_med_nac_menor():
    """
    Endpoint para obtener indicador de media nacional menor.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None

    try:
        resultado = obtener_indicador_med_nac_menor(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
