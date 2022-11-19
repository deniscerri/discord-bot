const fetch = require('node-fetch');
const {SlashCommandBuilder } = require('discord.js');

let url;

module.exports = {
	data: new SlashCommandBuilder()
	.setName('wouldyourather')
	.setDescription('Send a "Would You Rather" Question!'),
	async execute(message) {
        await message.deferReply();
        url = 'https://api.truthordarebot.xyz/v1/wyr'
        var json = await fetchWyr();
        message.editReply({content: json.question || json.message });
	},

};


 async function fetchWyr(){
  let settings = { method: "Get" };
    var response = await fetch(url, settings)
    let json = await response.json();
    return json;
}
