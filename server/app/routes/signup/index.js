'use strict';

const router = require('express').Router();
const User = require('../../../db').models.User;

module.exports = router;

router.post('/', (req, res, next) => {
    User.findOne({
      where: {
        email: req.body.email
      }
    })
    .then(user => {
      if (user) return res.send(user);
      User.create({
        email: req.body.email,
        password: req.body.password
      })
    })
});
