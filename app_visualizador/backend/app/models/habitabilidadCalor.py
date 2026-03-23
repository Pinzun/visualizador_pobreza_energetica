from models import db

class HabitabilidadCalor (db.Model):
    __tablename__= 'habitabilidad_calor'

    # ─────────── Identificación de dato ───────────
    id = db.Column(db.Integer, primary_key=True)

    # ─────────── Identificación regional
    CUT_REG = db.Column(db.Integer, nullable=False)

    # ─────────── Resultado de indicadores por region ───────────
    H_TOTAL_CON_CALOR = db.Column(db.Integer, nullable=False)
    H_TOTAL_SIN_CALOR = db.Column(db.Integer, nullable=False)