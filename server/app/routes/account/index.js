'use strict';
const router = require('express').Router(); // eslint-disable-line new-cap
const User = require('../../../db').models.User;
const Order = require('../../../db').models.Order;
const LineItem = require('../../../db').models.LineItem;
const Product = require('../../../db').models.Product;

module.exports = router;
const _ = require('lodash');

router.get('/orders', function (req, res, next) {
    Order.findAll({
        where: {
            status: 'order',
            userId: req.user.id
        }, include: [
            { model: LineItem, include:[Product] }
        ]
    })
    .then(function(orders){
        res.send(orders);
    })
    .catch(next);
});
