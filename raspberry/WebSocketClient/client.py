import socketio
from config.config import BASE_URL
from session.auth import session
import requests
from services.userinfo import obtener_usuario
from database.db_helper import DBHelper
import threading

class WebSocketClient:
    def __init__(self, arduino):
        self.sio = socketio.Client()
        self.arduino = arduino
        self._registrar_eventos()

    def _registrar_eventos(self):
        @self.sio.event
        def connect():
            print("🟢 Conectado al WebSocket")
            self.arduino.hacer_envio = True
            usuario = obtener_usuario()
            if usuario:
                print(f"Usuario: ID={usuario['id']}, Rol={usuario['rol']}, Permisos={usuario['permisos']}")
            threading.Thread(target=self.arduino.enviar_todo_a_arduino_sync).start()

        @self.sio.event
        def disconnect():
            print("Desconectado del WebSocket")
            self.arduino.hacer_envio = False

        @self.sio.on("nueva_programacion")
        def recibir_nueva_programacion(data):
            print("Programación recibida:", data)
            try:
                DBHelper.insertar_programacion_horario({
                    "ProgramacionId": data["ProgramacionId"],
                    "SectorId": data["SectorId"],
                    "HoraInicio": data["HoraInicio"],
                    "HoraFinal": data["HoraFinal"],
                    "Estado": data["Estado"]
                })
                DBHelper.insertar_dia_programacion(data["DiasProgramacion"])
                threading.Thread(target=self.arduino.enviar_todo_a_arduino).start()
                print("Programación y días agregados localmente")
            except Exception as e:
                print("Error al guardar nueva programación:", e)

        @self.sio.on("estado_programacion_actualizado")
        def actualizar_estado_programacion(_):
            self.sincronizar_programacion()

        @self.sio.on("programacion_actualizada")
        def actualizar_programacion(_):
            self.sincronizar_programacion()

        @self.sio.on("programacion_eliminada")
        def eliminar_programacion(_):
            self.sincronizar_programacion()

        @self.sio.on("estado_valvula_actualizado")
        def actualizar_valvula(data):
            try:
                DBHelper.actualizar_estado_valvula(
                    valvula_id=int(data["ValvulaId"]),
                    estado=int(data["NuevoEstado"])
                )
                print("Estado de válvula actualizado.")
                threading.Thread(target=self.arduino.enviar_todo_a_arduino).start()
            except Exception as e:
                print("Error al actualizar válvula:", e)

        # @self.sio.on("estado_sensor_actualizado")
        # def actualizar_sensor(data):
        #     try:
        #         DBHelper.actualizar_estado_sensor(
        #             sensor_id=int(data["SensorId"]),
        #             estado=int(data["NuevoEstado"])
        #         )
        #         print("Estado de sensor actualizado.")
        #         threading.Thread(target=self.arduino.enviar_todo_a_arduino).start()
        #     except Exception as e:
        #         print("Error al actualizar sensor:", e)

    def iniciar_websocket(self):
        token = session.cookies.get("token")
        headers = {}
        if token:
            headers["Cookie"] = f"token={token}"
        try:
            self.sio.connect(BASE_URL, headers=headers)
            self.sio.wait()
        except Exception as e:
            print("Error al conectar al WebSocket:", e)

    def sincronizar_programacion(self):
        print("Programación actualizada. Re-sincronizando...")
        try:
            base_url = f"{BASE_URL}/api/sync"
            res_prog = requests.get(f"{base_url}/programaciones")
            if res_prog.status_code == 200:
                DBHelper.sincronizar_programacion_horario(res_prog.json())
                print("Programaciones sincronizadas.")
            else:
                print(f"Error al obtener programaciones: {res_prog.status_code}")

            res_dias = requests.get(f"{base_url}/dias-programados")
            if res_dias.status_code == 200:
                DBHelper.sincronizar_dia_programacion(res_dias.json())
                print("Días programados sincronizados.")
            else:
                print(f"Error al obtener días programados: {res_dias.status_code}")

        except Exception as e:
            print("Error al re-sincronizar programaciones:", e)
        threading.Thread(target=self.arduino.enviar_todo_a_arduino).start()
