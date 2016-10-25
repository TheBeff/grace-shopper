app.factory('CartService', function($http){

	var CartService = {};
	var _cart = [];

	CartService.getCart = function(){
		return $http.get('/api/cart')
			.then(function(cart){
				angular.copy(cart.data, _cart);
				return _cart;
			});
	};

	CartService.clearCart = function(cart){
		cart.lineItems.forEach(function(lineItem){
			return $http.delete('/api/orders/' + cart.id + '/lineitems/' + lineItem.id);
		});
		_cart.lineItems = [];
	};

	CartService.changeQuantity = function(cart, lineitem, quantity){
		return $http.put('/api/orders/' + cart.id + '/lineItems/' + lineitem.id, {quantity})
			.then(function(){
				console.log('quantity updated');
			});
	};

	CartService.deleteItem = function(cart, lineitem){
		$http.delete('/api/orders/' + cart.id + '/lineItems/' + lineitem.id)
		.then(function(){
			var idx = _cart.lineItems.indexOf(lineitem);
			_cart.lineItems.splice(idx, 1);
		});
	};

	CartService.order = function(cart){
		return $http.put('/api/orders/' + cart.id);
	};

	return CartService;
});
