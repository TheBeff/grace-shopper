'use strict';
const router = require('express').Router(); // eslint-disable-line new-cap
const User = require('../../../db').models.User;
const Address = require('../../../db').models.Address;

module.exports = router;

router.get('/shipping', function(req, res, next){
  Address.findOne({
  	where: {
  		userId: req.user.id,
  		type: "shipping"
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
  		type: "billing"
  	}
  })
    .then(function(response){
    	res.send(response);
    })
    .catch(next);
});