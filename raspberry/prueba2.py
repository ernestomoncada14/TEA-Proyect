import serial
import json
import time

# Configura el puerto serial al que está conectado Arduino
ser = serial.Serial("/dev/ttyACM0", 9600, timeout=1) # Ajusta el puerto según tu sistema
time.sleep(2)  # Tiempo para asegurar que la comunicación serial esté lista

# Crear un diccionario con distintos tipos de datos
data = {
    'nombre': 'Arduino',
    'numero': 123,
    'flotante': 3.14,
    'activo': True
}

# Convertir el diccionario en un JSON
json_data = json.dumps(data)

# Enviar el JSON por puerto serial
ser.write(json_data.encode())  # Convierte a bytes antes de enviarlo

print(f"Enviado a Arduino: {json_data}")

while True:
    line = ser.readline().decode('utf-8').strip()
    if line:
        print(f"Datos recibidos: {line}")
        break

# Cerrar el puerto serial
ser.close()
