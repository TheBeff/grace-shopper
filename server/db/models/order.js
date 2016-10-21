const db = require('../_db');

const Order = db.define('order', {
  status: {
    type: db.Sequelize.STRING,
    defaultValue: 'cart'
  }
});

module.exports = Order
