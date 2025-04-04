import serial
import time
import requests
from datetime import datetime, timezone
import serial.tools.list_ports

# Endpoints de tu aplicación
URL_VALVULA = "http://localhost:3000/api/valvulas/1/historial"
URL_SENSOR  = "http://localhost:3000/api/sensores/1/historial"

arduino = None

def buscar_puerto_arduino():
    """Busca un puerto válido que parezca ser un Arduino"""
    puertos = list(serial.tools.list_ports.comports())
    for p in puertos:
        if "ttyACM" in p.device:
            return p.device
    return None

def conectar_serial():
    global arduino
    while True:
        puerto = buscar_puerto_arduino()
        if puerto:
            try:
                print(f"Conectando al puerto serial ({puerto})...")
                arduino = serial.Serial(puerto, 9600, timeout=1)
                time.sleep(2)
                print("Conexión serial establecida.")
                return
            except Exception as e:
                print(f"Error al abrir el puerto {puerto}: {e}")
        else:
            print("No se encontró un puerto válido para Arduino.")
        print("Reintentando en 5 segundos...")
        time.sleep(5)

def enviar_a_api(valvula, sensor):
    timestamp = datetime.now(timezone.utc).isoformat()
    try:
        r1 = requests.post(URL_VALVULA, json=[{
            "Estado": int(valvula),
            "Fecha": timestamp
        }], timeout=5)
        r2 = requests.post(URL_SENSOR, json=[{
            "ValorFlujo": float(sensor),
            "Fecha": timestamp
        }], timeout=5)

        if r1.status_code == 201:
            print("Datos de válvula enviados correctamente.")
        else:
            print(f"Error al enviar datos de válvula: {r1.status_code} - {r1.text}")

        if r2.status_code == 201:
            print("Datos de sensor enviados correctamente.")
        else:
            print(f"Error al enviar datos de sensor: {r2.status_code} - {r2.text}")
    except Exception as e:
        print(f"Error al enviar datos a la API: {e}")

def leer_datos_serial():
    global arduino
    try:
        line = arduino.readline().decode('utf-8').strip()
        if line:
            print(f"Datos recibidos: {line}")
            return line.split(",")
    except Exception as e:
        print(f"Error al leer el puerto serial: {e}")
        print("Intentando reconectar el puerto serial...")
        conectar_serial()
    return None

if __name__ == "__main__":
    print("Iniciando lectura y envío de datos...")
    conectar_serial()

    while True:
        data = leer_datos_serial()
        if data and len(data) == 2:
            valvula, sensor = data
            enviar_a_api(valvula, sensor)
        time.sleep(5)
