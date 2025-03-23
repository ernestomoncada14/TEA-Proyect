import socketio # type: ignore
from config.config import BASE_URL
from session.auth import session
from services.userinfo import obtener_usuario

sio = socketio.Client()

@sio.event
def connect():
    print("🟢 Conectado al WebSocket")

    usuario = obtener_usuario()
    if usuario:
        print(f"Usuario: ID={usuario['id']}, Rol={usuario['rol']}, Permisos={usuario['permisos']}")

@sio.on("nuevo-numero")
def nuevo_numero(data):
    print(f"Nuevo número recibido: ID={data['id']} | Número={data['numero']}")

@sio.event
def disconnect():
    print("Desconectado del WebSocket")

def iniciar_websocket():
    sio.connect(BASE_URL)
    sio.wait()
