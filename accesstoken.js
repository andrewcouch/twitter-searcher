var q = require('q'),
	qiohttp = require('q-io/http'),
	btoa = require('btoa'),
	http = require('https'),
	config_loader = require('./config');

var access_token = '';

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
		})
		.then(null, record_failure);
}
function record_failure(error)
{
	console.log(error.message);
	console.log(error.stack);
}

function prepare_key()
{
	return config_loader().then(function(config)
	{
		var cKey = encodeURIComponent(config.consumer_key);
		var cSecret = encodeURIComponent(config.consumer_secret);
		var combined = btoa(cKey + ':' + cSecret);
		return combined;
	})
};