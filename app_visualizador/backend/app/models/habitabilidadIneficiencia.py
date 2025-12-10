from models import db

class HabitabilidadIneficiencia (db.Model):
    __tablename__= 'habitabilidad_ineficiencia'

    # ─────────── Identificación de dato ───────────
    id = db.Column(db.Integer, primary_key=True)

    # ─────────── Identificación regional y comunal ───────────
    CUT_REG = db.Column(db.Integer, nullable=False)
    CUT_COM = db.Column(db.Integer, nullable=False)

    # ─────────── Identificación temporal ───────────
    ANIO = db.Column(db.Integer, nullable=False)
    MES = db.Column(db.Integer, nullable=False)

    # ─────────── Indicadores de permisos ───────────
    FOLIO	= db.Column(db.String(50), nullable=False)
    DV_FOLIO	= db.Column(db.Integer, nullable=False)
    TIPO_PERMISO	= db.Column(db.String(50), nullable=False)			