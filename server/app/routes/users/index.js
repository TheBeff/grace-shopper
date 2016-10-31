var router = require('express').Router();
// const Order = require('../../../db').models.Order;
// const Product = require('../../../db').models.Product;
// const Review = require('../../../db').models.Review;
const User = require('../../../db').models.User;

module.exports = router;

var isAdmin = function(req, res, next){
	let err;
	if (req.user.isAdmin){
		next();
	} else {
        err = new Error('You must be an Admin.');
        err.status = 401;
        next(err);
    }
};

router.get('/', isAdmin, function(req, res, next){
	User.findAll()
		.then(function(users){
			res.send(users);
		})
		.catch(next);
});

router.put('/:id', isAdmin, function(req, res, next){
	User.update({
		isAdmin: req.body.isAdmin
	}, {
		where: {
			id: req.params.id
		}
	})
	.then(function(){
		res.sendStatus(200);
	})
	.catch(next);
});

router.delete('/:id', isAdmin, function(req, res, next){
	User.destroy({
		where: {
			id: req.params.id
		}
	})
	.then(function(){
		res.sendStatus(200);
	})
	.catch(next);
});
