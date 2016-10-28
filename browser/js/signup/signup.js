app.config(function($stateProvider) {
    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: '/js/signup/signup.html',
        controller: 'SignupCtrl'
    });
});

app.controller('SignupCtrl', function($state, $scope, SignupFactory, AuthService) {
    $scope.Email = SignupFactory.email;

    $scope.signUp = function() {
        $scope.existsEmail = false;
        SignupFactory.signUp($scope.credentials)
            .then(function(data) {
                if (data === 'exists') {
                    $scope.existsEmail = true
                    return;
                }
                AuthService.login($scope.credentials);
                $state.go('home');
            });
    }
});

app.factory('SignupFactory', function(AuthService, $http) {
    let signUpObj = {};

    signUpObj.email = null;

    signUpObj.signUp = function(credentials) {
        return $http.post('/api/signup', credentials)
            .then(function(result) {
                return result.data;
            })
    }

    return signUpObj;
});
