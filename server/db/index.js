'use strict';
const db = require('./_db');
const User = require('./models/user');
const LineItem = require('./models/lineItem');
const Order = require('./models/order');
const Product = require('./models/product');
const Review = require('./models/review');
const Address = require('./models/address');

module.exports = {
  db,
  models: {
    User,
    Order,
    Product,
    Review,
    LineItem,
    Address
  }
};

// eslint-disable-next-line no-unused-vars

// if we had more models, we could associate them in this file
// e.g. User.hasMany(Reports)

Product.hasMany(Review);
Review.belongsTo(Product);
Review.belongsTo(User);
LineItem.belongsTo(Product);
LineItem.belongsTo(Order);
Order.hasMany(LineItem);
User.hasMany(Review);
User.hasMany(Order);
Address.belongsTo(User);
User.hasMany(Address);

