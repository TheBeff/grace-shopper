app.controller('CartCtrl', function($scope, $log, CartService, ProductsService){

	CartService.getCart()
		.then(function(cart){
			$scope.cart = cart;
			$scope.lineItems = cart.lineItems;
		})
		.catch($log.error);

	$scope.clearCart = function(cart){
		$scope.lineItems = [];
		return CartService.clearCart(cart);
	};

	$scope.inventoryArray = ProductsService.inventoryArray;

	$scope.changeQuantity = CartService.changeQuantity;

	$scope.deleteLineItem = CartService.deleteLineItem;

	$scope.goToCheckOut = CartService.goToCheckOut;

});
