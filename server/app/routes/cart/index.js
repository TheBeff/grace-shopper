'use strict';

const router = require('express').Router();
const Order = require('../../../db').models.Order;
const LineItem = require('../../../db').models.LineItem;

module.exports = router;

router.get('/', function(req, res, next) {
    if (req.user) {
        Order.findAll({
                where: {
                    id: req.user.id,
                    status: 'cart'
                },
                include: [{
                  model: LineItem
                }]
            })
            .then((order) => {
                console.log('user order');
                console.log(order);
                res.send(order);
            })
            .catch(next);
    }
    else if (!req.session.cart) {
        Order.create({
            status: 'cart'
        })
        .then(function(cart){
            req.session.cart = cart;
            console.log('no user new cart');
            console.log(req.session.cart);
            res.send(cart);
        })
        .catch(next);
    }
    else {
        console.log('already a no user cart');
        console.log(req.session.cart);
        res.send(req.session.cart);
    }
});
