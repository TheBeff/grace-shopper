const router = require('express').Router();
const Order = require('../../../db').models.Order;
module.exports = router;

router.get('/', function(req, res, next){
	if (req.userId) {
		Order.getCart(req.userId)
		.then(function(cart){
			res.send(cart);
		})
		.catch(next);
	}

	// else will handle if there is no logged in user
	// need to create a cart
	// attach to the session
	
	// else{
	// 	Order.create({
	// 		status: 'cart'
	// 	})
	// 	.then(function(cart){
	// 		req.cart = cart;
	// 		res.send(cart);
	// 	})
	// 	.catch(next);
});
