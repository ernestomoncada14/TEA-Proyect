import socketio
from config.config import BASE_URL
from session.auth import session
import requests
from services.userinfo import obtener_usuario
from database.db_helper import DBHelper
import threading

class WebSocketClient:
    def __init__(self, arduino):
        self.sio = socketio.Client(reconnection=False)
        self.arduino = arduino
        self._registrar_eventos()
    
    def _generar_headers(self):
        token = session.cookies.get("token")
        if token:
            return {
                "Cookie": f"token={token}"
            }
        return {}

    def _registrar_eventos(self):
        @self.sio.event
        def connect():
            print("🟢 Conectado al WebSocket")
            self.arduino.hacer_envio = True
            usuario = obtener_usuario()
            if usuario:
                print(f"Usuario: ID={usuario['id']}, Rol={usuario['rol']}, Permisos={usuario['permisos']}")
            enviar_arduino = threading.Thread(target=self.arduino.enviar_todo_a_arduino_sync)
            enviar_arduino.start()
            enviar_arduino.join()
            historialV = DBHelper.obtener_historial_valvula_NoEnviado()
            historialS = DBHelper.obtener_historial_flujo_NoEnviado()
            # realizar el envio de los historiales no enviados a la nube por medio de sus endpoints
            if historialV or historialS:
                HValvulas = [
                    {
                        "HistorialId": h[0],
                        "ValvulaId": h[1],
                        "Estado": h[2],
                        "Fecha": h[3]
                    }
                    for h in historialV
                ]

                # Mapear historial de sensores
                HSensores = [
                    {
                        "HistorialId": h[0],
                        "SensorId": h[1],
                        "ValorFlujo": h[2],
                        "Estado": h[3],
                        "Fecha": h[4]
                    }
                    for h in historialS
                ]
                token = session.cookies.get("token")
                headers = {}
                if token:
                    headers["Cookie"] = f"token={token}"
                r1 = requests.post(f"{BASE_URL}/api/valvulas/historial", headers=headers, json=HValvulas, timeout=5)
                r2 = requests.post(f"{BASE_URL}/api/sensores/historial", headers=headers, json=HSensores, timeout=5)
                if r1.status_code == 201 and r2.status_code == 201:
                    print("Historiales enviados correctamente.")
                    DBHelper.actualizar_todos_historial_enviado()
                else:
                    print("Error al enviar los historiales:", r1.status_code, r2.status_code)
            
        @self.sio.event
        def disconnect(data=None):
            print("Desconectado del WebSocket")
            self.arduino.hacer_envio = False
            
            def reconectar():
                import time
                while True:
                    time.sleep(5)
                    try:
                        token = session.cookies.get("token")
                        headers = {"Cookie": f"token={token}"} if token else {}
                        self.sio.connect(BASE_URL, headers=headers)
                        print("Reconectado al WebSocket")
                        return
                    except Exception as e:
                        print(f"Fallo al reconectar: {e}")

            threading.Thread(target=reconectar).start()

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

        @self.sio.on("estado_valvula_actualizado_M")
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
