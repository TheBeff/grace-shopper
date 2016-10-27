// Instantiate all models
var expect = require('chai').expect;

var Sequelize = require('sequelize');

var db = require('../../../server/db').db;

var User = require('../../../server/db').models.User;

var supertest = require('supertest');

describe.only('Cart Route', function () {

    var app, User;

    beforeEach('Sync DB', function () {
        return db.sync({ force: true });
    });

    beforeEach('Create app', function () {
        app = require('../../../server/app')(db);
        User = require('../../../server/db').models.User;
    });

	describe('Unauthenticated request', function () {

		var guestAgent;

		beforeEach('Create guest agent', function () {
			guestAgent = supertest.agent(app);
		});

		it('should get a 401 response', function (done) {
			guestAgent.post('/api/orders')
				.send({ status: 'cart'})
				.expect(401)
				.end(done);
		});

	});

	describe('Authenticated request', function () {

		var loggedInAgent;

		var userInfo = {
			email: 'joe@gmail.com',
			password: 'shoopdawoop'
		};

		beforeEach('Create a user', function () {
			return User.create(userInfo);
		});

		beforeEach('Create loggedIn user agent and authenticate', function (done) {
			loggedInAgent = supertest.agent(app);
			loggedInAgent.post('/login').send(userInfo).end(done);
		});

		it('should get with 200 response and the cart', function (done) {
			loggedInAgent.get('/api/cart')
				.expect(200)
				.end(function (err, response) {
				if (err) return done(err);
				var cart = response.body;
				expect(cart.id).to.be.ok;
				expect(cart.userId).to.be.ok;
				done();
			});
		});

	});

});
