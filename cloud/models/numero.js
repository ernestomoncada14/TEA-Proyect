const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Numero", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    numero: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: "numeros",
    timestamps: false
  });
};
