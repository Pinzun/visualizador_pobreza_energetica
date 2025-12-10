from .route_acceso_electricidad import acceso_electricidad_bp
from .route_acceso_coccion import acceso_coccion_bp
from .route_acceso_agua_caliente import acceso_agua_caliente_bp
from .route_calidad_coccion import calidad_coccion_bp
from .route_calidad_calefaccion import calidad_calefaccion_bp 
from .route_calidad_saidi import calidad_saidi_bp
from .route_habitabilidad_irrecuperable import habitabilidad_irrecuperable_bp
from .route_habitabilidad_ineficiencia import habitabilidad_ineficiencia_bp

blueprints=[
    acceso_electricidad_bp,
    acceso_coccion_bp,
    acceso_agua_caliente_bp,
    calidad_calefaccion_bp,
    calidad_coccion_bp,
    calidad_saidi_bp,
    habitabilidad_irrecuperable_bp,
    habitabilidad_ineficiencia_bp
]
