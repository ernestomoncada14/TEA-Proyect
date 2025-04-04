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
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: "Valvula",
    timestamps: false
  });
};
