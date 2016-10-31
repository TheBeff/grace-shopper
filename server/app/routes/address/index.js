'use strict';
const router = require('express').Router();
const Address = require('../../../db').models.Address;

module.exports = router;

router.get('/shipping', function(req, res, next){
	Address.findOne({
		where: {
			userId: req.user.id,
			type: 'shipping'
		}
	})
		.then(function(response){
			res.send(response);
		})
		.catch(next);
});

router.get('/billing', function(req, res, next){
	Address.findOne({
		where: {
			userId: req.user.id,
			type: 'billing'
		}
	})
		.then(function(response){
			res.send(response);
		})
		.catch(next);
});

router.post('/shipping', function(req, res, next){
	Address.create({
		name: req.body.name,
		address1: req.body.address1,
		address2: req.body.address2,
		city: req.body.city,
		state: req.body.state,
		zip: req.body.zip,
		type: 'shipping',
		userId: req.user.id
	})
		.then(function(){
			console.log('address created');
			res.sendStatus(200);
		})
		.catch(next);
});

router.post('/billing', function(req, res, next){
	Address.create({
		name: req.body.name,
		address1: req.body.address1,
		address2: req.body.address2,
		city: req.body.city,
		state: req.body.state,
		zip: req.body.zip,
		type: 'billing',
		userId: req.user.id
	})
		.then(function(){
			console.log('address created');
			res.sendStatus(200);
		})
		.catch(next);
});

router.delete('/shipping', function(req, res, next){
	Address.destroy({
		where: {
			userId: req.user.id,
			type: 'shipping'
		}
	})
	  .then(function(){
		res.sendStatus(204);
	  })
	  .catch(next);
});

router.delete('/billing', function(req, res, next){
	Address.destroy({
		where: {
			userId: req.user.id,
			type: 'billing'
		}
	})
	  .then(function(){
		res.sendStatus(204);
	  })
	  .catch(next);
});
