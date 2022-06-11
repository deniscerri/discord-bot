const Scraper = require('images-scraper');
const {MessageButton, MessageActionRow, ButtonInteraction} = require('discord.js');
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


//navigation buttons
let next = new MessageButton()
.setCustomId("next")
.setLabel("Next")
.setStyle("PRIMARY")
let prev = new MessageButton()
  .setCustomId("prev")
  .setLabel("Previous")
  .setStyle("PRIMARY")  
let random = new MessageButton()
  .setCustomId("random")
  .setLabel("Random Result")
  .setStyle("PRIMARY")  


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
      message.channel.send({content: "What pic do u want me to search?"});
      return;
    }
    let url = `https://www.googleapis.com/customsearch/v1?key=${process.env['google_search']}&safe=medium&searchType=image&q=${search}&start=1`
    message.channel.send({content: '🔎📷 Searching for: `'+search+'`'});
    let json = await fetch_json(url);
    if(json.hasOwnProperty('items')){
      costum_google_search(message, json, search);
    }else{
      fallback_scraper(message, search, nr);
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
  let row = new MessageActionRow().addComponents(next, random);
  var msg = message.channel.send({content: json.items[i].link, components: [row]})
    .then(async function(msg){
      const collector = msg.createMessageComponentCollector({
        time: 600000
      })
      
      collector.on("collect", async (ButtonInteraction) => {
        ButtonInteraction.deferUpdate();
        const id = ButtonInteraction.customId;
        switch(id){
          case 'next':
            i++;
            if((i % json.items.length) == 0){
              let url = `https://www.googleapis.com/customsearch/v1?key=${process.env['google_search']}&safe=medium&searchType=image&q=${search}&start=${(json.queries.nextPage[0].startIndex)}`
              json = await fetch_json(url);
            }
            
            break;
          case 'prev':
            i--;
            if(i < json.queries.request[0].startIndex - 1){
              let url = `https://www.googleapis.com/customsearch/v1?key=${process.env['google_search']}&safe=medium&searchType=image&q=${search}&start=${(json.queries.previousPage[0].startIndex)}`
              json = await fetch_json(url);
            }
            break;
          case 'random':
            i = Math.floor(Math.random() * json.items.length);
            break;
        }

        row = new MessageActionRow();
        if(json.queries.hasOwnProperty('previousPage') || i > 0){
          row.addComponents(prev);
        }
        row.addComponents(next);
        row.addComponents(random);
        
        msg.edit({content: json.items[i%10].link, components: [row]})
        
      })
    })
}


const fallback_scraper = async (message, search, nr) => {
  var i = 0;
  const results = await google.scrape(search,nr);
    let row = new MessageActionRow().addComponents(next,random);
    var i = 0;
    var msg = message.channel.send({content: results[i].url, components: [row]})
      .then(async function(msg){
        const collector = msg.createMessageComponentCollector({
          time: 600000
        });

        collector.on("collect", async (ButtonInteraction) => {
            ButtonInteraction.deferUpdate();
            const id = ButtonInteraction.customId;
            switch(id){
                case 'next':
                    i = ++i % results.length;
                    break;
                case 'prev':
                    i = --i % results.length;
                    break;
                case 'random':
                    i = Math.floor(Math.random() * results.length);
                    break;
                }
            row = new MessageActionRow();
            if(i == results.length){
                row.addComponents(prev);
            }else if(i == 0){
                row.addComponents(next);
            }else{
                row.addComponents(prev);
                row.addComponents(next);
            }
            row.addComponents(random);

            msg.edit({content: results[i].url, components: [row]});
        });

        collector.on("end", (ButtonInteraction) => {
            msg.edit({content: results[i].url});
        })
      })
}
