'use strict';
var router = require('express').Router(); // eslint-disable-line new-cap

module.exports = router;

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


router.use('/account', ensureAuthenticated, require('./account'));
router.use('/products', require('./products'));
router.use('/orders', ensureAuthenticated, require('./orders'));
router.use('/cart', ensureAuthenticated, require('./cart'));
router.use('/signup', require('./signup'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res, next) {
    var err = new Error('Not found.');
    err.status = 404;
    next(err);
});
