app.factory('AccountService', function($http){

	var AccountService = {};

	AccountService.getUser = function(){
		return $http.get('/session')
		  .then(function(user){
		  	return user.data;
		  })
	};

	AccountService.getOrders = function(){
		return $http.get('/api/account/orders')
		  .then(function(orders){
		  	return orders.data;
		  })
	};

	return AccountService;
});