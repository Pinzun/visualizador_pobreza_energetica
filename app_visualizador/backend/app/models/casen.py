from models import db

class Casen(db.Model):
    _tablename_ = 'casen'

    # ─────────── Identificación de dato ───────────
    id              = db.Column(db.Integer, primary_key=True)

    # ─────────── Identificacón de viviendas ───────────
    ID_VIVIENDA     = db.Column(db.Integer)
    FOLIO           = db.Column(db.Integer)
    ID_PERSONA      = db.Column(db.Integer)
    CUT_REG         = db.Column(db.Integer)

    # ─────────── composición del hogar ────────────────
    TOT_PER_H       = db.Column(db.Integer)
    H1              = db.Column(db.Integer)
    MEN18C          = db.Column(db.Integer)
    MAY60C          = db.Column(db.Integer)

    # ─────────── datos demográficos ───────────────────
    EDAD            = db.Column(db.Integer)
    MES_NAC_NNA     = db.Column(db.Float)
    ANO_NAC_NNA     = db.Column(db.Float)
    SEXO            = db.Column(db.Integer)

    # ─────────── preguntas PCO1 ───────────────────────
    PCO1_A          = db.Column(db.Float)
    PCO1_B          = db.Column(db.Float)
    PCO1            = db.Column(db.Integer)

    # ─────────── bloque H5 (vivienda) ─────────────────
    H5_CP           = db.Column(db.Float)
    H5_SP           = db.Column(db.Float)
    H5_B1_1         = db.Column(db.Float)
    H5_B1_2         = db.Column(db.Float)
    H5A_2           = db.Column(db.Float)
    H5_B2_1         = db.Column(db.Float)
    H5_B2_2         = db.Column(db.Float)
    H5A_3           = db.Column(db.Float)
    H5_B3_1         = db.Column(db.Float)
    H5_B3_2         = db.Column(db.Float)
    H5A_4           = db.Column(db.Float)
    H5B             = db.Column(db.Float)

    # ─────────── variables adicionales ────────────────
    ECIVIL          = db.Column(db.Float)
    H5_10           = db.Column(db.Float)
    H5_1A           = db.Column(db.Float)
    H5_1B           = db.Column(db.Float)
    H5_20           = db.Column(db.Float)
    H5_2            = db.Column(db.Float)

    N_NUCLEOS       = db.Column(db.Integer)
    NUCLEO          = db.Column(db.Integer)

    PCO2_A          = db.Column(db.Float)
    PCO2_B          = db.Column(db.Float)
    PCO2            = db.Column(db.Float)

    H7A             = db.Column(db.Float)
    H7B             = db.Column(db.Float)
    H7C             = db.Column(db.Float)
    H7D             = db.Column(db.Float)
    H7E             = db.Column(db.Float)
    H7F             = db.Column(db.Float)

    INFORMANTE      = db.Column(db.Float)

    # ─────────── sección de ingresos / vivienda ───────
    R3              = db.Column(db.Integer)
    V12             = db.Column(db.Integer)
    V12MT           = db.Column(db.Float)
    V1              = db.Column(db.Integer)
    V2              = db.Column(db.Integer)
    V3              = db.Column(db.Integer)
    V4              = db.Column(db.Integer)
    V5              = db.Column(db.Integer)
    V6              = db.Column(db.Integer)
    V7              = db.Column(db.Integer)
    V24             = db.Column(db.Integer)
    V14             = db.Column(db.Float)
    V27A            = db.Column(db.Integer)
    V34A            = db.Column(db.Integer)
    V34B            = db.Column(db.Integer)
    V34C            = db.Column(db.Integer)

    # ─────────── indicadores socio-económicos ─────────
    POBREZA         = db.Column(db.Float)
    HH_D_ESTADO     = db.Column(db.Float)
    HH_D_HABITAB    = db.Column(db.Float)
    PUEBLOS_INDIGENAS = db.Column(db.Integer)
    TIPOHOGAR       = db.Column(db.Integer)

    # ─────────── factores de expansión y muestreo ─────
    EXPR            = db.Column(db.Integer)
    EXPR_OSIG       = db.Column(db.Float)
    VARSTRAT        = db.Column(db.Integer)
    VARUNIT         = db.Column(db.Integer)
