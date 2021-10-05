const puppeteer = require('puppeteer');
var Scraper = require('images-scraper');
var Discord = require('discord.js');
const fetch = require('node-fetch');

const minimal_args = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
  '--no-sandbox',
];


const google = new Scraper({
  userAgent: 'Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64.0', // the user agent
  puppeteer: {
	headless: true,
	args: minimal_args,
	userDataDir : './cache'
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

    let url = `https://www.googleapis.com/customsearch/v1?key=${process.env['google_search']}&safe=medium&searchType=image&q=${search}&start=1`
    message.channel.send('🔎📷 Searching for: `'+search+'`');
    let json = await fetch_json(url);
    if(json.hasOwnProperty('items')){
      costum_google_search(message, json, search);
    }else{
      fallback_scraper(message, search);
    }
	},
};

const fetch_json = async (url) => {
  let settings = { method: "Get" };
  let res;
  var response = await fetch(url, settings)
  let json = await response.json();
  return json;
}


const costum_google_search = (message, json, search) => {
  var i = 0;
  var msg = message.channel.send(json.items[i].link)
    .then(async function(msg){
              msg.react('⏭')
              msg.react('🔀');
              await msg.awaitReactions(async reaction => {
                if(reaction.emoji.reaction.count > 1){
                  switch(reaction.emoji.name){
                    case '⏭':
                      i++;
                      if((i % json.items.length) == 0){
                        let url = `https://www.googleapis.com/customsearch/v1?key=${process.env['google_search']}&safe=medium&searchType=image&q=${search}&start=${(json.queries.nextPage[0].startIndex)}`
                        json = await fetch_json(url);
                      }
                      break;
                    case '⏮':
                      i--;
                      if(i < json.queries.request[0].startIndex - 1){
                        let url = `https://www.googleapis.com/customsearch/v1?key=${process.env['google_search']}&safe=medium&searchType=image&q=${search}&start=${(json.queries.previousPage[0].startIndex)}`
                        json = await fetch_json(url);
                      }
                      break;
                    case '🔀':
                      i = Math.floor(Math.random() * json.items.length);
                      break;
                  }
                  msg.edit(json.items[i % 10].link);
                  msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                  if(json.queries.hasOwnProperty('previousPage') || i > 0){
                    msg.react('⏮')
                  }
                  msg.react('⏭')
                  msg.react('🔀')
                  
                }
                
          }, {time: 600000});
      })
}

const fallback_scraper = async (message, search) => {
  var i = 0;
  const results = await google.scrape(search,nr);
  var msg = message.channel.send(results[i].url)
    .then(async function(msg){
              msg.react('⏭')
              msg.react('🔀');
              await msg.awaitReactions(reaction => {
                if(reaction.emoji.reaction.count > 1){
                  switch(reaction.emoji.name){
                    case '⏭':
                      i = ++i % results.length;
                      break;
                    case '⏮':
                      i = --i % results.length;
                      break;
                    case '🔀':
                      i = Math.floor(Math.random() * results.length);
                      break;
                  }
                  msg.edit(results[i].url);
                  msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                  if(i == results.length){
                    msg.react('⏮')
                  }else if(i == 0){
                    msg.react('⏭')
                  }else{
                    msg.react('⏮')
                    msg.react('⏭')
                  }
                  msg.react('🔀')
                  
                }
                
          }, {time: 600000});
      })
}