app.config(function ($stateProvider) {

    $stateProvider.state('account', {
        url: '/account',
        templateUrl: 'js/account/account.html',
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });

});
