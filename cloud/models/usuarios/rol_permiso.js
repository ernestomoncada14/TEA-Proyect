const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("RolPermiso", {
    PermisoId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    RolId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    tableName: "RolPermiso",
    timestamps: false
  });
};
