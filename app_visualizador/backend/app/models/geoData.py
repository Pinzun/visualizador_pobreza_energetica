from models import db

class GeoData(db.Model):
    __tablename__ = 'geodata'
    id      = db.Column(db.Integer, primary_key=True)
    name    = db.Column(db.String(100), nullable=False)
    geojson = db.Column(db.Text, nullable=False)
    stats   = db.Column(db.JSON, nullable=False)