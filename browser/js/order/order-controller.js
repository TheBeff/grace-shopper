app.controller('OrderCtrl', function($scope, $log, OrderService){

	$scope.getOrders = function(){
	  OrderService.getOrders()
	    .then(function(orders){
	  	  $scope.orders = orders;
	    })
	    .catch($log.error);
	};

	$scope.getLineItems = OrderService.getLineItems;

	$scope.saveStatus = function(status, orderId){
		OrderService.saveStatus(status, orderId);
		$scope.getOrders();
		$scope.statusChange = false;
	};

	$scope.getOrders();
});