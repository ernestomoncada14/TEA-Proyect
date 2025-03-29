const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("HistorialValvula", {
    HistorialId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ValvulaId: {
      type: DataTypes.INTEGER,
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
    tableName: "HistorialValvula",
    timestamps: false
  });
};
