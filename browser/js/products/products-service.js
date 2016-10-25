app.factory('ProductsService', function($http){

	var ProductsService = {};
	var _products = [];
	var oneProduct = {};
	let cart = [];

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

	ProductsService.checkForItemInCart = function(product, currentCart){
		let idArray = currentCart.lineItems.map(function(lineItem){
			return lineItem.productId;
		});

		let index = idArray.indexOf(product.id);

		if (index >= 0) {
			return currentCart.lineItems[index];
		} else {
			return false;
		}
	};

	ProductsService.addToCart = function(product, quantity, currentCart){
		let info = {
			price: product.price,
			quantity,
			orderId: currentCart.id,
			productId: product.id
		};

		let itemUrl = '/api/orders/' + currentCart.id + '/lineItems';

		let matchedLineItem = ProductsService.checkForItemInCart(product, currentCart);

		if (matchedLineItem) {
		  info.quantity += matchedLineItem.quantity;
		  return $http.put(itemUrl + '/' + matchedLineItem.id, info);
		} else if (currentCart) {
		    return $http.post(itemUrl, info);
	    } else {
			let itemInfo = {
				quantity,
				price: product.price,
				productId: product.id
			};

			cart.push(itemInfo);
			let strCart = JSON.stringify(cart);
			sessionStorage.setItem('cart', strCart);
			return JSON.parse(sessionStorage.getItem('cart'));
	    }
	};

	return ProductsService;
});
