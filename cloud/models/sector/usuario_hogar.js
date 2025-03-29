const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("UsuarioHogar", {
    HogarId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    UsuarioId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    tableName: "UsuarioHogar",
    timestamps: false
  });
};
