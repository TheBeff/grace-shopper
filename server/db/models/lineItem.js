const db = require('../_db');

module.exports = db.define('lineItem', {
  quantity: db.Sequelize.INTEGER,
  price: db.Sequelize.FLOAT
});


