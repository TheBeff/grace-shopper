"use strict";

app.controller('CheckoutCtrl', function ($scope, $log, CartService, AccountService, CheckoutService) {

    $scope.card = {
        name: 'Mike Brown',
        number: '5555 4444 3333 1111',
        expiry: '11 / 2020',
        cvc: '123'
    };

    $scope.cardPlaceholders = {
        name: 'Your Full Name',
        number: 'xxxx xxxx xxxx xxxx',
        expiry: 'MM/YY',
        cvc: 'xxx'
    };

    $scope.cardMessages = {
        validDate: 'valid\nthru',
        monthYear: 'MM/YYYY',
    };

    $scope.cardOptions = {
        debug: false,
        formatting: true
    };
    
    CartService.getCart()
    .then(function(cart){
        $scope.cart = cart;
        $scope.lineItems = cart.lineItems;
    })
    .catch($log.error);

    $scope.placeOrder = CheckoutService.placeOrder;

    $scope.states = CheckoutService.states;
});