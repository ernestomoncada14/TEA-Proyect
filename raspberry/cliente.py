import socketio # type: ignore
import requests
import threading

# URL del servidor
BASE_URL = "http://localhost:3000"

# Cliente Socket.IO
sio = socketio.Client()

@sio.event
def connect():
    print("✅ Conectado al servidor WebSocket")
    # Solicitar la lista de números a la API
    response = requests.get(f"{BASE_URL}/api/get-ultimos")
    if response.status_code == 200:
        print("📥 Lista de ultimos 3 números:")
        for numero in response.json():
            print(f"numero con ID={numero['id']} | Número={numero['numero']}")
    else:
        print(f"⚠️ Error al obtener la lista de números: {response.status_code}")

@sio.on("nuevo-numero")
def nuevo_numero(data):
    print(f"📥 Nuevo número recibido: ID={data['id']} | Número={data['numero']}")

@sio.event
def disconnect():
    print("❌ Desconectado del servidor")

# Función para enviar nuevos números a la API
def enviar_numeros():
    while True:
        numero = input("Ingresa un nuevo número (o 'salir' para terminar): ")
        if numero.lower() == "salir":
            break
        try:
            response = requests.post(f"{BASE_URL}/api/numeros", json={"numero": numero})
            if response.status_code == 200:
                print("✅ Número enviado correctamente")
            else:
                print(f"⚠️ Error al enviar número: {response.status_code}")
        except Exception as e:
            print("❌ Error de conexión:", e)

# Iniciar conexión al WebSocket
sio.connect(BASE_URL)

# Ejecutar el input en un hilo separado para no bloquear el WebSocket
threading.Thread(target=enviar_numeros).start()

# Mantener el cliente vivo
sio.wait()
