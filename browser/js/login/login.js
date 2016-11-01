app.config(function ($stateProvider) {

    $stateProvider
    .state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    })
    .state('forgot', {
        url: '/forgot',
        templateUrl: 'js/login/forgot.html',
        controller: function($scope, $http){
            $scope.sendForgot = function(){
                return $http.post('/api/forgot/', {email: $scope.forgot.email})
                    .then(function(response){
                        console.log(response.data);
                    });
            };
        }
    })
    .state('reset', {
        url: '/reset/:tokenId',
        templateUrl: 'js/login/reset.html',
        controller: function($scope, $http, $stateParams){
            $scope.resetPassword = function(){
                return $http.post('/api/forgot/reset/' + $stateParams.tokenId, {password: $scope.credentials.password})
                    .then(function(){
                        console.log('password reset');
                    });
            };
        }
    });

});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };

});
