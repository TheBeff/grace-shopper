app.controller("CartCtrl", function($scope, $log, CartService){

	CartService.getCart()
	  .then(function(cart){
	  	$scope.cart = cart;
	  	$scope.lineItems = cart.lineItems;
	  })
	  .catch($log.error);

	$scope.deleteCart = function(cart){
		$scope.cart = {};
		$scope.lineItems = [];
		return CartService.deleteCart(cart);
	};

});
