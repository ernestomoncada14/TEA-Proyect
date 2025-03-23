const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("ProgramacionHorario", {
    id_programacion: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    minuto_final: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_sector: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_dia: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hora_inicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    hora_final: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: "programacion_horario",
    timestamps: false
  });
};
