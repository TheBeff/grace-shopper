const db = require('../_db');

module.exports = db.define('review', {
  content: {
    type: db.Sequelize.TEXT,
    allowNull: false
  },
  rate: {
  	type: db.Sequelize.ARRAY(db.Sequelize.STRING)
  }
});
