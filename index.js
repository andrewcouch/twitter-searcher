var q = require('q'),
	get_token = require('./accesstoken.js'),
	get_tweets = require('./gettweets.js'),
	config_loader = require('./config');

//Main thread
//Get AccessToken
//Get config data
//Run a get_the_tweets per query in the config data
//Write config data back to file.
//End and report
var access_token;
q.when(get_token(),function(token) {
		access_token = token;
	})
.then(function(){ return config_loader.read();})
.then(function(config) {
		return map(config.queries,get_the_tweets);
	})
.then(function(result){ return config_loader.write()
	.then(function(){
		return result;
	});})
.then(function(result) {
	console.log("Success:");
		console.log(result);
	},function (result){
		console.log("Error:"+ result)
	});


//From StrongLoop Article about composing Promises
//Could be inlined or consolidated
function map (arr, iterator) {
  // execute the func for each element in the array and collect the results
  var promises = arr.map(function (el) { return iterator(el) })
  return q.all(promises) // return the group promise
}
//Wrapper of get_tweets module.
//Takes in a query object from config.(This is a pointer that will be updated with new data)
//Returns promise to a query object.
function get_the_tweets(query)
{
	return get_tweets(query.q, query.since_id, access_token)
		.then(function(max_id){
			query.since_id = max_id;
			console.log(query);
			return q(query);
		});
}