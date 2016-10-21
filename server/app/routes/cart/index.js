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
    else {
        console.log('no stored cart');
    }
});
