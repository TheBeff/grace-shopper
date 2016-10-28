"use strict";

app.config(function ($stateProvider) {
    $stateProvider.state('checkout', {
        url: '/checkout',
        templateUrl: 'js/checkout/checkout.html',
        controller: 'CheckoutCtrl'
    });

    $stateProvider.state('confirmation', {
        url: '/confirmation',
        templateUrl: 'js/checkout/confirmation.html'
    });
});