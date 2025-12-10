# backend/app/routes/route_calidad_calefaccion.py
from flask import Blueprint, jsonify, request
from models import db
from services.calidad_calefaccion import (obtener_calidad_calefaccion_censo, obtener_calidad_calefaccion_casen)

calidad_calefaccion_bp = Blueprint('combustible_calefaccion', __name__)

# Modificar esta variable dependiendo de cual base de datos se
# quiere utilizar.
fuente = "censo"

if fuente == "casen":
    @calidad_calefaccion_bp.route('/api/public/calidad_calefaccion', methods=['GET'])
    def indicador_ineficiencia():
        cut = request.args.get('cut')    
        if not cut:
            resultado = obtener_calidad_calefaccion_casen(None, db.session)
            return jsonify(resultado), 200

        try:
            resultado = obtener_calidad_calefaccion_casen(cut, db.session) if cut else obtener_calidad_calefaccion_casen(None, db.session)
            return jsonify(resultado), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
if fuente == "censo":   
    @calidad_calefaccion_bp.route('/api/public/calidad_calefaccion', methods=['GET'])
    def indicador_ineficiencia():
        cut = request.args.get('cut')    
        if not cut:
            resultado = obtener_calidad_calefaccion_censo(None, db.session)
            return jsonify(resultado), 200

        try:
            resultado = obtener_calidad_calefaccion_censo(cut, db.session) if cut else obtener_calidad_calefaccion_censo(None, db.session)
            return jsonify(resultado), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        