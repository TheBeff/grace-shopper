'use strict';

const router = require('express').Router();
const Product = require('../../../db').models.Product;
const Review = require('../../../db').models.Review;
const User = require('../../../db').models.User;

module.exports = router;

const ensureAuthenticated = function (req, res, next) {
    let err;
    if (req.isAuthenticated()) {
        next();
    } else {
        err = new Error('You must be logged in.');
        err.status = 401;
        next(err);
    }
};

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
	Product.findAll({
		include: [Review]
	})
		.then(function(products) {
			res.send(products);
		})
		.catch(next);
});

router.get('/:id', function(req, res, next) {
	Product.findOne({
		where: {id: req.params.id},
		include: [{
			model: Review, 
			include: [User]
		}]
	})
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

router.post('/:id/reviews', ensureAuthenticated, function(req, res, next){
	Review.create({
		content: req.body.review,
		rate: req.body.rate,
		productId: req.params.id,
		userId: req.user.id
	})
		.then(function(review){
			res.send(review);
		})
		.catch(next);
});

router.delete('/:id/reviews/:reviewId', ensureAuthenticated, function(req, res, next){
	Review.destroy({
		where: {id: req.params.reviewId}
	})
		.then(function(){
			res.sendStatus(204);
		})
		.catch(next);
});
