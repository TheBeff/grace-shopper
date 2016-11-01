var router = require('express').Router();
var crypto = require('crypto');
const User = require('../../../db').models.User;
const sendConfirmation = require('../../email');


module.exports = router;

router.post('/', function(req, res, next) {

	var token = crypto.randomBytes(16).toString('base64');

	User.update({
		resetPasswordToken: token,
		resetPasswordExpires: Date.now() + 3600000
	}, {
		where: {
			email: req.body.email
		}
	})
		.then(function(){
			console.log('user password token created');
			return User.findOne({
				where: {
					email: req.body.email
				}
			});
		})
			.then(function(updatedUser){
				let user = updatedUser.get();
				sendConfirmation({ email: user.email, resetPasswordToken: token }, 'reset');
				res.send(user);
			})
				.catch(next);
});

router.post('/reset/:tokenId', function(req, res, next){
	User.findOne({
		where: {
			resetPasswordToken: req.params.tokenId
		}
	})
	.then(function(user){
		if (user && user.resetPasswordExpires > Date.now()){
			var salt = User.generateSalt();
			return User.update({
				salt: salt,
				password: User.encryptPassword(req.body.password, salt),
				resetPasswordToken: null,
				resetPasswordExpires: null
			}, {
				where: {resetPasswordToken: req.params.tokenId}
			})
				.then(function(){
					console.log('password reset');
					res.send(200);
				});
		} else {
			res.send('incorrect user or reset token has expired');
		}
	})
	.catch(next);
});
