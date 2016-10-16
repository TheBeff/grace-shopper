'use strict';

const router = require('express').Router();
const Order = require('../../../db').models.Order;

module.exports = router;

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
