app.config(function($stateProvider){

	$stateProvider
	.state('users', {
		url: '/users',
		templateUrl: 'js/admin/users.html',
		resolve: {
			users: function(AdminService){
				return AdminService.getUsers();
			}
		},
		controller: function($scope, users, AdminService, Session){
			$scope.users = users;
			$scope.makeAdmin = AdminService.makeAdmin;
			$scope.delete = AdminService.delete;
			$scope.thisUser = Session.user;
			$scope.passwordReset = AdminService.passwordReset;
		}
	});

});
