const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Hogar", {
    HogarId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    SectorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    GeoMetria: {
      type: DataTypes.GEOMETRY("POLYGON"),
      allowNull: true
    }
  }, {
    tableName: "Hogar",
    timestamps: false
  });
};
