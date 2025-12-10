from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db=SQLAlchemy()
login_manager=LoginManager()

from .users import Users
from .geoData import GeoData
from .casen import Casen
from .casenComunaProvincia import CasenComunaProvincia
from .accesoCenso import AccesoCenso
from .calidadCenso import CalidadCenso 
from .calidadSaidi import CalidadSaidi
from .habitabilidadCenso import HabitabilidadCenso
from .habitabilidadIneficiencia import HabitabilidadIneficiencia
