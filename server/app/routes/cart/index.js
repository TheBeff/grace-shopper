const router = require('express').Router();
const Order = require('../../../db').models.Order;
const User = require('../../../db').models.User;
module.exports = router;

router.get('/', function(req, res, next){
	if(req.userId){
		Order.findOne({
			where: {
				status: 'cart'
			}
		})
		.then(function(cart){
			res.send(cart);
		})
		.catch(next);
	}
	else{
		Order.create({

		})
	}
});
