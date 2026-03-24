from models import db

class AccesoCenso (db.Model):
    __tablename__= 'acceso_censo'
    
    # ─────────── Identificación del dato ───────────
    id = db.Column(db.Integer, primary_key=True)

    # ─────────── Identificación regional, provincial y comunal ───────────
    CUT_REG = db.Column(db.Integer, nullable=False)
    CUT_PROV = db.Column(db.Integer, nullable=False)
    CUT_COM = db.Column(db.Integer, nullable=False)

    # ─────────── Datos totales ───────────
    TOTAL = db.Column(db.Integer, nullable=False)

    # ─────────── Identificación de variables de acceso a la electricidad ───────────
    ELEC_RED	= db.Column(db.Integer, nullable=False)		
    ELEC_GENERADOR= db.Column(db.Integer, nullable=False)		
    ELEC_SOLAR= db.Column(db.Integer, nullable=False)		
    ELEC_EOLICA= db.Column(db.Integer, nullable=False)		
    ELEC_OTRO= db.Column(db.Integer, nullable=False)			
    ELEC_NO_TIENE= db.Column(db.Integer, nullable=False)		
    ELEC_NO_DECLARA= db.Column(db.Integer, nullable=False)

    #  ────── Identificación de variables de acceso a fuentes de calefacción ──────
    CAL_GAS	= db.Column(db.Integer, nullable=False)		
    CAL_PARAFINA = db.Column(db.Integer, nullable=False)		
    CAL_LENIA = db.Column(db.Integer, nullable=False)		
    CAL_PELLET = db.Column(db.Integer, nullable=False)		
    CAL_CARBON = db.Column(db.Integer, nullable=False)			
    CAL_ELECTR = db.Column(db.Integer, nullable=False)		
    CAL_SOLAR = db.Column(db.Integer, nullable=False)
    CAL_NO_TIENE = db.Column(db.Integer, nullable=False)
    CAL_NO_DECLARA = db.Column(db.Integer, nullable=False)	

    # ─────────── Identificación de variables de acceso a sistemas de cocción ───────────
    CO_GAS	= db.Column(db.Integer, nullable=False)		
    CO_PARAFINA = db.Column(db.Integer, nullable=False)		
    CO_LENIA = db.Column(db.Integer, nullable=False)		
    CO_PELLET = db.Column(db.Integer, nullable=False)		
    CO_CARBON = db.Column(db.Integer, nullable=False)			
    CO_ELECTR = db.Column(db.Integer, nullable=False)		
    CO_SOLAR = db.Column(db.Integer, nullable=False)
    CO_NO_TIENE = db.Column(db.Integer, nullable=False)
    CO_NO_DECLARA = db.Column(db.Integer, nullable=False)	
		