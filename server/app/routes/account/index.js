'use strict';
const router = require('express').Router(); // eslint-disable-line new-cap
const User = require('../../../db').models.User;
const Order = require('../../../db').models.Order;
const LineItem = require('../../../db').models.LineItem;
const Product = require('../../../db').models.Product;

module.exports = router;
const _ = require('lodash');

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

router.get('/orders', ensureAuthenticated, function (req, res, next) {
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
