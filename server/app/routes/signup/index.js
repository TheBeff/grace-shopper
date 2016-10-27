'use strict';

const router = require('express').Router();
const User = require('../../../db').models.User;

module.exports = router;

router.post('/', (req, res, next) => {
    return User.findOrCreate({
            where: {
                email: req.body.email
            }
        })
        .then(([user, created]) => {
            if (!created) return res.send(user);

            return req.logIn(user, function(loginErr) {
                if (loginErr) return next(loginErr);
                // We respond with a response object that has user with _id and email.
                return res.send({
                    user: user.sanitize()
                });
            });
        })
        .catch(next);
});
