from models import db

class HabitabilidadIneficiencia (db.Model):
    __tablename__= 'habitabilidad_ineficiencia'

    # ─────────── Identificación de dato ───────────
    id = db.Column(db.Integer, primary_key=True)

    # ─────────── Identificación regional y comunal ───────────
    CUT_REG = db.Column(db.Integer, nullable=False)
    CUT_COM = db.Column(db.Integer, nullable=False)

    # ─────────── Resultado de indicadores por comuna (totales) ───────────
    CENSO2024 = db.Column(db.Integer, nullable=False)
    TOTAL_2000 = db.Column(db.Integer, nullable=False)
    TOTAL_2000_2006 = db.Column(db.Integer, nullable=False)
    TOTAL_2007_2024 = db.Column(db.Integer, nullable=False)

    # ─────────── Resultado de indicadores por comuna (porcentaje) ───────────
    PORCENTAJE_2000	= db.Column(db.Integer, nullable=False)
    PORCENTAJE_2000_2006	= db.Column(db.Integer, nullable=False)
    PORCENTAJE_2007_2024	= db.Column(db.Integer, nullable=False)			