var cheerio = require("cheerio"); 
var request = require("request"); 
const api = require('imageapi.js');
var Discord = require('discord.js');

module.exports = {
  name: 'img',
	description: 'Get random images from the net!',
	execute(message, args) {
      
		
      // extract search query from message

      var search = args.slice(0).join(" "); 

      if(search.endsWith(" 1")){
        search = search.substring(0,search.length-2);
      }

      if(search === ""){
        message.channel.send("What pic do u want me to search smh!");
        return;
      }

      

      var options = {
          url: "https://results.dogpile.com/serp?qc=images&q=" + search,
          method: "GET",
          headers: {
              "Accept": "text/html",
              "User-Agent": "Chrome"
          }
      };
      request(options, function(error, response, responseBody) {
        if (error) {
        // handle error
        return;
        }

        $ = cheerio.load(responseBody); // load responseBody into cheerio (jQuery)

        // In this search engine they use ".image a.link" as their css selector for image links 
              // var links = $(".image a.link"); 
              var allLinks = $(".link");
              var links = allLinks.splice(1, allLinks.length)

        // We want to fetch the URLs not the DOM nodes, we do this with jQuery's .attr() function
        // this line might be hard to understand but it goes thru all the links (DOM) and stores each url in an array called urls
              var urls = new Array(links.length).fill(0).map((v, i) => links[i].attribs.href);
              // var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
        if (!urls.length) {
        // Handle no results
        return;
              }
              
              // Return a random image
              var imageIndexToReturn = Math.floor(Math.random() * urls.length)


        // Send result

              if(search.endsWith(" 1")){
                imageIndexToReturn = Math.floor(Math.random() * 5);
              }

              var output = message.channel.send( urls[imageIndexToReturn]);





              urls.splice(0, urls.length);


              
              
      });

  return;



	},
};








 