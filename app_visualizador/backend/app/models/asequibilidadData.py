from models import db

class AsequibilidadData (db.Model):
    __tablename__= 'asequibilidad_data'

    # ─────────── Identificación de dato ───────────
    id = db.Column(db.Integer, primary_key=True)
    
    # ─────────── Identificación macrozonal y regional ───────────
    MACROZONA = db.Column(db.Integer, nullable=False)
    CUT_REG = db.Column(db.Integer, nullable=False)

    # ─────────── Datos totales ───────────
    GASTO_ENERG_P = db.Column(db.Integer, nullable=False)
    GASTO_10P = db.Column(db.Float, nullable=False)
    MED_NAC_PROPORCION = db.Column(db.Float, nullable=False)
    MED_NAC_DOBLE = db.Column(db.Float, nullable=False)
    MED_NAC_MENOR = db.Column(db.Float, nullable=False)
    G_EXCESIVO = db.Column(db.Float, nullable=False)
    G_INSUFICIENTE = db.Column(db.Float, nullable=False)