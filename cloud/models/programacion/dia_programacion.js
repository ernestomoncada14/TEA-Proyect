const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("DiaProgramacion", {
    DiaHorarioId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    DiaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ProgramacionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: "DiaProgramacion",
    timestamps: false
  });
};
