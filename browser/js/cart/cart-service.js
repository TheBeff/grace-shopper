app.factory('CartService', function($http){

	var CartService = {};
	var _cart = [];

	CartService.getCart = function(){
		return $http.get('/api/cart')
		  .then(function(cart){
		  	angular.copy(cart.data, _cart);
		  	return _cart;
		  })
	};

	CartService.deleteCart = function(cart){
		return $http.delete('/api/orders/' + cart.id)
		  .then(function(){
		  	_cart = {};
		  })
	};

	CartService.changeQuantity = function(params, quantity){
		return $http.put('/api/orders/' + params.cart + '/lineItems/' + params.item, quantity)
		  .then(function(){
		  	console.log("quantity updated");
		  })
	};

	CartService.deleteItem = function(params){
		return $http.delete('/api/orders/' + params.cart + '/lineItems/' + params.item);
	};

	CartService.order = function(cart){
		return $http.put('/api/orders/' + cart.id);
	};

	return CartService; 
});