const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("SensorFlujo", {
    SensorId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ValvulaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    Ubicacion: {
      type: DataTypes.GEOMETRY("POINT"),
      allowNull: true
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: "SensorFlujo",
    timestamps: false
  });
};
