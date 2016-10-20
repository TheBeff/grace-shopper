const router = require('express').Router();
const Order = require('../../../db').models.Order;

module.exports = router;

router.get('/', function(req, res, next){
	if (req.user.id) {
		Order.getCart(req.user.id)
		.then(function(cart){
			res.send(cart);
		})
		.catch(next);
	}

	// else will handle if there is no logged in user
	// need to create a cart
	// else{
	// 	Order.create({
	// 	})
	// }
});
