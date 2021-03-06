'use strict';

app.factory('CartService', function(Session, $http, $window, $q, $state, $log){

	var CartService = {};
	var _cart = {};

	var _getCartRemotely = function(){
		return $http.get('/api/cart')
			.then(function(response){
				angular.copy(response.data, _cart);
				return _cart;
			})
			.catch($log.error);
	};

	var _getCartLocally = function(){
		var cart = $window.sessionStorage.getItem('cart');
		if (cart) {
			cart = JSON.parse(cart);
		} else {
			cart = { lineItems: [] };
			$window.sessionStorage.setItem('cart', JSON.stringify(cart));
		}
		var dfd = $q.defer();
		angular.copy(cart, _cart);
		dfd.resolve(_cart);
		return dfd.promise;
	};

	CartService.getCart = function(){
		if (Session.user) {
			return _getCartRemotely();
		} else {
			return _getCartLocally();
		}
	};

	var _clearCartRemotely = function(cart){
		cart.lineItems.forEach(function(lineItem){
			return $http.delete('/api/orders/' + cart.id + '/lineitems/' + lineItem.id);
		});
		_cart.lineItems = [];
	};

	var _clearCartLocally = function(){
		return _getCartLocally()
			.then(function(cart){
				cart.lineItems = [];
				$window.sessionStorage.setItem('cart', JSON.stringify(cart));
			});
	};

	CartService.clearCart = function(cart){
		if (Session.user){
			return _clearCartRemotely(cart);
		}
		else {
			return _clearCartLocally(cart);
		}
	};

	CartService.changeQuantity = function(cart, lineitem, quantity){
		if (quantity === null) {
			return this.deleteLineItem(cart, lineitem);
		}
		else if (Session.user) {
			return $http.put('/api/orders/' + cart.id + '/lineItems/' + lineitem.id, {quantity, price: quantity * lineitem.product.price})
				.then(function(){
					console.log('quantity updated');
					CartService.getCart();
				});
		} else {
			var idx = _cart.lineItems.indexOf(lineitem);
			_cart.lineItems[idx].quantity = quantity;
			_cart.lineItems[idx].price = lineitem.product.price * quantity;
			$window.sessionStorage.setItem('cart', JSON.stringify(_cart));
		}
	};

	CartService.deleteLineItem = function(cart, lineitem){
		if (Session.user) {
			$http.delete('/api/orders/' + cart.id + '/lineItems/' + lineitem.id)
			.then(function(){
				var idx = _cart.lineItems.indexOf(lineitem);
				_cart.lineItems.splice(idx, 1);
			});
		} else {
			var idx = _cart.lineItems.indexOf(lineitem);
			_cart.lineItems.splice(idx, 1);
			$window.sessionStorage.setItem('cart', JSON.stringify(_cart));
			var dfd = $q.defer();
			dfd.resolve();
			return dfd.promise;
		}
	};

	var _checkForItemInCart = function(product, currentCart){
		if (currentCart.lineItems) {
			let idArray = currentCart.lineItems.map(function(lineItem){
				return lineItem.productId;
			});

			let index = idArray.indexOf(product.id);

			if (index >= 0) {
				return currentCart.lineItems[index];
			} else {
				return false;
			}
		} else {
			return false
		}
	};

	var _createLineItemRemotely = function(product, quantity, currentCart){
		let info = {
			price: product.price * quantity,
			quantity,
			orderId: currentCart.id,
			productId: product.id
		};

		let itemUrl = '/api/orders/' + currentCart.id + '/lineItems';
		let matchedLineItem = _checkForItemInCart(product, currentCart);
		if (matchedLineItem) {
		  if (matchedLineItem.quantity + quantity > product.inventory_qty){
			return;
		  }
		  info.quantity += matchedLineItem.quantity;
		  info.price += product.price * matchedLineItem.quantity;
		  return $http.put(itemUrl + '/' + matchedLineItem.id, info);
		} else {
		    return $http.post(itemUrl, info);
	    }
	};

	var _createLineItemLocally = function(product, quantity){
		console.log('in create line local');
		return _getCartLocally()
			.then(function(cart){
				let matchedLineItem = _checkForItemInCart(product, cart);
				if (matchedLineItem){
					var idx = cart.lineItems.indexOf(matchedLineItem);
					var thisItem = cart.lineItems[idx];
					if (thisItem.quantity + quantity > thisItem.product.inventory_qty){
						console.log('max');
						return;
					}
					thisItem.quantity += quantity;
					thisItem.price += product.price * quantity;
				} else {
					cart.lineItems.push({
						product: {
							title: product.title,
							inventory_qty: product.inventory_qty,
							price: product.price
						},
						price: product.price * quantity,
						quantity: quantity,
						productId: product.id
					});
				}
				$window.sessionStorage.setItem('cart', JSON.stringify(cart));
				return _getCartLocally();
			});
	};

	CartService.createLineItem = function(product, quantity, currentCart){
		if (Session.user) {
			return _createLineItemRemotely(product, quantity, currentCart);
		} else {
			return _createLineItemLocally(product, quantity);
		}
	};

	CartService.syncCart = function(){
		_getCartRemotely()
			.then(function(dbCart){
				var cart = $window.sessionStorage.getItem('cart');
				if (cart) {
					cart = JSON.parse(cart);
					$window.sessionStorage.removeItem('cart');
					var promises = [];
					cart.lineItems.forEach(function(lineitem){
						var product = {
							inventory_qty: lineitem.product.inventory_qty,
							title: lineitem.product.title,
							price: lineitem.product.price,
							id: lineitem.productId
						};
						promises.push(_createLineItemRemotely(product, lineitem.quantity, dbCart));
					});
					return $q.all(promises);
				}
			});
	};

	CartService.goToCheckOut = function(cart){
		if (Session.user) {
			return $http.get('/api/orders/' + cart.id)
				.then($state.go('checkout'));
		}
		else {
			$state.go('login');
		}
	};

	return CartService;
});

app.run(function(AUTH_EVENTS, CartService, $rootScope){
	$rootScope.$on(AUTH_EVENTS.loginSuccess, function(){
		CartService.getCart()
			.then(function(){
				CartService.syncCart();
			});
	});
	$rootScope.$on(AUTH_EVENTS.logoutSuccess, function(){
		CartService.getCart();
	});
	CartService.getCart();
});
