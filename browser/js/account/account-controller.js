app.controller("AccountCtrl", function($scope, $log, AccountService){

  $scope.shippingSchema = AccountService.shippingSchema;
  $scope.billingSchema = AccountService.billingSchema;


  $scope.form = AccountService.form

  $scope.shippingModel = {};
  $scope.billingModel = {};

  $scope.onSubmit = function(form){
        $scope.$broadcast('schemaFormValidate');
        if (form.$valid) {
            if (form.$name === "shippingForm"){
              AccountService.saveShipping($scope.shippingModel);
              AccountService.getShipping()
                .then(function(response){
                    $scope.shipping = response;
                })
                .catch($log.error);
            }
            if (form.$name === "billingForm"){
              AccountService.saveBilling($scope.billingModel);
              AccountService.getBilling()
                .then(function(response){
                    $scope.billing = response;
                })
                .catch($log.error);
            }
        }
  };

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


