app.config(function($stateProvider) {

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
        detailProduct: function($stateParams, ProductsService) {
          return ProductsService.findOne($stateParams.id);
        }
      },
      controller: function($scope, detailProduct, $log, Session, CartService, ProductsService) {
        $scope.loggedIn = function() {
          return Session.user;
        };

        $scope.isAdmin = function() {
          if (Session.user) {
            return Session.user.isAdmin;
          }
          return false;
        };

        $scope.submitReview = function(productId, review, rate) {
          return ProductsService.submitReview(productId, review, rate)
            .then(function() {
              return ProductsService.findOne($scope.product.id);
            })
            .then(function(product) {
              $scope.product = product;
            });
        };

        $scope.product = detailProduct;

        $scope.inventoryArray = ProductsService.inventoryArray(detailProduct);

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
            .then(function(updatedCart) {
              $scope.cart = updatedCart;
            })
            .catch($log.error);
        };

        $scope.deleteReview = function(productId, reviewId) {
          return ProductsService.deleteReview(productId, reviewId)
            .then(function() {
              return ProductsService.findOne($scope.product.id);
            })
            .then(function(product) {
              $scope.product = product;
            });
        };

        $scope.update = function(id, updatedProduct) {
          updatedProduct.categories = updatedProduct.categories.split(',');
          return ProductsService.update(id, updatedProduct)
            .then(function() {
              return ProductsService.findOne($scope.product.id);
            })
            .then(function(product) {
              $scope.product = product;
            });
        };

        $scope.reviewed = function() {
          var reviewed;
          detailProduct.reviews.forEach(function(review) {
            if (review.userId === Session.user.id) {
              reviewed = true;
            }
          });
          return reviewed;
        };

        $scope.rate = 0;
        $scope.max = 5;
        $scope.isReadonly = true;

        $scope.hoveringOver = function(value) {
          $scope.overStar = value;
          $scope.percent = value;
        };
      }
    });
});
