from models import Users
from flask_login import login_user, logout_user

def configure_login(login_manager):
    @login_manager.user_loader
    def load_user(user_id):
        print(f"[LOGIN MANAGER] Cargando usuario con ID: {user_id}")
        return Users.query.get(int(user_id))

def login(username, password):
    print(f"[LOGIN] Intentando login para usuario: {username}")
    try:
        u = Users.query.filter_by(username=username).first()
        if u:
            print(f"[LOGIN] Usuario encontrado: {u.username} | Admin: {u.is_admin}")
            if u.check_password(password):
                print("[LOGIN] Contraseña correcta. Iniciando sesión...")
                login_user(u)
                return True
            else:
                print("[LOGIN] Contraseña incorrecta.")
        else:
            print("[LOGIN] Usuario no encontrado.")
    except Exception as e:
        print(f"[ERROR] Error al consultar la base de datos: {e}")
    return False

def logout():
    print("[LOGOUT] Cerrando sesión.")
    logout_user()