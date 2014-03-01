var q = require('q'),
	btoa = require('btoa'),
	http = require('https'),
	config_loader = require('./config');

//Module reads the access_token from the config file and generates a bearer token from it.

var access_token = '';

//Promised request.
function promise_request()
{
	return q.when(prepare_key(),function(key)
	{
		var options = {
		  host: 'api.twitter.com',
		  port: 443,
		  path: '/oauth2/token',
		  method: 'POST',
		  headers: {'Authorization': 'Basic ' + key,
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
		  body: ["grant_type=client_credentials"],
		  ssl:true
		};
		return options;
	})
	.then(function(options)
	{
	console.log(options);
		var deferred = q.defer();
		var data = '';
		var req = http.request(options, function(res) {
		  res.setEncoding('utf8');
		  res.on('data', function (chunk) {
		    data = data + chunk;
		  });
		  res.on('end',function (){
	//	  	console.log("end request");
		  	deferred.resolve(data);
		  });
		});

		req.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		  deferred.reject(e);
		});

		// write data to request body
		req.write(options.body[0]);
		req.end();

		return deferred.promise;
	});	
}

//Returns a promise for an access_token as a string.
module.exports = function get_token()
{
	return promise_request()
		.then(function (json)
		{
			//console.log(json);
			var res_json = JSON.parse(json);
			if (res_json.token_type !='bearer')
			{
				throw new Error("Invalid Token Type:" + res_json.token_type);
			}
			return res_json.access_token;
		});
}

//Twitter requires some massaging of the key and secret.
function prepare_key()
{
	return config_loader.read().then(function(config)
	{
		var cKey = encodeURIComponent(config.consumer_key);
		var cSecret = encodeURIComponent(config.consumer_secret);
		var combined = btoa(cKey + ':' + cSecret);
		return combined;
	})
};