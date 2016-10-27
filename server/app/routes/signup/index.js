'use strict';

const router = require('express').Router();
const User = require('../../../db').models.User;
const Promise = require('bluebird');

module.exports = router;

router.post('/', (req, res, next) => {
    const promisifyLogIn = Promise.promisifyAll(req.logIn);

    return User.findOrCreate({
            where: {
                email: req.body.email
            }
        })
        .then(([user, created]) => {
            if (!created) return res.send(user);


            // return promisifyLogIn(user)
            //   .then(function(something) {
            //     return res.send({
            //         user: user.sanitize()
            //     });
            //   });
            return req.logIn(user, function(loginErr) {
                if (loginErr) return next(loginErr);
                // We respond with a response object that has user with _id and email.
                // return res.send({
                //     user: user.sanitize()
                // });
                return res.redirect('/products');
            });
        })
        .catch(next);
});
