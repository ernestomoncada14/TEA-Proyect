# arduino/ArduinoSerialManager.py

import serial
import serial.tools.list_ports
import time
import datetime
import json
from database.db_helper import DBHelper
from database.sync import sincronizar_todo

class ArduinoSerialManager:
    def __init__(self, baudrate=9600, timeout=2):
        self.baudrate = baudrate
        self.timeout = timeout
        self.serial = None
        self.puerto = None
        self.en_uso = False
        self.primera_vez = True

    def buscar_puerto(self):
        puertos = list(serial.tools.list_ports.comports())
        for p in puertos:
            if "ttyACM" in p.device or "ttyUSB" in p.device:
                return p.device
        return None

    def conectar(self):
        while True:
            self.puerto = self.buscar_puerto()
            if self.puerto:
                try:
                    print(f"Conectando a Arduino en {self.puerto}...")
                    self.serial = serial.Serial(self.puerto, self.baudrate, timeout=self.timeout)
                    time.sleep(2)  # Esperar reinicio del Arduino
                    print("🟢 Conexión con Arduino establecida.")
                    if self.primera_vez:
                        self.primera_vez = False
                        self.enviar_configuracion_reloj(self.serial)
                    return True
                except Exception as e:
                    print(f"Error al conectar con Arduino: {e}")
            else:
                print("No se encontró un puerto válido para Arduino.")
            print("Reintentando en 5 segundos...")
            time.sleep(5)

    def enviar_json(self, datos, intentos = 1):
        
        if intentos > 100:
            print("Demasiados intentos de envio. Abortando.")
            return
        
        if not self.serial or not self.serial.is_open:
            print("El puerto serial no está abierto.")
            return

        try:
            json_data = json.dumps(datos) + "\n"
            time.sleep(0.1)
            self.serial.write(json_data.encode())
            time.sleep(0.1)
            linea = self.leer_linea()
            ok = linea.split(",")[0]
            # ok = linea
            if ok == "ok":
                print("Enviando datos al Arduino:", json_data)
                print("Respuesta de Arduino:", linea)
                self.serial.reset_output_buffer()
            else:
                print("Error en la respuesta de Arduino:", linea)
                self.enviar_json(datos, intentos + 1)
                
        except Exception as e:
            print("Error al enviar datos:", e)
            # self.conectar()
            self.enviar_json(datos, intentos + 1)

    def leer_linea(self):
        try:
            linea = self.serial.readline().decode("utf-8").strip()
            self.serial.reset_input_buffer()
            return linea
        except Exception as e:
            print("Error al leer del puerto serial:", e)
            self.desconectar()
            self.conectar()
            # self.enviar_todo_a_arduino()
        return None

    def desconectar(self):
        if self.serial and self.serial.is_open:
            self.serial.close()
            print("Desconectado de Arduino.")
            
    def enviar_todo_a_arduino_sync(self):
        while True:
            if not self.en_uso:
                self.en_uso = True
                sincronizar_todo()
                self.enviar_json(DBHelper.obtener_programaciones_completas())
                self.en_uso = False
                break
            else: 
                time.sleep(3)
    
    def leer(self):
        print("iniciado la lectura")
        try:
            while True:
                if not self.en_uso:
                    data = self.leer_linea()
                    if data:
                        print(data)
                    time.sleep(0.5)
        except KeyboardInterrupt:
            print("Lectura interrumpida por el usuario.")
        
    def enviar_todo_a_arduino(self):
        while True:
            if not self.en_uso:
                self.en_uso = True
                self.enviar_json(DBHelper.obtener_programaciones_completas())
                self.en_uso = False
                break
            else: 
                time.sleep(3)
                
                
    def enviar_configuracion_reloj(self, arduino_serial):
        ahora = datetime.datetime.now()

        dia_semana = ahora.weekday() + 1  # Python: lunes=0...domingo=6 → Arduino: domingo=0
        if dia_semana == 7:
            dia_semana = 0

        config = {
            "anio": ahora.year,
            "mes": ahora.month,
            "dia": ahora.day,
            "hora": ahora.hour,
            "minuto": ahora.minute,
            "segundo": ahora.second,
            "dia": dia_semana
        }

        json_config = json.dumps(config) + "\n"
        print("Enviando configuración de reloj:", json_config.strip())
        
        arduino_serial.write(json_config.encode())
        time.sleep(2)

        time.sleep(0.1)
        linea = self.leer_linea()
        if linea.split(",")[0] == "ok":
            print("Respuesta de Arduino:", linea)
            self.serial.reset_output_buffer()
        else:
            print("Error en la respuesta de Arduino:", linea)
            self.enviar_configuracion_reloj(arduino_serial)

