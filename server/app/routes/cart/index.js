const router = require('express').Router();
const Order = require('../../../db').models.Order;
const LineItem = require('../../../db').models.LineItem;

module.exports = router;

router.get('/', function(req, res, next) {
    if (req.user.id) {
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
                res.send(order);
            })
            .catch(next);
    }

    // else will handle if there is no logged in user
    // need to create a cart
    // attach to the session

    // else{
    //  Order.create({
    //    status: 'cart'
    //  })
    //  .then(function(cart){
    //    req.cart = cart;
    //    res.send(cart);
    //  })
    //  .catch(next);
});
