import requests
from config.config import BASE_URL, CORREO, CONTRASENIA

session = requests.Session()

def login() -> bool:
    response = session.post(f"{BASE_URL}/api/login-client", json={
        "correo": CORREO,
        "contrasenia": CONTRASENIA
    })
    if response.status_code == 200:
        print("🟢 Login exitoso")
        return True
    else:
        print("Error de login:", response.text)
        return False
