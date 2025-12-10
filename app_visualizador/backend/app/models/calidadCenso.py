from models import db

class CalidadCenso (db.Model):
    __tablename__= 'calidad_censo'

    # ─────────── Identificación de dato ───────────
    id = db.Column(db.Integer, primary_key=True)
    
    # ─────────── Identificación regional y comunal ───────────
    CUT_REG = db.Column(db.Integer, nullable=False)
    CUT_PROV = db.Column(db.Integer, nullable=False)
    CUT_COM = db.Column(db.Integer, nullable=False)

    # ─────────── Datos totales ───────────
    TOTAL = db.Column(db.Integer, nullable=False)

    # ─────────── Identificación de variables de calefacción ───────────
    CAL_GAS	= db.Column(db.Integer, nullable=False)		
    CAL_PARAFINA = db.Column(db.Integer, nullable=False)		
    CAL_LENIA = db.Column(db.Integer, nullable=False)		
    CAL_PELLET = db.Column(db.Integer, nullable=False)		
    CAL_CARBON = db.Column(db.Integer, nullable=False)			
    CAL_ELECTR = db.Column(db.Integer, nullable=False)		
    CAL_SOLAR = db.Column(db.Integer, nullable=False)
    CAL_NO_TIENE = db.Column(db.Integer, nullable=False)
    CAL_NO_DECLARA = db.Column(db.Integer, nullable=False)	

    # ─────────── Identificación de variables de cocción ───────────		
    CO_GAS	= db.Column(db.Integer, nullable=False)		
    CO_PARAFINA = db.Column(db.Integer, nullable=False)		
    CO_LENIA = db.Column(db.Integer, nullable=False)		
    CO_PELLET = db.Column(db.Integer, nullable=False)		
    CO_CARBON = db.Column(db.Integer, nullable=False)			
    CO_ELECTR = db.Column(db.Integer, nullable=False)		
    CO_SOLAR = db.Column(db.Integer, nullable=False)
    CO_NO_TIENE = db.Column(db.Integer, nullable=False)
    CO_NO_DECLARA = db.Column(db.Integer, nullable=False)	
		