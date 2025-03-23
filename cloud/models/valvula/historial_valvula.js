const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("HistorialValvula", {
    id_historial: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    id_valvula: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tiempo: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    tableName: "historial_valvula",
    timestamps: false
  });
};
