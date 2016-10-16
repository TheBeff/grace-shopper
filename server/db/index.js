'use strict';
const db = require('./_db');
const User = require('./models/user');
const Order = require('./models/order');
const Product = require('./models/product');
const Review = require('./models/review');
const LineItem = require('./models/lineItem');

module.exports = {
  db,
  models: {
    User,
    Order,
    Product,
    Review,
    LineItem
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
User.hasMany(Review);
User.hasMany(Order);

