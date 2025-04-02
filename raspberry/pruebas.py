import serial
import time
import requests

# Configuracion de puerto serial
SERIAL_PORT = '/dev/ttyACM0'  #  puerto de arduino en Raspberry Pi
BAUD_RATE = 9600

# Configura tu clave de ThinkSpeak y el canal
THINGSPEAK_API_KEY = "U6JF7I0Z42L1TDYW"
THINGSPEAK_URL = "https://api.thingspeak.com/update"

# Inicializar la conexión serial
try:
    arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)  # Espera para estabilizar la conexión
except Exception as e:
    print(f"Error al conectar con el puerto serial: {e}")
    exit()

def enviar_a_thingspeak(valvula, sensor):
    """
    Envía datos a ThinkSpeak
    """
    try:
        payload = {
            "api_key": THINGSPEAK_API_KEY,
            "field1": valvula,
            "field2": sensor
        }
        response = requests.get(THINGSPEAK_URL, params=payload)
        if response.status_code == 200:
            print("Datos enviados correctamente a ThinkSpeak.")
        else:
            print(f"Error al enviar datos: {response.status_code}")
    except Exception as e:
        print(f"Error de conexión: {e}")

def leer_datos_serial():
    """
    Lee datos del puerto serial
    """
    try:
        line = arduino.readline().decode('utf-8').strip()
        if line:
            print(f"Datos recibidos: {line}")
            return line.split(",")  # Divide la línea en los valores separados por comas
    except Exception as e:
        print(f"Error al leer el puerto serial: {e}")
    return None

if __name__ == "__main__":
    print("Iniciando lectura y envío de datos...")
    while True:
        data = leer_datos_serial()
        if data and len(data) == 2:  # Asegura que hay 2 valores
            valvula, sensor = data
            enviar_a_thingspeak(valvula, sensor)
        time.sleep(15)  # Espera 15 segundos para no exceder el límite de ThinkSpeak
