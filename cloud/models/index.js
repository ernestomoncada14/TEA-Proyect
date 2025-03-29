const { Sequelize } = require("sequelize");

// Conexión a la base de datos
const sequelize = require("../config/database");

// Importar modelos
const Sector = require("./sector/sector")(sequelize);
const Placa = require("./sector/placa")(sequelize);
const Hogar = require("./sector/hogar")(sequelize);

const Rol = require("./usuarios/rol")(sequelize);
const Permiso = require("./usuarios/permiso")(sequelize);
const RolPermiso = require("./usuarios/rol_permiso")(sequelize);
const Usuario = require("./usuarios/usuario")(sequelize);
const UsuarioHogar = require("./usuarios/usuario_hogar")(sequelize);

const Valvula = require("./valvula/valvula")(sequelize);
const HistorialValvula = require("./valvula/historial_valvula")(sequelize);

const SensorFlujo = require("./sensor/sensor_flujo")(sequelize);
const HistorialFlujo = require("./sensor/historial_flujo")(sequelize);

const DiaSemana = require("./programacion/dia_semana")(sequelize);
const ProgramacionHorario = require("./programacion/programacion_horario")(sequelize);
const DiaProgramacion = require("./programacion/dia_programacion")(sequelize);

// RELACIONES

// Usuario - Rol
Usuario.belongsTo(Rol, { foreignKey: "RolId" });
Rol.hasMany(Usuario, { foreignKey: "RolId" });

// Rol - Permiso (muchos a muchos)
Rol.belongsToMany(Permiso, {
  through: RolPermiso,
  foreignKey: "RolId",
  otherKey: "PermisoId"
});
Permiso.belongsToMany(Rol, {
  through: RolPermiso,
  foreignKey: "PermisoId",
  otherKey: "RolId"
});

// Usuario - Hogar (muchos a muchos)
Usuario.belongsToMany(Hogar, {
  through: UsuarioHogar,
  foreignKey: "UsuarioId",
  otherKey: "HogarId"
});
Hogar.belongsToMany(Usuario, {
  through: UsuarioHogar,
  foreignKey: "HogarId",
  otherKey: "UsuarioId"
});

// Sector - Placa
Placa.belongsTo(Sector, { foreignKey: "SectorId" });
Sector.hasMany(Placa, { foreignKey: "SectorId" });

// Sector - Hogar
Hogar.belongsTo(Sector, { foreignKey: "SectorId" });
Sector.hasMany(Hogar, { foreignKey: "SectorId" });

// Placa - Válvula
Valvula.belongsTo(Placa, { foreignKey: "PlacaId" });
Placa.hasMany(Valvula, { foreignKey: "PlacaId" });

// Válvula - SensorFlujo
SensorFlujo.belongsTo(Valvula, { foreignKey: "ValvulaId" });
Valvula.hasMany(SensorFlujo, { foreignKey: "ValvulaId" });

// SensorFlujo - HistorialFlujo
HistorialFlujo.belongsTo(SensorFlujo, { foreignKey: "SensorId" });
SensorFlujo.hasMany(HistorialFlujo, { foreignKey: "SensorId" });

// Valvula - HistorialValvula
HistorialValvula.belongsTo(Valvula, { foreignKey: "ValvulaId" });
Valvula.hasMany(HistorialValvula, { foreignKey: "ValvulaId" });

// ProgramacionHorario - Usuario
ProgramacionHorario.belongsTo(Usuario, { foreignKey: "UsuarioId" });
Usuario.hasMany(ProgramacionHorario, { foreignKey: "UsuarioId" });

// ProgramacionHorario - Sector
ProgramacionHorario.belongsTo(Sector, { foreignKey: "SectorId" });
Sector.hasMany(ProgramacionHorario, { foreignKey: "SectorId" });

// ProgramacionHorario - DiaProgramacion
DiaProgramacion.belongsTo(ProgramacionHorario, { foreignKey: "ProgramacionId" });
ProgramacionHorario.hasMany(DiaProgramacion, { foreignKey: "ProgramacionId" });

// DiaSemana - DiaProgramacion
DiaProgramacion.belongsTo(DiaSemana, { foreignKey: "DiaId" });
DiaSemana.hasMany(DiaProgramacion, { foreignKey: "DiaId" });

// Exportar todo
module.exports = {
  sequelize,
  Sector,
  Placa,
  Hogar,
  Rol,
  Permiso,
  RolPermiso,
  Usuario,
  UsuarioHogar,
  Valvula,
  HistorialValvula,
  SensorFlujo,
  HistorialFlujo,
  DiaSemana,
  ProgramacionHorario,
  DiaProgramacion
};
