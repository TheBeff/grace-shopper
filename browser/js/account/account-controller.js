app.controller("AccountCtrl", function($scope, $log, AccountService){

  AccountService.getUser()
    .then(function(user){
    	$scope.user = user;
    })
    .catch($log.error);
	 
  AccountService.getOrders()
    .then(function(orders){
    	$scope.orders = orders;
    })
    .catch($log.error);  

});