const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('buh5pev0wmpkxzzzunkj', 'uxsvg0q0r58hniyu', 'BOHAFwBGKvil2t1JoGSO', {
  host: 'buh5pev0wmpkxzzzunkj-mysql.services.clever-cloud.com',
  dialect: 'mysql',
});

module.exports = sequelize