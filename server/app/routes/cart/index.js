'use strict';

const router = require('express').Router();
const Order = require('../../../db').models.Order;
const Product = require('../../../db').models.Product;
const LineItem = require('../../../db').models.LineItem;
const User = require('../../../db').models.User;

module.exports = router;

router.get('/', function(req, res, next) {
    if (req.user) {
        Order.findOne({
                where: {
                    id: req.user.id,
                    status: 'cart'
                },
                include: [{
                  model: LineItem,
                  include: [{
                    model: Product
                }]
              }]
            })
            .then((order) => {
                if(!order){
                    User.findById(req.user.id)
                    .then(function(user){
                        var theUser = user;
                        Order.create({
                            status: 'cart'
                        })
                        .then(function(cart){
                            theUser.setOrders(cart);
                            console.log('creating new cart');
                            console.log(cart);
                            res.send(cart);
                        })
                        .catch(next);
                    })
                }
                else {
                    console.log('user has a cart');
                    res.send(order);
                }
            })
            .catch(next);
    }
    else {
        console.log('no user');
    }
});
