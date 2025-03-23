const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("sistema_agua", "root", "123", {
  host: "localhost",
  dialect: "mysql"
});

module.exports = sequelize;
