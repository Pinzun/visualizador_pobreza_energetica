# backend/app/routes/route_calidad_saidi.py
from flask import Blueprint, jsonify, request
from services.calidad_saidi import obtener_saidi_sin_fm

calidad_saidi_bp = Blueprint('calidad_saidi', __name__)

@calidad_saidi_bp.route('/api/public/calidad_saidi', methods=['GET'])
def calidad_saidi():
    """
    Endpoint para obtener indicador de calidad SAIDI.
    """
    cut = request.args.get("cut")

    try:
        resultado = obtener_saidi_sin_fm(cut)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

