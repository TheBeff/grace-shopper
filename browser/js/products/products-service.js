app.factory('ProductsService', function($http){

	var ProductsService = {};
	var _products = [];

	ProductsService.findAll = function(){
		return $http.get('/api/products')
		  .then(function(products){
		  	 angular.copy(products.data, _products);
		  	 return _products;
		  })
	};

	ProductsService.create = function(product){
		return $http.post('/api/products', product)
		  .then(function(product){
		  	_products.push(product.data);
		  })
	};

	ProductsService.destroy = function(product){
		return $http.delete('/api/products/' + product.id)
		  .then(function(productDestroyed){
		  	_products.splice(_products.indexOf(product), 1);
		  })
	};

	ProductsService.addToCart = function(product, cartId){
		return $http.post('/api/orders/' + cartId + '/lineItems');
	};

	return ProductsService;
});