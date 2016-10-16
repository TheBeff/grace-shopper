app.controller('ProductsCtrl', function($scope, $log, ProductsService){
	
	ProductsService.findAll()
	  .then(function(products){
	  	$scope.products = products;
	  })
	  .catch($log.error);

	$scope.create = function(){
		ProductsService.create({
			title: $scope.title,
			description: $scope.description,
			category: $scope.category,
			price: $scope.price,
			inventory_qty: $scope.inventory,
			photos: $scope.photo
		})
		.then(function(){
			$scope.title = "";
			$scope.description = "";
			$scope.category = "";
			$scope.price = "";
			$scope.inventory = "";
			$scope.photo = "";
		})
		.catch($log.error);
	};

	$scope.destroy = function(product){
		ProductsService.destroy(product)
		  .then(function(){
		  	console.log("product deleted");
		  })
		  .catch($log.error);
	};

});
