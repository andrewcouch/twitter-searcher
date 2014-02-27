var q = require('q');
var qfs = require('q-io/fs');

var config = null;

module.exports = function(filename, force)
{
	if (!filename)
	{
		filename = "config.json";
	}
	return qfs.read(filename)
		.then(function(contents)
			{
				return JSON.parse(contents);
			});
}