#backend/routes/acceso_coccion.py
from flask import Blueprint, jsonify, request
from models import db
from services.acceso_agua_caliente import (obtener_acceso_agua_caliente_casen)

acceso_agua_caliente_bp = Blueprint('acceso_agua_caliente', __name__)

# Modificar esta variable dependiendo de cual base de datos se
# quiere utilizar.
fuente = "casen"

if fuente == "casen":
    @acceso_agua_caliente_bp.route('/api/public/acceso_agua_caliente', methods=['GET'])
    def indicador_ineficiencia():
        cut = request.args.get('cut')    
        if not cut:
            resultado = obtener_acceso_agua_caliente_casen(None, db.session)
            return jsonify(resultado), 200

        try:
            resultado = obtener_acceso_agua_caliente_casen(cut, db.session) if cut else obtener_acceso_agua_caliente_casen(None, db.session)
            return jsonify(resultado), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# Pendiente, dado que aun no se define en la ficha para el Censo:

#if fuente == "censo":
    #@acceso_agua_caliente_bp.route('/api/public/acceso_agua_caliente', methods=['GET'])
    #def indicador_ineficiencia():
        #cut = request.args.get('cut')    
        #if not cut:
            #resultado = obtener_acceso_agua_caliente_censo(None, db.session)
            #return jsonify(resultado), 200

        #try:
            #resultado = obtener_acceso_agua_caliente_censo(cut, db.session) if cut else obtener_acceso_agua_caliente_censo(None, db.session)
            #return jsonify(resultado), 200
        #except Exception as e:
            #return jsonify({'error': str(e)}), 500