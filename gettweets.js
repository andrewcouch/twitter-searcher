var q = require('q'),
	http = require('https'),
	fsqio = require('q-io/fs');

//Promised Request (no writes) Currently very similar to promise_request in accesstoken.js
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

//Gets one group of tweets and recursively asks for more until Twitter says there are no more.
//Returns a promise to a max_id of the batch.
//filekey : which file to write tweets to.
//since_id : since which tweet to retrieve
//max_id : max_id for first call of get_tweets. used to bubble down and return through recursion.
function get_tweets(filekey, query, since_id, token, max_id)
{
	//Reduces tweet to only needed fields for project. 
	function reduce_tweet(json)
	{
		var new_json = {};
		new_json.created_at = json.created_at;
		new_json.id_str = json.id_str;
		new_json.text = json.text;
		new_json.user = {};
		new_json.user.id_str = json.user.id_str;
		new_json.user.screen_name = json.user.screen_name;
		new_json.user.name = json.user.name;
		new_json.user.followers_count = json.user.followers_count;
		new_json.retweet_count = json.retweet_count;
		new_json.favorite_count = json.favorite_count;
		new_json.entities = {};
		new_json.entities.hashtags = json.entities.hashtags;
		new_json.entities.urls = json.entities.urls;
		new_json.entities.user_mentions = json.entities.user_mentions;
//console.log(json.id_str);
		return fsqio.append(filekey+".json",JSON.stringify(new_json, null, '\t')+',');
	}

	//Always add the since id. Next_results from the search_metadata is helpful for paging, but doesn't retain since_id
	query = query.replace("?","?since_id=" + since_id + "&");
	console.log(query);	
	var options = {
	  host: 'api.twitter.com',
	  port: 443,
	  path: '/1.1/search/tweets.json' + query,
	  method: 'GET',
	  headers: {'Authorization': 'Bearer ' + token},
	  ssl:true
	};
	var next_results;
	return promise_request(options)
		.then(function(contents)
		{
			json = JSON.parse(contents);
			console.log(json.search_metadata);
			console.log(json.statuses.length);
			next_results = json.search_metadata.next_results;
			if (!max_id)
			{
				max_id = json.search_metadata.max_id_str;
			}
			if(json.statuses.length > 0 )
			{
				return map(json.statuses,reduce_tweet)
				.then(function(){
							if (!next_results)
							{
								console.log("end inside");
								return max_id;
							}
							else
							{
								return get_tweets(filekey,next_results,since_id,token,max_id);
							}
						});
			}
			else{
				console.log("end no results");
				return max_id;
			}
		})
		
}

//From StrongLoop article about composing q promises. Could inline it.
function map (arr, iterator) {
  // execute the func for each element in the array and collect the results
  var promises = arr.map(function (el) { return iterator(el) });
  return q.all(promises); // return the group promise
}

//Entry function wrapping the recursive call.
//Returns a promise to the max_id of the batch.
module.exports = function get_all_tweets(query, since_id, token)
{
	query = encodeURIComponent(query);
	var filekey = query;
	var max_id_str;
	query = "?count=50&q=" + query;
	return fsqio.write(filekey+".json","[")
		.then(function() {return get_tweets(filekey,query,since_id,token)})
		.then(function(max_id) {
			max_id_str = max_id;
			return fsqio.append(filekey+".json","]")
		})
		.then(function(){
			return max_id_str;
		});
}