app.controller('SignupCtrl', function($state, $scope, SignupFactory, AuthService) {
    $scope.Email = SignupFactory.email;

    $scope.signUp = function() {
        $scope.existsEmail = false;
        SignupFactory.signUp($scope.credentials)
            .then(function(data) {
                if (data === 'exists') {
                    $scope.existsEmail = true;
                    return;
                }
                AuthService.login($scope.credentials);
                $state.go('confirm');
            });
    };
});
