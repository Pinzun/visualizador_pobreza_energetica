# backend/app/routes/route_habitabilidad_conservacion.py
from flask import Blueprint, jsonify, request
from models import db
from services.habitabilidad_conservacion import (obtener_habitabilidad_conservacion_casen)

habitabilidad_conservacion_bp = Blueprint('habitabilidad_conservacion', __name__)

@habitabilidad_conservacion_bp.route('/api/public/habitabilidad_conservacion', methods=['GET'])
def indicador_h_conservacion():
    """
    Endpoint para obtener indicador de habitabilidad por conservación de viviendas.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None
    
    try:
        resultado = obtener_habitabilidad_conservacion_casen(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500