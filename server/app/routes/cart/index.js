'use strict';

const router = require('express').Router();
const Order = require('../../../db').models.Order;

module.exports = router;

router.get('/', function(req, res, next) {
    if (req.user) {
        Order.getCartForUser(req.user)
            .then(function(cart){
                res.send(cart);
            })
            .catch(next);
    }
    else {
        console.log('no user');
    }
});
