const db = require('../_db');

module.exports = db.define('product', {
  title: db.Sequelize.STRING,
  description: db.Sequelize.TEXT,
  price: db.Sequelize.FLOAT,
  inventory_qty: db.Sequelize.INTEGER,
  photos: {
    type: db.Sequelize.TEXT,
    defaultValue: 'http://www.fillmurray.com/200/300'
  },
  category: {
    type: db.Sequelize.STRING,
    allowNull: false
  }
});
