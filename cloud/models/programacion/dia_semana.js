const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("DiaSemana", {
    DiaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Dia: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: "DiaSemana",
    timestamps: false
  });
};
