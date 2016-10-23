app.controller("CartCtrl", function($scope, $log, CartService){

	CartService.getCart()
	  .then(function(cart){
	  	$scope.cart = cart;
	  	$scope.lineItems = cart.lineItems;
	  })
	  .catch($log.error);

	// CartService.deleteCart()
	//   .then(function(){
	//   	$scope.items = [];
	//   })
	//   .catch($log.error);
	  
});