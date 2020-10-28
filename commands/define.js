const fetch = require('node-fetch')


module.exports = {
	name: 'define',
  aliases: ['def'],
	description: 'Gives definition of said word! If there are no words said, then it gives a random definition',
	execute(message, args) {
		
	      var question = args.slice(0).join(" ");

	      let settings = { method: "Get" };
		
	      //Random Definition
	      if(question === ''){
		 message.channel.send("Give me a word retard!");
		 let url = `http://api.urbandictionary.com/v0/random`;
		 fetch(url, settings)
		 .then(res => res.json())
		 .then((json) => {
		    message.channel.send(`**${json.list[0].word}**\n`+json.list[0].definition);
		 });
		  return;
	      }
	      
	      //Asked Definition
	      let url = `http://api.urbandictionary.com/v0/define?term=${question}`;
              fetch(url, settings)
		 .then(res => res.json())
		 .then((json) => {
		    try{
           		var msg = message.channel.send(json.list[0].definition);
        	    }catch(err){
            		message.channel.send('No definition found. :(');
        	    }
		 });
	
	},
};
