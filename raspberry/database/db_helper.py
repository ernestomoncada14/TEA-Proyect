# db_helper.py
import sqlite3
import json
from collections import defaultdict
from datetime import datetime

DB_FILE = "sistema_agua_local.db"

class DBHelper:

    @staticmethod
    def insertar_historial_valvula(valvula_id: int, estado: int):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO HistorialValvula (ValvulaId, Estado, Fecha, Enviado)
            VALUES (?, ?, ?, 0)
        """, (valvula_id, estado, datetime.now().isoformat()))
        conn.commit()
        conn.close()

    @staticmethod
    def insertar_historial_flujo(sensor_id: int, valor_flujo: float):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO HistorialFlujo (SensorId, ValorFlujo, Fecha, Enviado)
            VALUES (?, ?, ?, 0)
        """, (sensor_id, valor_flujo, datetime.now().isoformat()))
        conn.commit()
        conn.close()

    @staticmethod
    def obtener_programaciones_activas():
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ProgramacionId, SectorId, HoraInicio, HoraFinal FROM ProgramacionHorario
            WHERE Estado = 1
        """)
        resultados = cursor.fetchall()
        conn.close()
        return resultados

    @staticmethod
    def obtener_dias_programados(programacion_id: int):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DiaSemana.Dia FROM DiaProgramacion
            JOIN DiaSemana ON DiaSemana.DiaId = DiaProgramacion.DiaId
            WHERE DiaProgramacion.ProgramacionId = ?
        """, (programacion_id,))
        dias = [fila[0] for fila in cursor.fetchall()]
        conn.close()
        return dias

    @staticmethod
    def actualizar_estado_valvula(valvula_id: int, nuevo_estado: int):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE Valvula SET Estado = ? WHERE ValvulaId = ?
        """, (nuevo_estado, valvula_id))
        conn.commit()
        conn.close()

    @staticmethod
    def marcar_historial_enviado(tabla: str, id_: int):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        query = f"UPDATE {tabla} SET Enviado = 1 WHERE HistorialId = ?"
        cursor.execute(query, (id_,))
        conn.commit()
        conn.close()
        
#####################################################################SINCRONIZAR###########################################################################################
        
    @staticmethod
    def sincronizar_dia_semana(lista_dias):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM DiaSemana")
        for dia in lista_dias:
            cursor.execute("INSERT INTO DiaSemana (DiaId, Dia) VALUES (?, ?)", (dia["DiaId"], dia["Dia"]))
        conn.commit()
        conn.close()

    @staticmethod
    def sincronizar_programacion_horario(lista_programaciones):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM ProgramacionHorario")
        for p in lista_programaciones:
            cursor.execute("""
                INSERT INTO ProgramacionHorario (ProgramacionId, SectorId, HoraInicio, HoraFinal, Estado)
                VALUES (?, ?, ?, ?, ?)
            """, (p["ProgramacionId"], p["SectorId"], p["HoraInicio"], p["HoraFinal"], p["Estado"]))
        # for con rango del 1 al 3
        # for i in range(1, 4):
        #     cursor.execute("""
        #         INSERT INTO ProgramacionHorario (ProgramacionId, SectorId, HoraInicio, HoraFinal, Estado)
        #         VALUES (?, ?, ?, ?, ?)
        #     """, (i * -1, i, "0:00:00", "00:00:00", 1))
        conn.commit()
        conn.close()

    @staticmethod
    def sincronizar_dia_programacion(lista_dias_programados):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM DiaProgramacion")
        for dp in lista_dias_programados:
            cursor.execute("""
                INSERT INTO DiaProgramacion (DiaHorarioId, DiaId, ProgramacionId)
                VALUES (?, ?, ?)
            """, (dp["DiaHorarioId"], dp["DiaId"], dp["ProgramacionId"]))
        # for i in range(1,4):
        #     cursor.execute("""
        #         INSERT INTO DiaProgramacion (DiaHorarioId, DiaId, ProgramacionId)
        #         VALUES (?, ?, ?)
        #     """, (i * -1, 1, i * -1))
        conn.commit()
        conn.close()

    @staticmethod
    def sincronizar_sector(lista_sectores):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Sector")
        for s in lista_sectores:
            cursor.execute("INSERT INTO Sector (SectorId, Nombre, Descripcion) VALUES (?, ?, ?)", (s["SectorId"], s["Nombre"], s["Descripcion"]))
        conn.commit()
        conn.close()

    @staticmethod
    def sincronizar_placa(lista_placas):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Placa")
        for placa in lista_placas:
            cursor.execute("""
                INSERT INTO Placa (PlacaId, SectorId, Descripcion, PuertoSerie)
                VALUES (?, ?, ?, ?)
            """, (placa["PlacaId"], placa["SectorId"], placa["Descripcion"], placa["PuertoSerie"]))
        conn.commit()
        conn.close()

    @staticmethod
    def sincronizar_valvula(lista_valvulas):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Valvula")
        for valvula in lista_valvulas:
            cursor.execute("""
                INSERT INTO Valvula (ValvulaId, PlacaId, Descripcion, Pin, Estado)
                VALUES (?, ?, ?, ?, ?)
            """, (valvula["ValvulaId"], valvula["PlacaId"], valvula["Descripcion"], valvula["Pin"], valvula["Estado"]))
        conn.commit()
        conn.close()

    @staticmethod
    def sincronizar_sensor_flujo(lista_sensores):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM SensorFlujo")
        for sensor in lista_sensores:
            cursor.execute("""
                INSERT INTO SensorFlujo (SensorId, ValvulaId, Descripcion, Pin, Estado)
                VALUES (?, ?, ?, ?, ?)
            """, (sensor["SensorId"], sensor["ValvulaId"], sensor["Descripcion"], sensor["Pin"], sensor["Estado"]))
        conn.commit()
        conn.close()
        
#########################################################################################################################################

    @staticmethod
    def insertar_programacion_horario(programacion):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO ProgramacionHorario (ProgramacionId, SectorId, HoraInicio, HoraFinal, Estado)
            VALUES (?, ?, ?, ?, ?)
        """, (
            programacion["ProgramacionId"],
            programacion["SectorId"],
            programacion["HoraInicio"],
            programacion["HoraFinal"],
            programacion["Estado"]
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def insertar_dia_programacion(dias):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        for d in dias:
            cursor.execute("""
                INSERT OR REPLACE INTO DiaProgramacion (DiaHorarioId, DiaId, ProgramacionId)
                VALUES (?, ?, ?)
            """, (d["DiaHorarioId"], d["DiaId"], d["ProgramacionId"]))
        conn.commit()
        conn.close()
        
    @staticmethod
    def actualizar_estado_valvula(valvula_id: int, estado: int, pin: int = None):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        if pin is not None:
            cursor.execute("""
                UPDATE Valvula SET Estado = ?, Pin = ? WHERE ValvulaId = ?
            """, (estado, pin, valvula_id))
        else:
            cursor.execute("""
                UPDATE Valvula SET Estado = ? WHERE ValvulaId = ?
            """, (estado, valvula_id))

        conn.commit()
        conn.close()

    @staticmethod
    def actualizar_estado_sensor(sensor_id: int, estado: int, pin: int = None):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        if pin is not None:
            cursor.execute("""
                UPDATE SensorFlujo SET Estado = ?, Pin = ? WHERE SensorId = ?
            """, (estado, pin, sensor_id))
        else:
            cursor.execute("""
                UPDATE SensorFlujo SET Estado = ? WHERE SensorId = ?
            """, (estado, sensor_id))

        conn.commit()
        conn.close()
        
    @staticmethod
    def obtener_programaciones_completas():
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        cursor.execute("""
        SELECT
        ph.ProgramacionId,
        ph.HoraInicio,
        ph.HoraFinal,
        ds.Dia AS DiaSemana,
        v.ValvulaId,
        v.Pin AS PinValvula,
        v.Estado AS EstadoValvula,
        s.SensorId,
        s.Pin AS PinSensor,
        s.Estado AS EstadoSensor
        FROM ProgramacionHorario ph
        JOIN DiaProgramacion dp ON ph.ProgramacionId = dp.ProgramacionId
        JOIN DiaSemana ds ON dp.DiaId = ds.DiaId
        JOIN Sector sec ON ph.SectorId = sec.SectorId
        JOIN Placa p ON p.SectorId = sec.SectorId
        JOIN Valvula v ON v.PlacaId = p.PlacaId
        LEFT JOIN SensorFlujo s ON s.ValvulaId = v.ValvulaId
        WHERE ph.Estado = 1
        ORDER BY ph.ProgramacionId, ds.DiaId
        """)

        rows = cursor.fetchall()
        conn.close()

        programaciones = {}
        for row in rows:
            pid = row[0]
            if pid not in programaciones:
                programaciones[pid] = {
                    "ProgramacionId": pid,
                    "HoraInicio": row[1],
                    "HoraFinal": row[2],
                    "Dias": set(),
                    "Valvulas": [],
                    "Sensores": []
                }

            programaciones[pid]["Dias"].add(row[3])  # Día
            valvula = {"ValvulaId": row[4], "Pin": row[5], "Estado": row[6], "Manual": row[6]}
            if valvula not in programaciones[pid]["Valvulas"]:
                programaciones[pid]["Valvulas"].append(valvula)

            if row[7] is not None:
                sensor = {"SensorId": row[7], "Pin": row[8], "Estado": row[9], "Manual": row[9]}
                if sensor not in programaciones[pid]["Sensores"]:
                    programaciones[pid]["Sensores"].append(sensor)

        # Convertir sets de días en listas
        resultado = []
        for prog in programaciones.values():
            prog["Dias"] = list(prog["Dias"])
            resultado.append(prog)

        return resultado


