'use strict';

const router = require('express').Router();
const Product = require('../../../db').models.Product;

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

router.get('/', function(req, res, next) {
	Product.findAll()
	.then(function(products) {
		res.send(products);
	})
	.catch(next);
});

router.get('/:id', function(req, res, next) {
	Product.findById(req.params.id)
	.then(function(product) {
		res.send(product);
	})
	.catch(next);
});

router.post('/', isAdmin, function(req, res, next) {
	Product.create({
		title: req.body.title,
		description: req.body.description,
		price: req.body.price,
		inventory_qty: req.body.inventory_qty,
		photos: req.body.photos,
		category: req.body.category
	})
	.then(function(product) {
		res.send(product);
	})
	.catch(next);
});

router.delete('/:id', isAdmin, function(req, res, next) {
	Product.destroy({ where: {
		id: req.params.id
	}})
	.then(function() {
		res.sendStatus(200);
	})
	.catch(next);
});

router.put('/:id', isAdmin, function(req, res, next) {
	Product.update({
		title: req.body.title,
		description: req.body.description,
		price: req.body.price,
		inventory_qty: req.body.inventory_qty,
		photos: req.body.photos,
		category: req.body.category
	}, {
		where: {
			id: req.params.id
		}
	})
	.then(function(product) {
		res.send(product);
	})
	.catch(next);
});
