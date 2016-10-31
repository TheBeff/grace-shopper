const db = require("../_db");

module.exports = db.define('address', {
  name: {
	type: db.Sequelize.STRING,
    allowNull: false
  },
  address1: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  address2: {
    type: db.Sequelize.STRING
  },
  city: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  state: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  zip: {
    type: db.Sequelize.INTEGER,
    allowNull: false
  },
  type: {
    type: db.Sequelize.STRING,
    allowNull: false
  }
});
