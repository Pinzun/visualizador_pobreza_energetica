from models import db

class HabitabilidadCenso (db.Model):
    __tablename__= 'habitabilidad_censo'

    # ─────────── Identificación de dato ───────────
    id = db.Column(db.Integer, primary_key=True)
    ANIO = db.Column(db.Integer, nullable=True)
    
    # ─────────── Identificación regional y comunal ───────────
    CUT_REG = db.Column(db.Integer, nullable=False)
    CUT_PROV = db.Column(db.Integer, nullable=False)
    CUT_COM = db.Column(db.Integer, nullable=False)

    # ─────────── Datos totales ───────────
    TOTAL = db.Column(db.Integer, nullable=False)

    # ─────────── Indicadores de vivienda ───────────
    VIV_IRRECUPERABLE	= db.Column(db.Integer, nullable=False)		
