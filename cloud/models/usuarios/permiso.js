const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Permiso", {
    PermisoId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    NombrePermiso: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: "Permiso",
    timestamps: false
  });
};
