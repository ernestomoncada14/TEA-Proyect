const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("HistorialFlujo", {
    HistorialId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    SensorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ValorFlujo: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Fecha: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: "HistorialFlujo",
    timestamps: false
  });
};
