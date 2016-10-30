app.factory('ProductsService', function(Session, $http, $q){

	var ProductsService = {};
	var _products = [];
	var oneProduct = {};
	let cart = [];

	ProductsService.filterProducts = function(input) {
		const filteredProducts = _products.filter(function(product) {
			product = product.title.toLowerCase();
			return product.indexOf(input) > -1;
		});
		return filteredProducts;
	};

	// ProductsService.getReviews = function(product){
	// 	$http.get('/api/products')
	// };

	ProductsService.findAll = function(){
		return $http.get('/api/products')
		  .then(function(products){
			angular.copy(products.data, _products);
			return _products;
		  });
	};

	ProductsService.findOne = function(id){
		return $http.get('/api/products/' + id)
		.then(function(product){
			// console.log(product.data);
			angular.copy(product.data, oneProduct);
			return oneProduct;
		});
	};

	ProductsService.create = function(product){
		return $http.post('/api/products', product)
			.then(function(response){
				_products.push(response.data);
			});
	};

	ProductsService.destroy = function(product){
		return $http.delete('/api/products/' + product.id)
			.then(function(){
				_products.splice(_products.indexOf(product), 1);
			});
	};

	ProductsService.inventoryArray = function(product){
		let inventoryArray = [];
		let quantity;
		if (product.inventory_qty <= 25) {
			quantity = product.inventory_qty;
		} else {
			quantity = 25;
		}
		for (let i = 1; i <= quantity; i++) {
			inventoryArray.push(i);
		}
		return inventoryArray;
	};

	ProductsService.submitReview = function(productId, review){
		var reviewObj = {review: review}
		return $http.post('/api/products/' + productId + '/reviews', reviewObj)
			.then(function(){
				console.log('review submitted');
			});
	};

	return ProductsService;
});
