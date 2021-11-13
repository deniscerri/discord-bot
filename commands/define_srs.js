const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

let url;

module.exports = {
	name: 'definesrs',
    aliases: ['defsrs','defser','defs', 'dic'],
	description: 'Gives definition of said word, seriously!',
	async execute(message, args) {
        var question = args.slice(0).join(" ");
        url = `https://api.dictionaryapi.dev/api/v2/entries/en/${question}`;
        if(question === ''){
        return message.channel.send({content: "Write a word you need the definition for!"})
        }

        var json = await fetchDefinitions();
        message.channel.send({embeds: [embed(json, message)]});

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

function embed(json, message){
    if(json.title){
        return message.channel.send({content: 'No definition found. :('});
    }

    let description = '';
    var embed = new MessageEmbed()
      .setTitle((json[0].word).charAt(0).toUpperCase() + json[0].word.substring(1))

    for(var i = 0; i < json[0].meanings.length; i++){
      let meaning = json[0].meanings[i];
      description += `**Meaning ${(i+1)}** *${meaning.partOfSpeech}*\n`;
      for(var j = 0; j < meaning.definitions.length; j++){
        let def = meaning.definitions[j];
        description += `**${(j+1)}.** ${def.definition} \n`;
        if(def.example){
          description += `*Example: ${def.example || '...'}* \n`;
        }
      }
      description += '\n\n';
    }

    embed.setDescription(description);

  return embed;
}