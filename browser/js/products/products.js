app.config(function($stateProvider){

	$stateProvider
	  .state('products', {
		url: '/products',
		templateUrl: 'js/products/products.html',
		controller: 'ProductsCtrl'
	  })
	  .state('products.detail', {
	  	url: '/:id',
	  	templateUrl: 'js/products/products-detail.html'
	  });

});
