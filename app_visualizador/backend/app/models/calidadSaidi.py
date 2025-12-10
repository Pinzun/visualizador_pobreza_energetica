from models import db

class CalidadSaidi (db.Model):
    __table_name__ = "calidad_saidi"

    # ─────────── Identificación de dato ───────────
    id = db.Column(db.Integer, primary_key=True)

    # ─────────── Identificación regional y comunal ───────────
    CUT_REG = db.Column(db.Integer, nullable=False)
    CUT_COM = db.Column(db.Integer, nullable=False)
    ANIO = db.Column(db.Integer, nullable=False)

    # ─────────── Identificación de variables ───────────
    FUERZA_MAYOR = db.Column(db.Float, nullable=False)
    SAIDI = db.Column(db.Float, nullable=False)
