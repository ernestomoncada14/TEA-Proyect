const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Valvula", {
    id_valvula: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    id_sector: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ubicacion: {
      type: DataTypes.STRING(225),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: "valvula",
    timestamps: false
  });
};
