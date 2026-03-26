#backend/routes/route_app_ver.py
from flask import Blueprint, jsonify, request
from models import db
from services.consulta_ver_app import obtener_ver_app as obtener_ver_app_service

app_ver_bp = Blueprint('app_version', __name__)

@app_ver_bp.route('/api/public/consulta_ver_app', methods=['GET'])
def consulta_ver_app_data():
    """
    Endpoint para obtener la versión de la aplicación para el caché.
    """
    cut = request.args.get('cut')
    cut = cut if cut else None

    try:
        resultado = obtener_ver_app_service(db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
