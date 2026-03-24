# backend/app/routes/route_habitabilidad_frio.py
from flask import Blueprint, jsonify, request
from models import db
from services.habitabilidad_frio import (obtener_indicador_frio)

habitabilidad_frio_bp = Blueprint('habitabilidad_frio', __name__)

@habitabilidad_frio_bp.route('/api/public/habitabilidad_frio', methods=['GET'])
def indicador_h_frio():
    """
    Endpoint para obtener indicador de habitabilidad por percepción de frío.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None
    
    try:
        resultado = obtener_indicador_frio(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500