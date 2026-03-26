from .route_acceso_electricidad import acceso_electricidad_bp
from .route_acceso_calefaccion import acceso_calefaccion_bp
from .route_acceso_coccion import acceso_coccion_bp
from .route_acceso_zonas_t import acceso_zonas_t_bp 
from .route_acceso_agua_caliente import acceso_agua_caliente_bp
from .route_calidad_coccion import calidad_coccion_bp
from .route_calidad_calefaccion import calidad_calefaccion_bp 
from .route_calidad_saidi import calidad_saidi_bp
from .route_habitabilidad_irrecuperable import habitabilidad_irrecuperable_bp
from .route_habitabilidad_ineficiencia import habitabilidad_ineficiencia_bp
from .route_habitabilidad_calor import habitabilidad_calor_bp
from .route_habitabilidad_frio import habitabilidad_frio_bp
from .route_habitabilidad_conservacion import habitabilidad_conservacion_bp
from .route_asequibilidad_gasto_energ_p import asequibilidad_gasto_energ_p_bp
from .route_asequibilidad_gasto_10p import asequibilidad_gasto_10p_bp
from .route_asequibilidad_med_nac_doble import asequibilidad_med_nac_doble_bp
from .route_asequibilidad_g_excesivo import asequibilidad_g_excesivo_bp
from .route_asequibilidad_med_nac_menor import asequibilidad_med_nac_menor_bp
from .route_asequibilidad_g_insuficiente import asequibilidad_g_insuficiente_bp
from .route_asequibilidad_med_nac_proporcion import asequibilidad_med_nac_proporcion_bp
from .route_asequibilidad_vuln_energetica import asequibilidad_vuln_bp
from .route_consulta_bases import config_bases
from .route_app_ver import app_ver_bp

blueprints=[
    acceso_electricidad_bp,
    acceso_calefaccion_bp,
    acceso_coccion_bp,
    acceso_agua_caliente_bp,
    acceso_zonas_t_bp,
    calidad_calefaccion_bp,
    calidad_coccion_bp,
    calidad_saidi_bp,
    habitabilidad_irrecuperable_bp,
    habitabilidad_ineficiencia_bp,
    habitabilidad_calor_bp,
    habitabilidad_frio_bp,
    habitabilidad_conservacion_bp,
    asequibilidad_gasto_energ_p_bp,
    asequibilidad_gasto_10p_bp,
    asequibilidad_med_nac_doble_bp,
    asequibilidad_g_excesivo_bp,
    asequibilidad_med_nac_menor_bp,
    asequibilidad_g_insuficiente_bp,
    asequibilidad_med_nac_proporcion_bp,
    asequibilidad_vuln_bp,
    config_bases,
    app_ver_bp
]
