const puppeteer = require('puppeteer');
var Scraper = require('images-scraper');
var Discord = require('discord.js');

const google = new Scraper({
  userAgent: 'Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64.0', // the user agent
  puppeteer: {
	headless: true,
	args: ['--no-sandbox'],
  }
});

module.exports = {
  name: 'img',
  aliases: ['image','images','mg','pic','picture'],
	description: 'Get random images from the net!',
	async execute(message, args) {
	      // extract search query from message
	      var search = args.slice(0).join(" ");
	      var nr = 50;

	      if(search === ""){
		message.channel.send("What pic do u want me to search smh!");
		return;
	      }
		
		if(search.endsWith(" 1")){
		  search = search.substring(0,search.length-2);
		  nr = 1;
		}
		
		const results = await google.scrape(search,nr);
		message.channel.send(results[Math.floor(Math.random() * results.length)].url);
	},
};
