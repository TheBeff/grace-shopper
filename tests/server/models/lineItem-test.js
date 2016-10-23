var sinon = require('sinon');
var expect = require('chai').expect;

var Sequelize = require('sequelize');

var db = require('../../../server/db').db;

var LineItem = require('../../../server/db').models.LineItem;
var Order = require('../../../server/db').models.Order;

describe('LineItem model', function () {

    beforeEach('Sync DB', function () {
       return db.sync({ force: true });
    });

    it('should exist', function(){
    	expect(LineItem).to.exist;
    });
});