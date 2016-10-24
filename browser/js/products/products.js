app.config(function($stateProvider){

	$stateProvider
	.state('products', {
		url: '/products',
		templateUrl: 'js/products/products.html',
		controller: 'ProductsCtrl'
	})
    .state('detail', {
		url: '/products/:id',
		templateUrl: 'js/products/products-detail.html',
		resolve: {
			detailProduct: function($stateParams, ProductsService){
				return ProductsService.findOne($stateParams.id);
			}
		},
		controller: function($scope, detailProduct, $stateParams, $log, CartService, ProductsService){
			$scope.product = detailProduct;
			$scope.inventoryArray = ProductsService.inventoryArray(detailProduct);
			CartService.getCart()
				.then(function(cart){
					$scope.cart = cart;
				})
				.catch($log.error);
			$scope.addToCart = function(product, quantity, cart){
				if ($scope.cart) {
					ProductsService.addToCart(product, quantity, cart)
						.then()
						.catch($log.error);
				} else {
					ProductsService.addToCart(product, quantity, cart);
				}
			};
		}
	});
});
