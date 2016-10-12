const db = require('../_db');

module.exports = db.define('order', {
  status: {
    type: db.Sequelize.STRING,
    defaultValue: 'cart'
  }
});

