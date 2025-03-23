from config.config import BASE_URL
from session.auth import session

def obtener_usuario():
    res = session.get(f"{BASE_URL}/api/userinfo")
    if res.status_code == 200:
        return res.json()
    else:
        print("No autorizado")
        return None
