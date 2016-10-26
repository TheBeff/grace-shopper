const db = require('../_db');

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
				where: { userId: user.id, status: 'cart' }
			})
			.then(function(cart){
				if (cart) {
					return cart;
				}
				return that.create({userId: user.id});
			});
		}
	}
});

module.exports = Order;
