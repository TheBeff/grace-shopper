"use strict";

app.factory('CheckoutService', function($http) {
    let CheckoutService = {};
    
    CheckoutService.placeOrder = function(cart) {
        return $http.put('/api/orders/' + cart.id, {
            status : "order"
        })
        .then(function() {
            console.log("order placed...");
        });
    };

    return CheckoutService;
});

