# backend/app/routes/route_calidad_saidi.py
from flask import Blueprint, jsonify, request
from services.calidad_saidi import obtener_saidi_sin_fm

# Cambios principales del indicador Saidi tras última actualización:
#   1. Se incluye el despliegue nacional.
#   2. Se corrige el cálculo del promedio comunal y regional, ahora calculando los promedios 
#   comunales, luego una sumatoria y un promedio, siendo más representativo que el método
#   anterior, que solo sumaba los totales anuales y dividía por cantidad de meses (12).
#   3. Se incorpora el formateo chileno de promedios.
#   

calidad_saidi_bp = Blueprint('calidad_saidi', __name__)

@calidad_saidi_bp.route('/api/public/calidad_saidi', methods=['GET'])
def calidad_saidi():
    cut = request.args.get("cut")

    try:
        if not cut:
            # Deslglose de datos a nivel regional para cálculo nacional.
            resumen_regional = {}
            for i in range(1, 17):
                cut_reg = str(i).zfill(2)
                resultados = obtener_saidi_sin_fm(cut_reg)
                resumen_regional[cut_reg] = {
                    str(r["ANIO"]): {
                        "saidi_sin_fm_total": r["SAIDI_SIN_FM_TOTAL"],
                        "fm_total": r["FUERZA_MAYOR_TOTAL"],
                        "promedio_regional_anual": r["PROMEDIO_REG_COM"],
                    }
                    for r in resultados
                }

            # Desglose de datos totales a nivel nacional. 
            resultados_nacionales = obtener_saidi_sin_fm(None)
            resumen_nacional = {
                str(r["ANIO"]): {
                    "saidi_sin_fm_total": r["SAIDI_SIN_FM_TOTAL"],
                    "fm_total": r["FUERZA_MAYOR_TOTAL_NACIONAL"],
                    "promedio_nacional_anual": r["PROMEDIO_NACIONAL"]
                }
                for r in resultados_nacionales
            }

            # Entrega el desglose de todas las regiones, y el resumen nacional
            # de datos totales, en base a cada año.
            return jsonify({
                "desglose_nacional_calidad_saidi": resumen_nacional,
                "desglose_regional_calidad_saidi": resumen_regional
            }), 200

        else:
            # Cálculo comunal o regional según el largo del CUT
            resultados = obtener_saidi_sin_fm(cut)
            datos_fmt = {
                str(r["ANIO"]): {
                    "saidi_sin_fm_total": r["SAIDI_SIN_FM_TOTAL"],
                    "fm_total": r["FUERZA_MAYOR_TOTAL"],
                    "promedio_anual": r.get("PROMEDIO_REG_COM", r.get("PROMEDIO_NACIONAL"))
                }
                for r in resultados
            }

            # Dependiendo del cut, develve un mensaje personalizado por
            # cada tipo de cálculo.
            if len(str(cut)) <= 2:
                return jsonify({"desglose_calidad_saidi_regional": datos_fmt}), 200
            else:
                return jsonify({"desglose_calidad_saidi_comunal": datos_fmt}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

