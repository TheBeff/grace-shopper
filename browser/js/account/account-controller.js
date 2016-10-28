app.controller("AccountCtrl", function($scope, $log, AccountService){

  AccountService.getUser()
    .then(function(response){
    	$scope.user = response.user;
    })
    .catch($log.error);
	 
  AccountService.getOrders()
    .then(function(orders){
    	$scope.orders = orders;
    })
    .catch($log.error);

  AccountService.getShipping()
    .then(function(response){
        $scope.shipping = response;
    })
    .catch($log.error);

    AccountService.getBilling()
      .then(function(response){
          $scope.billing = response;
      })
      .catch($log.error);
});

