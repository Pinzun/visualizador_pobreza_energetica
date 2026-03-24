#backend/routes/asequibilidad_med_nac_proporcion.py
from flask import Blueprint, jsonify, request
from models import db
from services.asequibilidad_med_nac_proporcion import obtener_indicador_med_nac_proporcion

asequibilidad_med_nac_proporcion_bp = Blueprint('asequibilidad_med_nac_proporcion', __name__)

@asequibilidad_med_nac_proporcion_bp.route('/api/public/asequibilidad_med_nac_proporcion', methods=['GET'])
def indicador_asequibilidad_med_nac_proporcion():
    """
    Endpoint para obtener indicador de media nacional por proporcion.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None

    try:
        resultado = obtener_indicador_med_nac_proporcion(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
