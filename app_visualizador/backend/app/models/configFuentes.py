from models import db

# Esta base permitirá configurar las fuentes de datos
# directamente desde esta base, sin la necesidad de 
# modificar el código.

class ConfigFuentes (db.Model):
    __tablename__= 'config_fuentes'
    
    # ─────────── Identificación del dato ───────────
    id = db.Column(db.Integer, primary_key=True)

    # ─────────── Identificación de formato ─────────
    acc_agua_caliente =db.Column(db.Integer, nullable=False)
    acc_calefaccion =db.Column(db.Integer, nullable=False)
    acc_coccion =db.Column(db.Integer, nullable=False)
    acc_electricidad =db.Column(db.Integer, nullable=False)
    calidad_calefaccion =db.Column(db.Integer, nullable=False)
    calidad_coccion =db.Column(db.Integer, nullable=False)
    anio_casen =db.Column(db.Integer, nullable=False)
    anio_censo =db.Column(db.Integer, nullable=False)
    app_version = db.Column(db.String(30), nullable=False)
