app.controller("AccountCtrl", function($scope, $log, $rootScope, AccountService){

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
              $scope.getShipping();
            }
            if (form.$name === "billingForm"){
              AccountService.saveBilling($scope.billingModel);
              $scope.getBilling();
            }
        }
  };

  $scope.clearShipping = function(){
    AccountService.clearShipping();
    $scope.getShipping();
  };

  $scope.clearBilling = function(){
    AccountService.clearBilling();
    $scope.getBilling();
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

$scope.getShipping = function(){AccountService.getShipping()
    .then(function(response){
        $scope.shipping = response;
    })
    .catch($log.error);
};

$scope.getBilling = function(){AccountService.getBilling()
      .then(function(response){
          $scope.billing = response;
      })
      .catch($log.error);
};

$scope.getShipping();
$scope.getBilling();

});

