app.config(function($stateProvider){

	$stateProvider
	.state('orderDetail', {
		url: '/orders/:id',
		templateUrl: 'js/order/order.html'
	});

});