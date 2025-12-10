#backend/routes/acceso_coccion.py
from flask import Blueprint, jsonify, request
from models import db
from services.acceso_coccion import (obtener_acceso_coccion_casen)

acceso_coccion_bp = Blueprint('acceso_coccion', __name__)

# Modificar esta variable dependiendo de cual base de datos se
# quiere utilizar.
fuente = "casen"

if fuente == "casen":
    @acceso_coccion_bp.route('/api/public/acceso_coccion', methods=['GET'])
    def indicador_ineficiencia():
        cut = request.args.get('cut')    
        if not cut:
            resultado = obtener_acceso_coccion_casen(None, db.session)
            return jsonify(resultado), 200

        try:
            resultado = obtener_acceso_coccion_casen(cut, db.session) if cut else obtener_acceso_coccion_casen(None, db.session)
            return jsonify(resultado), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# Pendiente, dado que aun no se define en la ficha para el Censo:

#if fuente == "censo":
    #@acceso_coccion_bp.route('/api/public/acceso_coccion', methods=['GET'])
    #def indicador_ineficiencia():
        #cut = request.args.get('cut')    
        #if not cut:
            #resultado = obtener_acceso_coccion_censo(None, db.session)
            #return jsonify(resultado), 200

        #try:
            #resultado = obtener_acceso_coccion_censo(cut, db.session) if cut else obtener_acceso_coccion_censo(None, db.session)
            #return jsonify(resultado), 200
        #except Exception as e:
            #return jsonify({'error': str(e)}), 500