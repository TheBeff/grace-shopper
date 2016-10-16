app.factory('CartService', function($http){

	var CartService = {};
	var _cart =[];

	CartService.getCart = function(){
		return $http.get('/api/cart')
		  .then(function(cart){
		  	angular.copy(cart.data, _cart);
		  	return _cart;
		  })
	};

	return CartService; 
});