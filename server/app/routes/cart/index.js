'use strict';

const router = require('express').Router();
const Order = require('../../../db').models.Order;
const Product = require('../../../db').models.Product;
const LineItem = require('../../../db').models.LineItem;
const User = require('../../../db').models.User;

module.exports = router;

router.get('/', function(req, res, next) {
    console.log(req.user);
    if (req.user) {
        Order.getCartForUser(req.user)
            .then(function(cart){
                console.log(cart);
                res.send(cart);
            })
            .catch(next);
    }
    else {
        console.log('no user');
    }
});
