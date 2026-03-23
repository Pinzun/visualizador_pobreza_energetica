from models import db

class AsequibilidadVulnerable (db.Model):
    __tablename__= 'asequibilidad_vulnerable'

    # ─────────── Identificación de dato ───────────
    id = db.Column(db.Integer, primary_key=True)
    
    # ─────────── Identificación comunal y regional ───────────
    CUT_REG = db.Column(db.Integer, nullable=False)
    CUT_COM = db.Column(db.Integer, nullable=False)

    # ─────────── Datos totales ───────────
    VULN_ENERGETICA = db.Column(db.Integer, nullable=False)
    