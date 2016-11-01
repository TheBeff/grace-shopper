'use strict';

const router = require('express').Router();
const Order = require('../../../db').models.Order;
const User = require('../../../db').models.User;
const Product = require('../../../db').models.Product;
const LineItem = require('../../../db').models.LineItem;

const sendConfirmation = require('../../email');

module.exports = router;

router.use('/:id/lineItems', require('./lineitems'));

router.get('/', function(req, res, next) {
	Order.findAll({
		include: { model: LineItem, include: [Product] }
	})
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

router.put('/:id/adminUpdate', function(req, res, next){
		
	Order.update({
		status: req.body.status
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

router.put('/:id', function(req, res, next) {
	let order;

	Order.update({
		status: req.body.status
	}, {
		where: {
			id: req.params.id
		},
		returning: true
	})
	.then(function(result) {
		order = result[1][0].get();
		const userId = result[1][0].get().userId;
		return User.findById(userId)
	})
	.then(function(user) {
		sendConfirmation({ email: user.get().email, orderId: order.id}, 'order')
		res.send(order);
	})
	.catch(next);
});


