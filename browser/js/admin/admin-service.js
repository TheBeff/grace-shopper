app.factory('AdminService', function($http){
	
	var AdminService = {};
	var _users = [];

	AdminService.getUsers = function(){
		return $http.get('/api/users')
			.then(function(response){
				angular.copy(response.data, _users);
				console.log(_users);
				return _users;
			});
	};

	AdminService.makeAdmin = function(user){
		return $http.put('/api/users/' + user.id, {isAdmin: true})
			.then(function(){
				console.log('user ' + user.email + ' is admin now');
				AdminService.getUsers();
			});
	};

	AdminService.delete = function(user){
		return $http.delete('/api/users/' + user.id)
			.then(function(){
				console.log('user ' + user.email + ' is gone');
				AdminService.getUsers();
			});
	};

	return AdminService;
});