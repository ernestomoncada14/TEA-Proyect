-- Eliminar base de datos si ya existe
DROP DATABASE IF EXISTS sistema_agua;

-- Crear base de datos
CREATE DATABASE sistema_agua;

-- Seleccionar base de datos
USE sistema_agua;

-- Desactivar comprobación de claves foráneas para permitir drops ordenados
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas si existen (en orden inverso de dependencias)
DROP TABLE IF EXISTS Sector;
DROP TABLE IF EXISTS Placa;
DROP TABLE IF EXISTS Permiso;
DROP TABLE IF EXISTS Rol;
DROP TABLE IF EXISTS RolPermiso;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS Hogar;
DROP TABLE IF EXISTS UsuarioHogar;
DROP TABLE IF EXISTS DiaSemana;
DROP TABLE IF EXISTS ProgramacionHorario;
DROP TABLE IF EXISTS DiaProgramacion;
DROP TABLE IF EXISTS SensorFlujo;
DROP TABLE IF EXISTS Valvula;
DROP TABLE IF EXISTS HistorialValvula;
DROP TABLE IF EXISTS HistorialFlujo;

SET FOREIGN_KEY_CHECKS = 1;

-- Crear tabla de Sector
CREATE TABLE Sector (
    SectorId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Nombre VARCHAR(30) NOT NULL,
    GeoMetria POLYGON,
    Descripcion TEXT NOT NULL,
    SPATIAL INDEX (GeoMetria)
);

-- Crear tabla de Rol
CREATE TABLE Rol (
    RolId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    NombreRol VARCHAR(15) NOT NULL
);

-- Crear tabla de Permiso
CREATE TABLE Permiso (
    PermisoId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    NombrePermiso VARCHAR(255) NOT NULL,
    UNIQUE (NombrePermiso)
);

-- Crear tabla de RolPermiso (relación muchos a muchos)
CREATE TABLE RolPermiso (
    PermisoId INT NOT NULL,
    RolId INT NOT NULL,
    PRIMARY KEY (PermisoId, RolId),
    FOREIGN KEY (PermisoId) REFERENCES Permiso(PermisoId),
    FOREIGN KEY (RolId) REFERENCES Rol(RolId)
);

-- Crear tabla de Usuario
CREATE TABLE Usuario (
    UsuarioId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    RolId INT NOT NULL,
    NombreCompleto VARCHAR(50) NOT NULL,
    Correo VARCHAR(50) NOT NULL,
    Contrasenia VARCHAR(30) NOT NULL,
    UNIQUE (Correo),
    FOREIGN KEY (RolId) REFERENCES Rol(RolId)
);

-- Crear tabla de Placa
CREATE TABLE Placa (
    PlacaId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    SectorId INT NOT NULL,
    Descripcion TEXT NOT NULL,
    Ubicacion POINT,
    PuertoSerie VARCHAR(15) NOT NULL,
    UNIQUE (PuertoSerie),
    SPATIAL INDEX (Ubicacion),
    FOREIGN KEY (SectorId) REFERENCES Sector(SectorId)
);

-- Crear tabla de Valvula
CREATE TABLE Valvula (
    ValvulaId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    PlacaId INT NOT NULL,
    Ubicacion POINT,
    Descripcion TEXT NOT NULL,
    Pin INT NOT NULL,
    Estado BOOLEAN NOT NULL,
    SPATIAL INDEX (Ubicacion),
    FOREIGN KEY (PlacaId) REFERENCES Placa(PlacaId)
);

-- Crear tabla de SensorFlujo
CREATE TABLE SensorFlujo (
    SensorId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    ValvulaId INT NOT NULL,
    Ubicacion POINT,
    Descripcion TEXT NOT NULL,
    Pin INT NOT NULL,
    Estado BOOLEAN NOT NULL,
    UNIQUE (ValvulaId),
    SPATIAL INDEX (Ubicacion),
    FOREIGN KEY (ValvulaId) REFERENCES Valvula(ValvulaId)
);

-- Crear tabla de Hogar
CREATE TABLE Hogar (
    HogarId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    SectorId INT NOT NULL,
    Descripcion VARCHAR(100) NOT NULL,
    GeoMetria POLYGON,
    SPATIAL INDEX (GeoMetria),
    FOREIGN KEY (SectorId) REFERENCES Sector(SectorId)
);

-- Crear tabla de UsuarioHogar (relación muchos a muchos)
CREATE TABLE UsuarioHogar (
    HogarId INT NOT NULL,
    UsuarioId INT NOT NULL,
    PRIMARY KEY (HogarId, UsuarioId),
    FOREIGN KEY (HogarId) REFERENCES Hogar(HogarId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

-- Crear tabla de ProgramacionHorario
CREATE TABLE ProgramacionHorario (
    ProgramacionId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    SectorId INT NOT NULL,
    UsuarioId INT NOT NULL,
    HoraInicio TIME NOT NULL,
    HoraFinal TIME NOT NULL,
    Estado BOOLEAN NOT NULL,
    FOREIGN KEY (SectorId) REFERENCES Sector(SectorId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

-- Crear tabla de DiaSemana
CREATE TABLE DiaSemana (
    DiaId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Dia VARCHAR(12) NOT NULL,
    UNIQUE (Dia)
);

-- Crear tabla de DiaProgramacion
CREATE TABLE DiaProgramacion (
    DiaHorarioId INT NOT NULL AUTO_INCREMENT,
    DiaId INT NOT NULL,
    ProgramacionId INT NOT NULL,
    PRIMARY KEY (DiaHorarioId),
    FOREIGN KEY (DiaId) REFERENCES DiaSemana(DiaId),
    FOREIGN KEY (ProgramacionId) REFERENCES ProgramacionHorario(ProgramacionId)
);

-- Crear tabla de HistorialFlujo
CREATE TABLE HistorialFlujo (
    HistorialId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    SensorId INT NOT NULL,
    ValorFlujo FLOAT NOT NULL,
    Fecha TIMESTAMP NOT NULL,
    FOREIGN KEY (SensorId) REFERENCES SensorFlujo(SensorId)
);

-- Crear tabla de HistorialValvula
CREATE TABLE HistorialValvula (
    HistorialId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    ValvulaId INT NOT NULL,
    Estado BOOLEAN NOT NULL,
    Fecha TIMESTAMP NOT NULL,
    FOREIGN KEY (ValvulaId) REFERENCES Valvula(ValvulaId)
);
