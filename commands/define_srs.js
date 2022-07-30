const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

let url;

module.exports = {
	data: new SlashCommandBuilder()
	.setName('dictionary')
	.setDescription('Define a word, seriously!')
  .addStringOption(option => option.setName('word').setDescription('Write a word').setRequired(true)),
	async execute(message) {
    await message.deferReply();
      var question = message.options._hoistedOptions[0].value;

      url = `https://api.dictionaryapi.dev/api/v2/entries/en/${question}`;
      var json = await fetchDefinitions();
      message.editReply({embeds: [embed(json, message)]});
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
  let description = '';
  var embed = new MessageEmbed()  
  
  if(json.hasOwnProperty('title')){
      embed.setTitle(json.title);
      embed.setDescription(description);
      return embed;
    }
    
    embed.setTitle((json[0].word).charAt(0).toUpperCase() + json[0].word.substring(1))

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