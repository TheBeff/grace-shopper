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

  OrderService.saveStatus = function(status, orderId){
  	return $http.put('/api/orders/' + orderId + '/adminUpdate', {status})
  	  .then(function(){
  	  	console.log("status updating");
  	  }) 
  };

  return OrderService;
});