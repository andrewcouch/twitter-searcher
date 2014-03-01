#Twitter Searcher

Tinker project to learn q promises in Node.js. Aim is to create an app that can run from the command line to pull and manipulate tweets. 

##Use

As normal with Node, download the project and run 
```
npm install
```
There are only a few dependancies at the moment. q, q-io and btoa.

Construct a *config.json* file for the project

```json
{ 
	"consumer_key": "",
	"consumer_secret": "",
	"queries": [ 
		{ "q": "kindle deal", "since_id": "439689228801552384" } 
  	] 
}
```
*queries* will accept an array of queries. 

Run 
```
node index
```

##Notes and Todo

This is my first project using promises. I expect I have done a few things wrong, but it all works. :)

There are a few places where I built my own promised_request function around the http modul in node. I based it on the q-io/http request function. I was attempting to use q-io for this and failed. I could not get it to work with headers and https. The q-io/fs functions work nicely though.

There is a basic config loader/writer. It deals with one file only and expects byref style passing of the config object for the write to work. This could be improved.

There are a pair of map() functions that I pulled from an article on StrongLoop about promises. They need some refactoring/inlining to remove the code duplication.

##Next steps

Tweets are stored as JSON in files based on their query. Each time the app is run, it remembers the old since_id and does not duplicate tweets, HOWEVER it clears the file, so old tweets are gone. Need to think about what to actually DO with the tweets next.

Test driven development investigation. Mocha?