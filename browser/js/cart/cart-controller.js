app.controller("CartCtrl", function($scope, $log, CartService){

	CartService.getCart()
	  .then(function(cart){
	  	$scope.cart = cart;
	  })
	  .catch($log.error);

	CartService.deleteCart()
	  .then(function(){
	  	$scope.items = [];
	  })
	  .catch($log.error);
	  
});