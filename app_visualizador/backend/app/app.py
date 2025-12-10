import os
import logging
from flask import Flask
from flask_cors import CORS
from models import db, login_manager
from routes import blueprints  # si ya tienes blueprints definidos

def create_app():
    app = Flask(__name__)

    # Clave secreta para sesiones
    app.secret_key = os.environ.get("SECRET_KEY", "dev_secret_key")

    # Configuración de logging
    logging.basicConfig(level=logging.INFO)
    app.logger = logging.getLogger(__name__)

    # ---------------------------
    # Configuración de la base de datos
    # ---------------------------
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+pymysql://{os.environ.get('DB_USER')}:{os.environ.get('DB_PASSWORD')}"
        f"@{os.environ.get('DB_HOST')}:{os.environ.get('DB_PORT')}/{os.environ.get('DB_NAME')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    login_manager.init_app(app)

    # ---------------------------
    # Configuración de CORS
    # ---------------------------
    cors_origins = os.environ.get("CORS_ORIGINS", "*").split(",")
    CORS(app, supports_credentials=False, origins=cors_origins)

    # ---------------------------
    # Registro de blueprints
    # ---------------------------
    for bp in blueprints:
        app.register_blueprint(bp)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))