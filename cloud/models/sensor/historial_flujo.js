const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("HistorialFlujo", {
    id_historial: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    id_sensor: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    valor_flujo: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tiempo: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    tableName: "historial_flujo",
    timestamps: false
  });
};
