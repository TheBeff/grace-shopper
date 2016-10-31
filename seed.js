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

const chalk = require('chalk');
const db = require('./server/db').db;
const User = require('./server/db').models.User;
const Product = require('./server/db').models.Product;
const Order = require('./server/db').models.Order;
const LineItem = require('./server/db').models.LineItem;
const Address = require('./server/db').models.Address;
const Promise = require('sequelize').Promise;

const seedUsers = function() {

    const users = [{
        email: 'testing@fsa.com',
        password: 'password',
        isAdmin: true
    }, {
        email: 'obama@gmail.com',
        password: 'potus'
    }];

    const products = [{
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
    }, {
        title: 'Lightsaber',
        description: 'Only 4 Jedis',
        price: '1000',
        inventory_qty: '4',
        photos: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Lightsaber%2C_silver_hilt%2C_blue_blade.png',
        category: 'Weapons'
    }, {
        title: 'Pineapple',
        description: 'Who lives in a...',
        price: '67000',
        inventory_qty: '1',
        photos: "http://vignette1.wikia.nocookie.net/spongebob/images/4/4b/SpongeBob's_pineapple_house_in_Season_6-2.png",
        category: 'Homes'
    }];

    const orders = [{
        status: 'cart'
    }, {
        status: 'order',
    }, {
        status: 'order',
    }];

    const lineItems = [{
        quantity: 1,
        price: 999999999
    }, {
        quantity: 2,
        price: 500
    }, {
        quantity: 3,
        price: 45
    }, {
        quantity: 1,
        price: 20
    }];

    const addresses = [{
        name: "Jeff Petriello",
        address1: "138 Broadway",
        address2: "Apt 2D",
        city: "Brooklyn",
        state: "NY",
        zip: 11211,
        type: "shipping"
    }, {
        name: "Santa Claus",
        address1: "325 S. Santa Claus Lane",
        city: "North Pole",
        state: "AK",
        zip: 99705,
        type: "billing"
    }];

    const creatingUsers = Promise.map(users, userObj => User.create(userObj));

    const createProducts = Promise.map(products, productObj => Product.create(productObj));

    const createOrders = Promise.map(orders, ordersObj => Order.create(ordersObj));

    const createLineItem = Promise.map(lineItems, lineItemObj => LineItem.create(lineItemObj));

    const createAddress = Promise.map(addresses, addressesObj => Address.create(addressesObj));

    return Promise.all([creatingUsers, createProducts, createOrders, createLineItem, createAddress])
        .then(([user, product, order, lineItem, address]) => {
            lineItem[0].setProduct(product[0]);
            lineItem[1].setProduct(product[1]);
            lineItem[2].setProduct(product[1]);
            lineItem[3].setProduct(product[2]);
            lineItem[0].setOrder(order[0]);
            lineItem[1].setOrder(order[0]);
            lineItem[2].setOrder(order[1]);
            lineItem[3].setOrder(order[2]);
            address[0].setUser(user[0]);
            address[1].setUser(user[0]);
            user[0].setOrders(order[0]);
            user[0].setOrders(order[1]);
            return user[0].setOrders(order[2]);
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
