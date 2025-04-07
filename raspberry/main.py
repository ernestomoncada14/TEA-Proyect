import threading
from session.auth import login
import time
from WebSocketClient.client import WebSocketClient
from Arduino.ArduinoSerialManager import ArduinoSerialManager

arduino = ArduinoSerialManager()
arduino_thread = threading.Thread(target=arduino.conectar)
arduino_thread.start()
arduino_thread.join()
threading.Thread(target=arduino.leer).start()
websocket = WebSocketClient(arduino)

def main():
    # Intentar hacer login inicialmente
    
    if login():
        print("Conexión exitosa. Iniciando WebSocket.")
        websocket.iniciar_websocket()  # Si el login es exitoso, inicia WebSocket
    else:
        # Si el login falla, comienza el proceso de reintento automático en segundo plano
        login_thread = threading.Thread(target=realizar_login_automatico)
        login_thread.start()
        print("Iniciando proceso de reintento automático de login en segundo plano.")
    
    
def realizar_login_automatico():
    while True:
        print("Intentando realizar login...")
        if login():
            print("Conexión exitosa. Iniciando WebSocket.")
            websocket.iniciar_websocket()  # Si el login es exitoso, inicia WebSocket
            break  # Salir del bucle cuando el login sea exitoso
        else:
            print("Login fallido, reintentando en 5 segundos.")
            time.sleep(5)  # Espera 5 segundos antes de intentar nuevamente
 
 
if __name__ == "__main__":
    main()