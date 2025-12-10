from models import db

class CasenComunaProvincia(db.Model):
    _tablename_ = 'casen_comuna_provincia'
    id = db.Column(db.Integer, primary_key=True)
    FOLIO = db.Column(db.Integer)
    ID_PERSONA = db.Column(db.Integer)
    PROVINCIA = db.Column(db.Text)
    COMUNA = db.Column(db.Text)
    EXPP = db.Column(db.Integer)
    EXPC = db.Column(db.Integer)
    CUT_COM = db.Column(db.Integer)
