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
    Pin: {
      type: DataTypes.INTEGER,
      unique: true,
      validate: {
        isNumeric: true
      },
      validate: {
        isInt: true
      },
      validate: {
        min: 2
      },
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
