const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Sector", {
    SectorId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nombre: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    GeoMetria: {
      type: DataTypes.GEOMETRY("POLYGON"),
      allowNull: true
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: "Sector",
    timestamps: false
  });
};
