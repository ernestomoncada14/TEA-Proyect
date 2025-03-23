const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("DiaSemana", {
    id_dia: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    dia: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: "dia_semana",
    timestamps: false
  });
};
