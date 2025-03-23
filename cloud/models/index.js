const { Sequelize } = require("sequelize");

// Conexión a la base de datos
const sequelize = require("../config/database");

// Importar modelos
const Sector = require("./sector/sector")(sequelize);
const Rol = require("./usuarios/rol")(sequelize);
const Permiso = require("./usuarios/permiso")(sequelize);
const RolPermiso = require("./usuarios/rol_permiso")(sequelize);
const Usuario = require("./usuarios/usuario")(sequelize);
const SensorFlujo = require("./sensor/sensor_flujo")(sequelize);
const Valvula = require("./valvula/valvula")(sequelize);
const DiaSemana = require("./programacion/dia_semana")(sequelize);
const ProgramacionHorario = require("./programacion/programacion_horario")(sequelize);
const HistorialFlujo = require("./sensor/historial_flujo")(sequelize);
const HistorialValvula = require("./valvula/historial_valvula")(sequelize);

// RELACIONES

// Usuario - Rol
Usuario.belongsTo(Rol, { foreignKey: "id_rol" });
Rol.hasMany(Usuario, { foreignKey: "id_rol" });

// Rol - Permiso (Muchos a muchos)
Rol.belongsToMany(Permiso, {
  through: RolPermiso,
  foreignKey: "id_rol",
  otherKey: "id_permiso"
});
Permiso.belongsToMany(Rol, {
  through: RolPermiso,
  foreignKey: "id_permiso",
  otherKey: "id_rol"
});

// SensorFlujo - Sector
SensorFlujo.belongsTo(Sector, { foreignKey: "id_sector" });
Sector.hasMany(SensorFlujo, { foreignKey: "id_sector" });

// Valvula - Sector
Valvula.belongsTo(Sector, { foreignKey: "id_sector" });
Sector.hasMany(Valvula, { foreignKey: "id_sector" });

// ProgramacionHorario - Usuario
ProgramacionHorario.belongsTo(Usuario, { foreignKey: "id_usuario" });
Usuario.hasMany(ProgramacionHorario, { foreignKey: "id_usuario" });

// ProgramacionHorario - Sector
ProgramacionHorario.belongsTo(Sector, { foreignKey: "id_sector" });
Sector.hasMany(ProgramacionHorario, { foreignKey: "id_sector" });

// ProgramacionHorario - DiaSemana
ProgramacionHorario.belongsTo(DiaSemana, { foreignKey: "id_dia" });
DiaSemana.hasMany(ProgramacionHorario, { foreignKey: "id_dia" });

// HistorialFlujo - SensorFlujo
HistorialFlujo.belongsTo(SensorFlujo, { foreignKey: "id_sensor" });
SensorFlujo.hasMany(HistorialFlujo, { foreignKey: "id_sensor" });

// HistorialValvula - Valvula
HistorialValvula.belongsTo(Valvula, { foreignKey: "id_valvula" });
Valvula.hasMany(HistorialValvula, { foreignKey: "id_valvula" });

// Exportar todo
module.exports = {
  sequelize,
  Sector,
  Rol,
  Permiso,
  RolPermiso,
  Usuario,
  SensorFlujo,
  Valvula,
  DiaSemana,
  ProgramacionHorario,
  HistorialFlujo,
  HistorialValvula
};
