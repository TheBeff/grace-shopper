'use strict';

app.directive('notification', ['$timeout', function() {
  return {
    restrict: 'E',
    template: '<div class="alert alert-success"> Item added to cart </div>'
  };
}]);

app.directive('productModal', function(ProductsService, CartService, $log) {
  return {
    restrict: 'E',
    templateUrl: 'js/products/product.modal.html',
    scope: {
      product: '=',
    },
    link: function(scope) {
      scope.inventoryArray = ProductsService.inventoryArray;

      scope.addToCart = function(product, quantity, cart) {
        CartService.createLineItem(product, quantity, cart)
          .then(function() {
            return CartService.getCart();
          })
          .then(function(updatedcart) {
            scope.cart = updatedcart;
          })
          .catch($log.error);
      };
    }
  }
});
