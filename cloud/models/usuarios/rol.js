const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Rol", {
    id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    nombre_rol: {
      type: DataTypes.STRING(15),
      allowNull: false
    }
  }, {
    tableName: "rol",
    timestamps: false
  });
};
