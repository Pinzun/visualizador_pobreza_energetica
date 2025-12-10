# backend/app/routes/route_calidad_coccion.py
from flask import Blueprint, jsonify, request
from models import db
from services.calidad_coccion import (obtener_calidad_coccion_casen, obtener_calidad_coccion_censo)

calidad_coccion_bp = Blueprint('combustible_cocina', __name__)

# Modificar esta variable dependiendo de cual base de datos se
# quiere utilizar.
fuente = "censo"

if fuente == "casen":
    @calidad_coccion_bp.route('/api/public/calidad_coccion', methods=['GET'])
    def indicador_ineficiencia():
        cut = request.args.get('cut')    
        if not cut:
            resultado = obtener_calidad_coccion_casen(None, db.session)
            return jsonify(resultado), 200

        try:
            resultado = obtener_calidad_coccion_casen(cut, db.session) if cut else obtener_calidad_coccion_casen(None, db.session)
            return jsonify(resultado), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
if fuente == "censo":   
    @calidad_coccion_bp.route('/api/public/calidad_coccion', methods=['GET'])
    def indicador_ineficiencia():
        cut = request.args.get('cut')    
        if not cut:
            resultado = obtener_calidad_coccion_censo(None, db.session)
            return jsonify(resultado), 200

        try:
            resultado = obtener_calidad_coccion_censo(cut, db.session) if cut else obtener_calidad_coccion_censo(None, db.session)
            return jsonify(resultado), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500