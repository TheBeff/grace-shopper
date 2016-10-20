const db = require('../_db');
const lineItem = require('../');

console.log(lineItem);
const Order = db.define('order', {
  status: {
    type: db.Sequelize.STRING,
    defaultValue: 'cart'
  }
}, {
  classMethods: {
    getCart: function(id) {
      return Order.findAll({
        where: {
          id: id,
          status: 'cart'
        },
        include: [ {
          model: lineItem
        } ]
      })
        .then((order) => {
          return order;
        })
    }
  }
});

module.exports = Order
