const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Valvula", {
    ValvulaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    PlacaId: {
      type: DataTypes.INTEGER,
      allowNull: false
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
        min: 10
      },
      allowNull: false
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: "Valvula",
    timestamps: false
  });
};
