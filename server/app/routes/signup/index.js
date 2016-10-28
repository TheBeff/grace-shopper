'use strict';

const router = require('express').Router();
const User = require('../../../db').models.User;
const Promise = require('bluebird');

module.exports = router;

router.post('/', (req, res, next) => {

    return User.findOne({
            where: {
                email: req.body.email,
            }
        })
        .then(user => {

          if (user) res.send('exists');

          return User.create({
            email: req.body.email,
            password: req.body.password
          })
        })
        .then(createdUser => {
          res.send(createdUser);
        })
        .catch(next);
});
