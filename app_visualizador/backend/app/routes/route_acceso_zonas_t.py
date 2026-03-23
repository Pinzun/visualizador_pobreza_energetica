# backend/app/routes/route_acceso_zonas_t.py
from flask import Blueprint, jsonify, request
from models import db
from services.acceso_zonas_t import obtener_indicador_zonas_frias

acceso_zonas_t_bp = Blueprint('acceso_zonas_t', __name__)

@acceso_zonas_t_bp.route('/api/public/acceso_zonas_t', methods=['GET'])
def acceso_zonas_t():
    """
    Endpoint para obtener indicador de calidad SAIDI.
    """
    cut = request.args.get("cut")

    try:
        resultado = obtener_indicador_zonas_frias(cut, session=db.session)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500