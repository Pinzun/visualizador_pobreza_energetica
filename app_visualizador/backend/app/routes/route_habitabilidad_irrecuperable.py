# backend/app/routes/route_habitabilidad_irrecuperable.py
from flask import Blueprint, jsonify, request
from collections import defaultdict
from services.dar_formato import (formato_chileno, formato_chileno_prom)
from services.habitabilidad_irrecuperable import (obtener_habitabilidad_irrecuperables, calcular_porcentaje_irrecuperables)

habitabilidad_irrecuperable_bp = Blueprint('habitabilidad_irrecuperable', __name__)

# Modificar en base el origen de los datos utilizados
filtro = "censo"

#       ┌───────────────────────────────────────────────────────────────────────────┐
#       │  1) Caso sin CUT - CENSO = Indica estadística a nivel nacional y regional │ 
#       └───────────────────────────────────────────────────────────────────────────┘

if filtro == "censo":   
    @habitabilidad_irrecuperable_bp.route('/api/public/habitabilidad_irrecuperable', methods=['GET'])
    def asequibilidad_irrecuperable():
        cut = request.args.get("cut")

        if not cut:
            resumen_reg = {}
            resumen_nacional = {}
            total_nacional = defaultdict(float)

            # Loop para realizar sumatoria de datos a nivel nacional
            for i in range(1, 17):
                cut_reg = str(i).zfill(2)
                dato_general = obtener_habitabilidad_irrecuperables(cut_reg)
                dato_irrecuperables = calcular_porcentaje_irrecuperables(dato_general)
                if not dato_general:
                    continue
                
                # Entrega resumen de datos a nivel regional
                resumen_reg[cut_reg] = {
                    **{proporcion: valor for proporcion, valor in dato_irrecuperables.items()
                    if proporcion != "porcentaje_irrecuperables"},
                    "porcentaje_irrecuperables": formato_chileno_prom(dato_irrecuperables["porcentaje_irrecuperables"])
            }

                # Realiza sumatoria de datos a nivel nacional
                for vivienda, valor in dato_general.items():
                    total_nacional[vivienda] += valor

                # Entrega resumen de la sumatoria a nivel nacional
                dato_irrecuperable_nacional = calcular_porcentaje_irrecuperables(total_nacional) 

                resumen_nacional = {
                    "porcentaje_irrecuperables": formato_chileno_prom(dato_irrecuperable_nacional["porcentaje_irrecuperables"]),
                    "total_viviendas": dato_irrecuperable_nacional["total_viviendas"],
                    "total_irrecuperables": dato_irrecuperable_nacional["total_irrecuperables"]  
            }

            return jsonify({"desglose_regional_habitabilidad_irrecuperable": resumen_reg,
                            "desglose_nacional_habitabilidad_irrecuperable": resumen_nacional}), 200

#       ┌─────────────────────────────────────────────────────────────────────────────────┐
#       │  2) Caso con CUT - CENSO = Indican datos completos dependiendo el valor del CUT │ 
#       └─────────────────────────────────────────────────────────────────────────────────┘

        try:
            dato_general = obtener_habitabilidad_irrecuperables(cut)
            dato_irrecuperables = calcular_porcentaje_irrecuperables(dato_general)
            
            # Se unifica la fórmula para cualquier tipo de CUT (comunal o regional), dado
            # que el filtro se realiza de forma previa, no siendo necesario reiterar la 
            # lógica acá.
            if cut is not None:
                r = calcular_porcentaje_irrecuperables(dato_general)
                datos_fmt = {
                    "porcentaje_irrecuperables": formato_chileno_prom(r["porcentaje_irrecuperables"]),
                    "total_viviendas": r["total_viviendas"],
                    "total_irrecuperables": r["total_irrecuperables"]
            }
                
            # Modifica título de dict. en base a CUT

            # CUT Regional:
            if len(str(cut)) <= 2:
                return jsonify({"desglose_habitabilidad_irrecuperable_regional": datos_fmt}), 200
            # CUT Comunal
            else:
                return jsonify({"desgosle_habitabilidad_irrecuperable_comunal": datos_fmt}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        