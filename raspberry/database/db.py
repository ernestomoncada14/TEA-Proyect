import sqlite3

# Nombre de archivo para la base de datos local
DB_FILE = "sistema_agua_local.db"

# Función para inicializar la base de datos con las tablas necesarias
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Crear tablas
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS Sector (
        SectorId INTEGER PRIMARY KEY,
        Nombre TEXT NOT NULL,
        Descripcion TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Placa (
        PlacaId INTEGER PRIMARY KEY,
        SectorId INTEGER NOT NULL,
        Descripcion TEXT NOT NULL,
        PuertoSerie TEXT NOT NULL UNIQUE,
        FOREIGN KEY (SectorId) REFERENCES Sector(SectorId)
    );

    CREATE TABLE IF NOT EXISTS Valvula (
        ValvulaId INTEGER PRIMARY KEY,
        PlacaId INTEGER NOT NULL,
        Descripcion TEXT NOT NULL,
        Pin INTEGER NOT NULL,
        Estado INTEGER NOT NULL,
        FOREIGN KEY (PlacaId) REFERENCES Placa(PlacaId)
    );

    CREATE TABLE IF NOT EXISTS SensorFlujo (
        SensorId INTEGER PRIMARY KEY,
        ValvulaId INTEGER NOT NULL UNIQUE,
        Descripcion TEXT NOT NULL,
        Pin INTEGER NOT NULL,
        Estado INTEGER NOT NULL,
        FOREIGN KEY (ValvulaId) REFERENCES Valvula(ValvulaId)
    );

    CREATE TABLE IF NOT EXISTS HistorialValvula (
        HistorialId INTEGER PRIMARY KEY AUTOINCREMENT,
        ValvulaId INTEGER NOT NULL,
        Estado INTEGER NOT NULL,
        Fecha TIMESTAMP NOT NULL,
        Enviado INTEGER DEFAULT 0,
        FOREIGN KEY (ValvulaId) REFERENCES Valvula(ValvulaId)
    );

    CREATE TABLE IF NOT EXISTS HistorialFlujo (
        HistorialId INTEGER PRIMARY KEY AUTOINCREMENT,
        SensorId INTEGER NOT NULL,
        ValorFlujo REAL NOT NULL,
        Estado BOOLEAN NOT NULL,
        Fecha TIMESTAMP NOT NULL,
        Enviado INTEGER DEFAULT 0,
        FOREIGN KEY (SensorId) REFERENCES SensorFlujo(SensorId)
    );

    CREATE TABLE IF NOT EXISTS DiaSemana (
        DiaId INTEGER PRIMARY KEY,
        Dia TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS ProgramacionHorario (
        ProgramacionId INTEGER PRIMARY KEY,
        SectorId INTEGER NOT NULL,
        HoraInicio TEXT NOT NULL,
        HoraFinal TEXT NOT NULL,
        Estado INTEGER NOT NULL,
        FOREIGN KEY (SectorId) REFERENCES Sector(SectorId)
    );

    CREATE TABLE IF NOT EXISTS DiaProgramacion (
        DiaHorarioId INTEGER PRIMARY KEY AUTOINCREMENT,
        DiaId INTEGER NOT NULL,
        ProgramacionId INTEGER NOT NULL,
        FOREIGN KEY (DiaId) REFERENCES DiaSemana(DiaId),
        FOREIGN KEY (ProgramacionId) REFERENCES ProgramacionHorario(ProgramacionId)
    );
    """)

    conn.commit()
    conn.close()

# Ejecutar la función para crear las tablas
init_db()
