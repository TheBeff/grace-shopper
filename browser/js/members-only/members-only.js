app.config(function ($stateProvider) {

    $stateProvider.state('membersOnly', {
        url: '/account',
        templateUrl: 'js/members-only/account.html',
        controller: 
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });

});
