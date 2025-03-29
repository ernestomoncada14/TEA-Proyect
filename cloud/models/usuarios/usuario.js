const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Usuario", {
    UsuarioId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    RolId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    NombreCompleto: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Correo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    Contrasenia: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: "Usuario",
    timestamps: false
  });
};
