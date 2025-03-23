const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Sector", {
    id_sector: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(30),
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
    tableName: "sector",
    timestamps: false
  });
};
