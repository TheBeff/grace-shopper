'use strict';

const router = require('express').Router();
const Order = require('../../../db').models.Order;
const LineItem = require('../../../db').models.LineItem;

module.exports = router;

router.get('/', function(req, res, next) {
    if (req.user) {
        //should maybe use an User.getCart instance method here? robust models thin routes?
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
                // console.log('user order');
                // console.log(order);
                res.send(order);
            })
            .catch(next);
    }
    else {
        Order.create({
            status: 'cart'
        })
        .then(function(cart){
            req.session.cart = cart;
            console.log('no user order');
            console.log(req.session.cart);
            res.send(cart);
        })
        .catch(next);
    }
});
