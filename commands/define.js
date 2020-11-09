const fetch = require('node-fetch')

module.exports = {
	name: 'define',
  aliases: ['def'],
	description: 'Gives definition of said word!',
	async execute(message, args) {
      var question = args.slice(0).join(" ");
		
     //RANDOM DEFINITION =================================================================
		
      if(question === ''){
        let url = `http://api.urbandictionary.com/v0/random`;
        let settings = { method: "Get" };
        fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            message.channel.send(`**${json.list[0].word}**\n`+json.list[0].definition)
            return;
        });
        return;
      }
    
    //index to use if you want to get another defintion of the word
    var i = 0;
		
    //AKSED DEFINITION ====================================================================
		
    let url = `http://api.urbandictionary.com/v0/define?term=${question}`;
    let settings = { method: "Get" };
    let res;
    fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
        try{
            var msg = message.channel.send(json.list[i].definition)
            .then(async function(msg){
                msg.react('🔀');
                await msg.awaitReactions(reaction => {
                    if(reaction.emoji.name === '🔀' && reaction.emoji.reaction.count > 1){
                    i++;
                    i = i % json.list.length;
                    msg.edit(json.list[i].definition);
                    msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                    msg.react('🔀');
                    }
                }, {time: 600000});
            })
            
         }catch(err){
            message.channel.send('No definition found. :(');
         }
    })
    return;
	},
};
