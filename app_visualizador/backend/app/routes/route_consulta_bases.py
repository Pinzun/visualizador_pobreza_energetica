#backend/routes/asequibilidad_med_nac_doble.py
from flask import Blueprint, jsonify, request
from models import db
from services.consulta_bases import obtener_valores_tabla

config_bases = Blueprint('config_bases', __name__)

@config_bases.route('/api/public/consulta_bases', methods=['GET'])
def consulta_bases_data():
    """
    Endpoint para obtener bases de datos configuradas y actualmente activas.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None

    try:
        resultado = obtener_valores_tabla(db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
