from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db=SQLAlchemy()
login_manager=LoginManager()

# Modelos de configuración usuaria:
from .users import Users
from .geoData import GeoData
from .configFuentes import ConfigFuentes

# Modelos de datos:
from .casen import Casen
from .casenComunaProvincia import CasenComunaProvincia

# Datos de acceso:
from .accesoCenso import AccesoCenso
from .accesoZonasT import AccesoZonasT

# Datos de calidad:
from .calidadCenso import CalidadCenso 
from .calidadSaidi import CalidadSaidi

# Datos de habitabilidad:
from .habitabilidadCenso import HabitabilidadCenso
from .habitabilidadIneficiencia import HabitabilidadIneficiencia
from .habitabilidadFrio import HabitabilidadFrio
from .habitabilidadCalor import HabitabilidadCalor

# Datos de asequibilidad:
from .asequibilidadData import AsequibilidadData
from .asequibilidadVulnerable import AsequibilidadVulnerable