# backend/app/routes/route_habitabilidad_permisos.py
from flask import Blueprint, jsonify, request
from models import db
from services.habitabilidad_ineficiencia import (obtener_indicador_ineficiencia)

habitabilidad_ineficiencia_bp = Blueprint('habitabilidad_ineficiencia', __name__)


@habitabilidad_ineficiencia_bp.route('/api/public/habitabilidad_ineficiencia', methods=['GET'])
def indicador_ineficiencia():
    cut = request.args.get('cut')    
    
    if not cut:
        resultado = obtener_indicador_ineficiencia(None, db.session)
        return jsonify(resultado), 200

    try:
        resultado = obtener_indicador_ineficiencia(cut, db.session) if cut else obtener_indicador_ineficiencia(None, db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

