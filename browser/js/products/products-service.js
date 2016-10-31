app.factory('ProductsService', function(Session, $http){

	var ProductsService = {};
	var _products = [];
	var oneProduct = {};

	ProductsService.filterProducts = function(filter, mode) {
		var filteredProducts = _products.filter(function(product) {
			if (mode === 'title'){
				product = product[mode].toLowerCase();
				return product.indexOf(filter) > -1;
			}
			else {
				product = product[mode];
				return product.indexOf(filter) > -1;
			}
		});
		return filteredProducts;
	};

	ProductsService.findAll = function(){
		return $http.get('/api/products')
		  .then(function(products){
			angular.copy(products.data, _products);
			return _products;
		  });
	};

	ProductsService.getCategories = function() {
		console.log(_products);
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

	ProductsService.update = function(id, updatedProduct){
		return $http.put('/api/products/' + id, updatedProduct)
			.then(function(){
				return ProductsService.findAll();
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

	ProductsService.submitReview = function(productId, review, rate){
		console.log('submit review array');
		var rateArray = [];
		for (var i = 0; i < rate; i++) {
			rateArray.push('*');
		}
		var reviewObj = {review: review, rate: rateArray}
		return $http.post('/api/products/' + productId + '/reviews', reviewObj)
			.then(function(){
				console.log('review submitted');
			});
	};

	ProductsService.deleteReview = function(productId, reviewId){
		return $http.delete('/api/products/' + productId + '/reviews/' + reviewId)
			.then(function(){
				console.log('review deleted');
			});
	};

	return ProductsService;
});
