# backend/app/routes/route_habitabilidad_frio.py
from flask import Blueprint, jsonify, request
from models import db
from services.habitabilidad_calor import (obtener_indicador_calor)

habitabilidad_calor_bp = Blueprint('habitabilidad_calor', __name__)

@habitabilidad_calor_bp.route('/api/public/habitabilidad_calor', methods=['GET'])
def indicador_h_calor():
    """
    Endpoint para obtener indicador de habitabilidad por percepción de calor.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None
    
    try:
        resultado = obtener_indicador_calor(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500