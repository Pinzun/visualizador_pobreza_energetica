#backend/routes/asequibilidad_med_nac_doble.py
from flask import Blueprint, jsonify, request
from models import db
from services.asequibilidad_med_nac_doble import obtener_indicador_med_nac_doble

asequibilidad_med_nac_doble_bp = Blueprint('asequibilidad_med_nac_doble', __name__)

@asequibilidad_med_nac_doble_bp.route('/api/public/asequibilidad_med_nac_doble', methods=['GET'])
def indicador_asequibilidad_med_nac_doble():
    """
    Endpoint para obtener indicador de media nacional doble.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None

    try:
        resultado = obtener_indicador_med_nac_doble(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
