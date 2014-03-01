var q = require('q');
var qfs = require('q-io/fs');

//Basic Config reader-writer with promises.
//Stores(caches) the read config object internally to the module.
//There is an expectation that the object pointer returned to config will be used to write to it.
//  This means there is no explicit, update config, but could be added.

var config = null;

module.exports.read = function(filename)
{
	if (!filename)
	{
		filename = "config.json";
	}
	if(!config)
	{
		return qfs.read(filename)
		.then(function(contents)
			{
				console.log("Loaded Config");
				config = JSON.parse(contents);
				console.log(config);
				return config;
			});
	}else{
		console.log("Cached Config");
		return q(config);
	}
}

module.exports.write = function(filename)
{
	if (!filename)
	{
		filename = "config.json";
	}
	if(!config)
	{
		return q('');
	}else{
		return qfs.write(filename, JSON.stringify(config,null,'\t'));
	}	
}