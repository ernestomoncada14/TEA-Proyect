const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Rol", {
    RolId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    NombreRol: {
      type: DataTypes.STRING(15),
      allowNull: false
    }
  }, {
    tableName: "Rol",
    timestamps: false
  });
};
