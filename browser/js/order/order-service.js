app.factory('OrderService', function($http){

  var OrderService = {};

  OrderService.getOrders = function(){
  	return $http.get('/api/orders')
  	  .then(function(response){
  	  	return response.data;
  	  })
  };

  OrderService.getLineItems = function(order){
  	return order.lineItems;
  };

  return OrderService;
});