from models import db

class AccesoZonasT (db.Model):
    __tablename__= 'acceso_zonas_t'

    # ─────────── Identificación de dato ───────────
    id = db.Column(db.Integer, primary_key=True)
    
    # ─────────── Identificación regional y comunal ───────────
    CUT_REG = db.Column(db.Integer, nullable=False)
    CUT_COM = db.Column(db.Integer, nullable=False)

    # ─────────── Datos totales ───────────
    ZONA_TERMICA_P = db.Column(db.String(5), nullable=False)
