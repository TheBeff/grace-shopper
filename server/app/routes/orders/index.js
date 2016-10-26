'use strict';

const router = require('express').Router();
const Order = require('../../../db').models.Order;

module.exports = router;

// const ensureAuthenticated = function (req, res, next) {
//     let err;
//     if (req.isAuthenticated()) {
//         next();
//     } else {
//         err = new Error('You must be logged in.');
//         err.status = 401;
//         next(err);
//     }
// };

router.use('/:id/lineItems', require('./lineitems'));

router.get('/', function(req, res, next) {
	Order.findAll()
	.then(function(orders) {
		res.send(orders);
	})
	.catch(next);
});

router.get('/:id', function(req, res, next) {
	Order.findById(req.params.id)
	.then(function(order) {
		res.send(order);
	})
	.catch(next);
});

router.post('/', function(req, res, next) {
	Order.create({
		status: req.body.status
	})
	.then(function(order) {
		res.send(order);
	})
	.catch(next);
});

router.delete('/:id', function(req, res, next) {
	Order.destroy({ where: {
		id: req.params.id
	}})
	.then(function() {
		console.log('deleted order with ID ' + req.params.id);
		res.sendStatus(200);
	})
	.catch(next);
});

router.put('/:id', function(req, res, next) {
	Order.update({
		status: req.body.status
	}, {
		where: {
			id: req.params.id
		}
	})
	.then(function(order) {
		res.send(order);
	})
	.catch(next);
});
