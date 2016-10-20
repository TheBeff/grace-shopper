/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var chalk = require('chalk');
var db = require('./server/db').db;
var User = require('./server/db').models.User;
var Product = require('./server/db').models.Product;
var Order = require('./server/db').models.Order;
var Promise = require('sequelize').Promise;

var seedUsers = function() {

    var users = [{
        email: 'testing@fsa.com',
        password: 'password'
    }, {
        email: 'obama@gmail.com',
        password: 'potus'
    }];

    var products = [{
        title: 'Death Star',
        description: 'Used to annihilate planets',
        price: '100000000',
        inventory_qty: '1',
        photos: 'http://vignette3.wikia.nocookie.net/starwars/images/7/72/DeathStar1-SWE.png/revision/latest?cb=20150121020639',
        category: 'Weapons',
    }, {
        title: 'Laser Beams',
        description: 'Pew pew pew',
        price: '50',
        inventory_qty: '10',
        photos: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Military_laser_experiment.jpg',
        category: 'Weapons'
    }];

    var orders = [{
        status: 'cart'
    }, {
        status: 'order'
    }];

    var creatingUsers = Promise.map(users, (userObj) => {
        return User.create(userObj);
    });

    var createProducts = Promise.map(products, (productObj) => {
        return Product.create(productObj);
    });

    var createOrders = Promise.map(orders, (ordersObj) => {
        return Order.create(ordersObj);
    });

    return Promise.all([creatingUsers, createProducts, createOrders])
        .then(([user, product, order]) => {
            return user[0].setOrders(order[0]);
        });

};

db.sync({
        force: true
    })
    .then(() => {
        return seedUsers();
    })
    .then(() => {
        console.log(chalk.green('Seed successful!'));
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
