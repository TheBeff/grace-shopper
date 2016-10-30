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
