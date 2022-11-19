const fetch = require('node-fetch');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

let url;

module.exports = {
	data: new SlashCommandBuilder()
	.setName('truthordare')
	.setDescription('Play Truth or Dare!')
    .addStringOption(option => 
        option.setName('type')
        .setDescription('Choose which command category to show!')
        .setRequired(true)
        .addChoices(
            { name: 'Truth', value: 'truth' },
            { name: 'Dare', value: 'dare' },
        )
    ),
	async execute(message) {
        await message.deferReply();
        var cmd = message.options._hoistedOptions[0].value;
        url = 'https://api.truthordarebot.xyz/v1/' + cmd
        var json = await fetchTruthOrDare();
        message.editReply({embeds: [embed(json, cmd, message)]});
	},

};


 async function fetchTruthOrDare(){
  let settings = { method: "Get" };
    var response = await fetch(url, settings)
    let json = await response.json();
    return json;
}

function embed(json, choice, message){
    let description = '';
    var embed = new EmbedBuilder()
    if (json.question == undefined){
        embed.setTitle(json.message)
        return embed;
    }
    description += json.question+"\n\n"
    if(choice == 'dare'){
        embed.setTitle(':smiling_imp: ' + message.user.username + ' chose dare!')
        embed.setColor('#880808')
        description+="☞ *If you refuse to do this dare, take a shot!*"
    }else{
        embed.setTitle(':innocent: ' + message.user.username + ' chose truth!')
        embed.setColor('#fdfff5')
        description+="☞ *If you refuse to tell the truth, take a shot!*"
    }
    embed.setDescription(description)
    return embed;
}