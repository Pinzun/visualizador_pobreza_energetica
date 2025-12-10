#backend/routes/acceso_electricidad.py
from flask import Blueprint, jsonify, request
from models import db
from services.acceso_electricidad import (obtener_acceso_electricidad_censo, obtener_acceso_electricidad_casen)

acceso_electricidad_bp = Blueprint('acceso_electricidad', __name__)

# Modificar esta variable dependiendo de cual base de datos se
# quiere utilizar.
fuente = "censo"

if fuente == "casen":
    @acceso_electricidad_bp.route('/api/public/acceso_electricidad', methods=['GET'])
    def indicador_ineficiencia():
        cut = request.args.get('cut')    
        if not cut:
            resultado = obtener_acceso_electricidad_casen(None, db.session)
            return jsonify(resultado), 200

        try:
            resultado = obtener_acceso_electricidad_casen(cut, db.session) if cut else obtener_acceso_electricidad_casen(None, db.session)
            return jsonify(resultado), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
if fuente == "censo":
    @acceso_electricidad_bp.route('/api/public/acceso_electricidad', methods=['GET'])
    def indicador_ineficiencia():
        cut = request.args.get('cut')    
        if not cut:
            resultado = obtener_acceso_electricidad_censo(None, db.session)
            return jsonify(resultado), 200

        try:
            resultado = obtener_acceso_electricidad_censo(cut, db.session) if cut else obtener_acceso_electricidad_censo(None, db.session)
            return jsonify(resultado), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500