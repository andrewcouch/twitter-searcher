var q = require('q'),
	http = require('https'),
	fsqio = require('q-io/fs');

function promise_request(options)
{
	var deferred = q.defer();
	var data = '';
	var req = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
	    data = data + chunk;
	  });
	  res.on('end',function (){
	  	deferred.resolve(data);
	  });
	});
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	  deferred.reject(e);
	});
	req.end();

	return deferred.promise;
}

module.exports = function get_tweets(query, token)
{
	query = encodeURIComponent(query);
	var options = {
	  host: 'api.twitter.com',
	  port: 443,
	  path: '/1.1/search/tweets.json?q=' + query,
	  method: 'GET',
	  headers: {'Authorization': 'Bearer ' + token},
	  ssl:true
	};

	return promise_request(options)
		.then(function (json){
			return JSON.parse(json);
		})
		.then(function(json)
		{
			return fsqio.write(query+".json",JSON.stringify(json, null, '\t'));
		})
		.then(function(){
			return "done";
		})
		.then(null, record_failure);
}

function record_failure(error)
{
	console.log(error.message);
	console.log(error.stack);
}
