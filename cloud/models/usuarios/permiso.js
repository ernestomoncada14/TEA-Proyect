const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Permiso", {
    id_permiso: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    permiso: {
      type: DataTypes.STRING(15),
      allowNull: false
    }
  }, {
    tableName: "permiso",
    timestamps: false
  });
};
