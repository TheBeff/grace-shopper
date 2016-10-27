"use strict";

app.factory('CheckoutService', function($http, $state) {
    let CheckoutService = {};
    
    CheckoutService.placeOrder = function(cart) {
        return $http.put('/api/orders/' + cart.id, {
            status : "order"
        })
        .then(function(order) {
            if (order.config.data.status == "order") {
                $state.go("confirmation");
            }
            else {
                console.log("not an order yet");
            }
        });
    };

    return CheckoutService;
});

