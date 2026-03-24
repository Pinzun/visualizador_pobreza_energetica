# backend/app/routes/route_habitabilidad_irrecuperable.py
from flask import Blueprint, jsonify, request
from models import db
from services.habitabilidad_irrecuperable import (obtener_habitabilidad_irrecuperables)

habitabilidad_irrecuperable_bp = Blueprint('habitabilidad_irrecuperable', __name__)

@habitabilidad_irrecuperable_bp.route('/api/public/habitabilidad_irrecuperable', methods=['GET'])
def indicador_h_irrecuperable():
    """
    Endpoint para obtener indicador de habitabilidad por viviendas calificadas como irrecuperables.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None
    
    try:
        resultado = obtener_habitabilidad_irrecuperables(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500