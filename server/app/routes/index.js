'use strict';
var router = require('express').Router(); // eslint-disable-line new-cap

module.exports = router;

router.use('/account', require('./account'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));
router.use('/cart', require('./cart'));
router.use('/signup', require('./signup'));
router.use('/address', require('./address'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res, next) {
    var err = new Error('Not found.');
    err.status = 404;
    next(err);
});
