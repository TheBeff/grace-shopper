const db = require('../_db');
const LineItem = require('./lineitem');
const Product = require('./product');

const Order = db.define('order', {
	status: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: 'cart'
	}
}, {
	instanceMethods: {
	},
	classMethods: {
		getCartForUser: function(user){
			var that = this;
			return this.findOne({
				where: { userId: user.id, status: 'cart' },
				include: [{
					model: LineItem, 
					include: [Product]
				}]
			})
			.then(function(cart){
				if (cart) {
					return cart;
				}
				return that.create({ userId: user.id });
			});
		}
	}
});

module.exports = Order;
