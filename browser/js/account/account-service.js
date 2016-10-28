app.factory('AccountService', function($http){

	var AccountService = {};

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

	return AccountService;
});