const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("RolPermiso", {
    id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    id_permiso: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    tableName: "rol_permiso",
    timestamps: false
  });
};
