const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

let isRandom = false;
let url;

module.exports = {
	name: 'define',
  aliases: ['def'],
	description: 'Gives definition of said word!',
	async execute(message, args) {
    var question = args.slice(0).join(" ");
    url = `http://api.urbandictionary.com/v0/define?term=${question}`;
    if(question === ''){
      url = `http://api.urbandictionary.com/v0/random`;
      isRandom = true;
    }
    
    var json = await fetchDefinitions();
    //index to use
    var i = 0;
    try{
      var msg = message.channel.send(embed(json, i))
      .then(async function(msg){
          if((json.list).length > 1){
            msg.react('🔀');
            await msg.awaitReactions(async reaction => {
                if(reaction.emoji.name === '🔀' && reaction.emoji.reaction.count > 1){
                  if(isRandom && i == json.list.length-1){
                    json = await fetchDefinitions();
                  }
                  i++;
                  i = i % json.list.length;
                  msg.edit(embed(json, i));
                  msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                  msg.react('🔀');
                }
            }, {time: 600000});
          }
          
      })
      
   }catch(err){
      message.channel.send('No definition found. :(');
   }
    return;
	},
  
};


 async function fetchDefinitions(){
  let settings = { method: "Get" };
    let res;
    var response = await fetch(url, settings)
    let json = await response.json();
    return json;
}

function embed(json, i){
  var embed = new MessageEmbed()
          .setTitle((json.list[i].word).charAt(0).toUpperCase() + json.list[i].word.substring(1))
          .setURL(json.list[i].permalink)
          .setDescription(json.list[i].definition)
          .addField('Example:', json.list[i].example, true)
          .setFooter('👍 '+json.list[i].thumbs_up+' 👎 '+json.list[i].thumbs_down);

  return embed;
}
