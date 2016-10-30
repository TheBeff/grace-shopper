app.factory('AccountService', function($http){

	var AccountService = {};

	const schema = {
	    type: "object",
	    properties: {
	        name: {type: "string", title: "Name"},
	        address1: {type: "string", title: "Address Line 1"},
	        address2: {type: "string", title: "Address Line 2"},
	        city: {type: "string", title: "City"},
	        state: {type: "string", title: "State", enum: ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming']},
	        zip: {type: "number", minLength: 5, title: "Zip Code"}
	    },
	    required: ["name", "address1", "city", "state", "zip"]
    };

    AccountService.shippingSchema = schema;
    AccountService.billingSchema = schema;

    AccountService.form = [
	    "*",
	    {
	        type: "submit",
	        title: "Save"
	    }
    ];

	AccountService.getUser = function(){
		return $http.get('/session')
		  .then(function(response){
		  	return response.data;
		  })
	};

	AccountService.getOrders = function(){
		return $http.get('/api/account/orders')
		  .then(function(response){
		  	return response.data;
		  })
	};

	AccountService.getShipping = function(){
		return $http.get('/api/address/shipping')
		  .then(function(response){
		  	return response.data;
		  })
	};

	AccountService.getBilling = function(){
		return $http.get('/api/address/billing')
		  .then(function(response){
		  	return response.data;
		  })
	};

	AccountService.saveShipping = function(address){
		return $http.post('/api/address/shipping', address)
	};

	AccountService.saveBilling = function(address){
		return $http.post('/api/address/billing', address)
	};

	AccountService.clearShipping = function(){
		return $http.delete('/api/address/shipping')
	};

	AccountService.clearBilling = function(){
		return $http.delete('/api/address/billing')
	};

	return AccountService;
});