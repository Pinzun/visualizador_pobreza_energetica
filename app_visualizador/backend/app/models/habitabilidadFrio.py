from models import db

class HabitabilidadFrio (db.Model):
    __tablename__= 'habitabilidad_frio'

    # ─────────── Identificación de dato ───────────
    id = db.Column(db.Integer, primary_key=True)

    # ─────────── Identificación regional
    CUT_REG = db.Column(db.Integer, nullable=False)

    # ─────────── Resultado de indicadores por region ───────────
    H_TOTAL_CON_FRIO = db.Column(db.Integer, nullable=False)
    H_TOTAL_SIN_FRIO = db.Column(db.Integer, nullable=False)
