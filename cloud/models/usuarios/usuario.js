const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Usuario", {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre_completo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    contrasenia: {
      type: DataTypes.STRING(30),
      allowNull: false
    }
  }, {
    tableName: "usuario",
    timestamps: false
  });
};
