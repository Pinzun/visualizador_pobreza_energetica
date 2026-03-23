# backend/app/routes/route_habitabilidad_permisos.py
from flask import Blueprint, jsonify, request
from models import db
from services.habitabilidad_ineficiencia import (obtener_indicador_ineficiencia)

habitabilidad_ineficiencia_bp = Blueprint('habitabilidad_ineficiencia', __name__)

@habitabilidad_ineficiencia_bp.route('/api/public/habitabilidad_ineficiencia', methods=['GET'])
def indicador_ineficiencia():
    """
    Endpoint para obtener indicador de habitabilidad por ineficiencia térmica estructural.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None
    
    try:
        resultado = obtener_indicador_ineficiencia(cut, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

