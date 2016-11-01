app.controller('ProductsCtrl', function($scope, $log, Session, ProductsService, CartService) {

  ProductsService.findAll()
    .then(function(products) {
      $scope.products = products;
      $scope.categories = $scope.products.reduce(function(curr, next) {
        for (var i = 0; i < next.categories.length; i++) {
          if (curr.indexOf(next.categories[i]) === -1) {
            curr.push(next.categories[i]);
          }
        }
        return curr;
      }, []); //gets unique categories
    })
    .catch($log.error);

  $scope.filterProducts = function(filter, mode) {
    if (mode === 'title') {
      $scope.products = ProductsService.filterProducts(filter.toLowerCase(), mode);
    } else {
      $scope.products = ProductsService.filterProducts(filter, mode);
    }
  };

  $scope.isAdmin = function() {
    if (Session.user) {
      return Session.user.isAdmin;
    }
    return false;
  };

  $scope.create = function() {
    var newProduct = $scope.newProduct;
    newProduct.categories = newProduct.categories.split(',');
    ProductsService.create(newProduct)
      .then(function() {
        $scope.newProduct.title = '';
        $scope.newProduct.description = '';
        $scope.newProduct.categories = '';
        $scope.newProduct.price = '';
        $scope.newProduct.inventory = '';
        $scope.newProduct.photo = '';
      })
      .catch($log.error);
  };

  $scope.destroy = function(product) {
    ProductsService.destroy(product)
      .then(function() {
        console.log('product deleted');
      })
      .catch($log.error);
  };

  $scope.inventoryArray = ProductsService.inventoryArray;

  CartService.getCart()
    .then(function(cart) {
      $scope.cart = cart;
    })
    .catch($log.error);

  $scope.addToCart = function(product, quantity, cart) {
    CartService.createLineItem(product, quantity, cart)
      .then(function() {
        return CartService.getCart();
      })
      .then(function(updatedcart) {
        $scope.cart = updatedcart;
      })
      .catch($log.error);
  };

});
