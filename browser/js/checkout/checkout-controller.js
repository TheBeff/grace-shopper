"use strict";

app.controller('CheckoutCtrl', function ($scope, $state, CartService, CheckoutService) {
    CartService.getCart()
    .then(function(cart) {
        $scope.cart = cart;
    });

    $scope.placeOrder = CheckoutService.placeOrder;
});