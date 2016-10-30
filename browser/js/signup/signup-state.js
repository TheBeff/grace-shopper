app.config(function($stateProvider) {
    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: '/js/signup/signup.html',
        controller: 'SignupCtrl'
    })
    .state('confirm', {
      url: '/signup/confirmation',
      templateUrl: '/js/signup/signupConfirm.html'
    });
});

