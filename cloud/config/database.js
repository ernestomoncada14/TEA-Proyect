const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("sistema_agua", "agua", "123456789", {
  host: "localhost",
  dialect: "mysql"
});

module.exports = sequelize;
