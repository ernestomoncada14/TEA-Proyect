import requests # type: ignore
from database.db_helper import DBHelper
from config.config import BASE_URL

BASE_URL = f"{BASE_URL}/api/sync"

def sincronizar_todo():
    endpoints = {
        "diasemana": DBHelper.sincronizar_dia_semana,
        "programaciones": DBHelper.sincronizar_programacion_horario,
        "dias-programados": DBHelper.sincronizar_dia_programacion,
        "sectores": DBHelper.sincronizar_sector,
        "placas": DBHelper.sincronizar_placa,
        "valvulas": DBHelper.sincronizar_valvula,
        "sensores": DBHelper.sincronizar_sensor_flujo,
    }

    for nombre, funcion in endpoints.items():
        try:
            res = requests.get(f"{BASE_URL}/{nombre}")
            if res.status_code == 200:
                data = res.json()
                funcion(data)
                print(f"✅ {nombre} sincronizado")
            else:
                print(f"Error al obtener {nombre}")
        except Exception as e:
            print(f"Error en {nombre}: {e}")
