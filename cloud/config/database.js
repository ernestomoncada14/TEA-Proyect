const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("pruebasApp", "root", "123", {
  host: "localhost",
  dialect: "mysql"
});

module.exports = sequelize;
