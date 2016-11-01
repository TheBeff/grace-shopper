app.controller('OrderCtrl', function($scope, $log, OrderService){

	OrderService.getOrders()
	  .then(function(orders){
	  	$scope.orders = orders;
	  })
	  .catch($log.error);

	$scope.getLineItems = OrderService.getLineItems;

});