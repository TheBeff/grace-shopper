app.factory('ProductsService', function($http){

	var ProductsService = {};
	var _products = [];
	let cart = [];

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

	ProductsService.inventoryArray = function(product){
		let inventoryArray = [];
		let quantity;
		if(product.inventory_qty <= 25){
			quantity = product.inventory_qty;
		} else quantity = 25;
		for(let i = 1; i <= quantity; i++){
			inventoryArray.push(i);
		}
		return inventoryArray;
	};

	ProductsService.addToCart = function(product, quantity, cartId){
		if(cartId){
		  return $http.post('/api/orders/' + cartId + '/lineItems');
	    } else {
	    	let itemInfo = {
	    		quantity,
	    		price: product.price, 
	    		productId: product.id
	    	};

	    	cart.push(itemInfo);
	    	let strCart = JSON.stringify(cart);
	    	sessionStorage.setItem("cart", strCart);
	    	return JSON.parse(sessionStorage.getItem("cart"));
	    }
	};

	return ProductsService;
});