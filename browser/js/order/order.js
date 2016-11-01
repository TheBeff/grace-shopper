app.config(function($stateProvider){

	$stateProvider
	.state('orders', {
		url: '/orders/',
		templateUrl: 'js/order/order.html',
		controller: "OrderCtrl"
	});

});
