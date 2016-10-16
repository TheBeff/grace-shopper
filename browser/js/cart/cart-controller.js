app.controller("CartCtrl", function($scope, $log, CartService){

	CartService.getCart()
	  .then(function(cart){
	  	$scope.items = cart;
	  })
	  .catch($log.error);
	  
});