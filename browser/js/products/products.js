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
		controller: function($scope, detailProduct, $log, Session, CartService, ProductsService){
			$scope.loggedIn = function(){
				return Session.user;
			};

			$scope.isAdmin = function(){
				if (Session.user){
					return Session.user.isAdmin;
				} return false;
			};

			$scope.submitReview = function(productId, review){
				return ProductsService.submitReview(productId, review)
					.then(function(){
						return ProductsService.findOne($scope.product.id);
					})
					.then(function(product){
						$scope.product = product;
					});
			};
			
			$scope.product = detailProduct;
			
			$scope.inventoryArray = ProductsService.inventoryArray(detailProduct);
			
			CartService.getCart()
				.then(function(cart){
					$scope.cart = cart;
				})
				.catch($log.error);
			
			$scope.addToCart = function(product, quantity, cart){
				CartService.createLineItem(product, quantity, cart)
				.then(function(){
					return CartService.getCart();
				})
				.then(function(cart){
					$scope.cart = cart;
				})
				.catch($log.error);
			};

			$scope.deleteReview = function(productId, reviewId){
				return ProductsService.deleteReview(productId, reviewId)
					.then(function(){
						return ProductsService.findOne($scope.product.id);
					})
					.then(function(product){
						$scope.product = product;
					});
			};
		}
	});
});
