const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Placa", {
    PlacaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    SectorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Ubicacion: {
      type: DataTypes.GEOMETRY("POINT"),
      allowNull: true
    },
    PuertoSerie: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: "Placa",
    timestamps: false
  });
};
