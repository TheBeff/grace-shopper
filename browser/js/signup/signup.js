app.config(function($stateProvider) {
    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: '/js/signup/signup.html',
        controller: 'SignupCtrl'
    });
});

app.controller('SignupCtrl', function($scope, SignupFactory) {

    $scope.signUp = function() {
        SignupFactory.signUp($scope.credentials)
            .then(function(email) {
                $scope.Email = email;
            });
    }
});

app.factory('SignupFactory', function($http) {
    let signUpObj = {};

    signUpObj.email = null;

    signUpObj.signUp = function(credentials) {
        return $http.post('/api/signup', credentials)
            .then(function(user) {
                signUpObj.email = user.data.email;
                return signUpObj.email;
            })
    }

    return signUpObj;
});

var compareTo = function() {
    return {
        require: 'ngModel',
        scope: {
            otherModelValue: '=compareTo'
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch('otherModelValue', function() {
                ngModel.$validate();
            });
        }
    };
};

app.directive('compareTo', compareTo);
