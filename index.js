var q = require('q'),
	get_token = require('./accesstoken.js'),
	get_tweets = require('./gettweets.js');


q.when(get_token(),function(token) {
		access_token = token;
	})
.then(function() {
		return get_tweets("kindle deal", access_token)
	})
.then(function(result) {
		console.log(result);
	},function (result){
		console.log("Error:"+ result)
	});